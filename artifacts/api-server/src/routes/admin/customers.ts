import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { ilike, sql } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/admin/customers", requireAdmin, async (req, res): Promise<void> => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const offset = (pageNum - 1) * limitNum;

  const where = search ? ilike(ordersTable.customerEmail, `%${search}%`) : undefined;

  const [customersRaw, countRaw] = await Promise.all([
    db.select({
      customerName: sql<string>`max(${ordersTable.customerName})`,
      customerEmail: ordersTable.customerEmail,
      customerPhone: sql<string>`max(${ordersTable.customerPhone})`,
      orderCount: sql<number>`count(*)`,
      totalSpent: sql<number>`coalesce(sum(${ordersTable.total}::numeric), 0)`,
      lastOrderAt: sql<Date>`max(${ordersTable.createdAt})`,
    })
      .from(ordersTable)
      .where(where)
      .groupBy(ordersTable.customerEmail)
      .orderBy(sql`max(${ordersTable.createdAt}) desc`)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(distinct ${ordersTable.customerEmail})` }).from(ordersTable).where(where),
  ]);

  res.json({
    customers: customersRaw.map(c => ({
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      customerPhone: c.customerPhone,
      orderCount: Number(c.orderCount),
      totalSpent: parseFloat(String(c.totalSpent)),
      lastOrderAt: String(c.lastOrderAt),
    })),
    total: Number(countRaw[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

export default router;
