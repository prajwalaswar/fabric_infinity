import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

function fmtOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id, orderNumber: o.orderNumber, customerName: o.customerName,
    customerEmail: o.customerEmail, customerPhone: o.customerPhone,
    address: o.address, items: o.items,
    subtotal: parseFloat(o.subtotal as string),
    shippingCharge: parseFloat(o.shippingCharge as string ?? "0"),
    discount: parseFloat(o.discount as string ?? "0"),
    total: parseFloat(o.total as string),
    paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    paymentId: o.paymentId, razorpayOrderId: o.razorpayOrderId,
    orderStatus: o.orderStatus, trackingNumber: o.trackingNumber,
    shippingProvider: o.shippingProvider, couponCode: o.couponCode, notes: o.notes,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : String(o.updatedAt),
  };
}

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const { status, search, page = "1", limit = "20", paymentStatus } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (status) conditions.push(eq(ordersTable.orderStatus, status));
  if (paymentStatus) conditions.push(eq(ordersTable.paymentStatus, paymentStatus));
  if (search) conditions.push(ilike(ordersTable.orderNumber, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, countRow] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json({ orders: orders.map(fmtOrder), total: Number(countRow[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.get("/admin/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(fmtOrder(order));
});

router.put("/admin/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { orderStatus, paymentStatus, trackingNumber, shippingProvider, notes } = req.body;
  const updates: Partial<typeof ordersTable.$inferInsert> = {};
  if (orderStatus !== undefined) updates.orderStatus = orderStatus;
  if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
  if (shippingProvider !== undefined) updates.shippingProvider = shippingProvider;
  if (notes !== undefined) updates.notes = notes;

  const [order] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(fmtOrder(order));
});

export default router;
