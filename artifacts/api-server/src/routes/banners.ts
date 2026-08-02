import { Router, type IRouter } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/banners", async (_req, res): Promise<void> => {
  const banners = await db
    .select()
    .from(bannersTable)
    .where(eq(bannersTable.isActive, true))
    .orderBy(asc(bannersTable.sortOrder));

  res.json(banners.map(b => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
  })));
});

export default router;
