import { Router, type IRouter } from "express";
import { db, ordersTable, couponsTable, settingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import Razorpay from "razorpay";

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, key))
    .limit(1);
  return row?.value ?? null;
}

/**
 * Resolve the Razorpay credentials. Keys saved from the owner dashboard
 * (Settings → Payments) take priority; environment variables are the fallback
 * so Replit Secrets keep working too.
 */
async function getRazorpayKeys(): Promise<{ keyId: string; keySecret: string } | null> {
  const [idRow, secretRow] = await Promise.all([
    getSetting("razorpayKeyId"),
    getSetting("razorpayKeySecret"),
  ]);
  const keyId = idRow || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = secretRow || process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

const router: IRouter = Router();

function generateOrderNumber(): string {
  return `FI${Date.now().toString(36).toUpperCase()}`;
}

function getRazorpay(keys: { keyId: string; keySecret: string }): Razorpay {
  return new Razorpay({
    key_id: keys.keyId,
    key_secret: keys.keySecret,
  });
}

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    address: o.address,
    items: o.items,
    subtotal: parseFloat(o.subtotal as string),
    shippingCharge: parseFloat(o.shippingCharge as string ?? "0"),
    discount: parseFloat(o.discount as string ?? "0"),
    total: parseFloat(o.total as string),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    paymentId: o.paymentId,
    razorpayOrderId: o.razorpayOrderId,
    orderStatus: o.orderStatus,
    trackingNumber: o.trackingNumber,
    shippingProvider: o.shippingProvider,
    couponCode: o.couponCode,
    notes: o.notes,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : String(o.updatedAt),
  };
}

async function getShippingCharge(subtotal: number): Promise<number> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "standardShippingCharge")).limit(1);
  const [freeRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "freeShippingThreshold")).limit(1);
  const shipping = parseFloat(row?.value ?? "60");
  const freeThreshold = parseFloat(freeRow?.value ?? "999");
  return subtotal >= freeThreshold ? 0 : shipping;
}

router.post("/orders", async (req, res): Promise<void> => {
  const { customerName, customerEmail, customerPhone, address, items, paymentMethod, couponCode, notes } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !address || !items || !paymentMethod) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const itemsStr = typeof items === "string" ? items : JSON.stringify(items);
  const parsedItems = typeof items === "string" ? JSON.parse(items) : items;

  const subtotal = parsedItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const shippingCharge = await getShippingCharge(subtotal);

  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, String(couponCode).toUpperCase())).limit(1);
    if (coupon && coupon.isActive) {
      const discountValue = parseFloat(coupon.discountValue as string);
      discount = coupon.discountType === "percentage" ? (subtotal * discountValue) / 100 : Math.min(discountValue, subtotal);
      appliedCoupon = coupon;
    }
  }

  const total = Math.max(0, subtotal + shippingCharge - discount);
  const orderNumber = generateOrderNumber();

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      address: typeof address === "string" ? address : JSON.stringify(address),
      items: itemsStr,
      subtotal: subtotal.toFixed(2),
      shippingCharge: shippingCharge.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "new",
      couponCode: couponCode || null,
      notes: notes || null,
    })
    .returning();

  // Increment coupon usage
  if (appliedCoupon) {
    await db.update(couponsTable).set({ usedCount: sql`${couponsTable.usedCount} + 1` }).where(eq(couponsTable.id, appliedCoupon.id));
  }

  let razorpayOrderId: string | null = null;
  let razorpayKeyId: string | null = null;

  if (paymentMethod === "razorpay") {
    const keys = await getRazorpayKeys();
    if (!keys) {
      res.status(400).json({
        error:
          "Online payments are not configured yet. Please choose Cash on Delivery, or ask the store owner to add their Razorpay keys in the dashboard (Settings → Payments).",
      });
      return;
    }
    try {
      const razorpay = getRazorpay(keys);
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // in paise
        currency: "INR",
        receipt: orderNumber,
      });
      razorpayOrderId = rzpOrder.id;
      razorpayKeyId = keys.keyId;

      await db.update(ordersTable).set({ razorpayOrderId: rzpOrder.id }).where(eq(ordersTable.id, order.id));
    } catch (err) {
      req.log.error({ err }, "Failed to create Razorpay order");
      res.status(502).json({
        error:
          "Payment gateway could not be reached. Please try again in a moment, or choose Cash on Delivery.",
      });
      return;
    }
  }

  res.status(201).json({
    order: formatOrder(order),
    razorpayOrderId,
    razorpayKeyId,
    amount: paymentMethod === "razorpay" ? total : null,
  });
});

router.get("/orders/:orderNumber", async (req, res): Promise<void> => {
  const orderNumber = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, orderNumber))
    .limit(1);

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

router.post("/payments/razorpay/verify", async (req, res): Promise<void> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNumber } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderNumber) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const secret = (await getSetting("razorpayKeySecret")) || process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) {
    res.status(400).json({ success: false, orderNumber, message: "Payment gateway is not configured" });
    return;
  }
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ success: false, orderNumber, message: "Payment verification failed" });
    return;
  }

  await db
    .update(ordersTable)
    .set({ paymentStatus: "paid", paymentId: razorpayPaymentId, orderStatus: "processing" })
    .where(eq(ordersTable.orderNumber, orderNumber));

  res.json({ success: true, orderNumber, message: "Payment verified successfully" });
});

export default router;
