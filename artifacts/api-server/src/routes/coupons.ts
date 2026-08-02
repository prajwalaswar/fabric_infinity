import { Router, type IRouter } from "express";
import { db, couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const { code, orderAmount } = req.body;

  if (!code || !orderAmount) {
    res.status(400).json({ error: "code and orderAmount are required" });
    return;
  }

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, String(code).toUpperCase()))
    .limit(1);

  if (!coupon || !coupon.isActive) {
    res.status(400).json({ error: "Invalid or expired coupon code" });
    return;
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ error: "Coupon usage limit reached" });
    return;
  }

  const minOrder = parseFloat(coupon.minOrder as string ?? "0");
  if (orderAmount < minOrder) {
    res.status(400).json({ error: `Minimum order amount of ₹${minOrder} required` });
    return;
  }

  const discountValue = parseFloat(coupon.discountValue as string);
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * discountValue) / 100;
  } else {
    discountAmount = Math.min(discountValue, orderAmount);
  }

  res.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: `Coupon applied! You save ₹${discountAmount.toFixed(2)}`,
  });
});

export default router;
