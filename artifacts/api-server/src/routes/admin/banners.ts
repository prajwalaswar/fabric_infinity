import { Router, type IRouter } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

function fmtBanner(b: typeof bannersTable.$inferSelect) {
  return { ...b, createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt) };
}

router.get("/admin/banners", requireAdmin, async (_req, res): Promise<void> => {
  const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder));
  res.json(banners.map(fmtBanner));
});

router.post("/admin/banners", requireAdmin, async (req, res): Promise<void> => {
  const { image, title, subtitle, ctaText, ctaLink, isActive, sortOrder } = req.body;
  if (!image) { res.status(400).json({ error: "image is required" }); return; }

  const [banner] = await db.insert(bannersTable).values({
    image, title, subtitle, ctaText, ctaLink,
    isActive: isActive !== false,
    sortOrder: Number(sortOrder ?? 0),
  }).returning();
  res.status(201).json(fmtBanner(banner));
});

router.put("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { image, title, subtitle, ctaText, ctaLink, isActive, sortOrder } = req.body;
  const updates: Partial<typeof bannersTable.$inferInsert> = {};
  if (image !== undefined) updates.image = image;
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (ctaText !== undefined) updates.ctaText = ctaText;
  if (ctaLink !== undefined) updates.ctaLink = ctaLink;
  if (isActive !== undefined) updates.isActive = Boolean(isActive);
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);

  const [banner] = await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Banner not found" }); return; }
  res.json(fmtBanner(banner));
});

router.delete("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(bannersTable).where(eq(bannersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Banner not found" }); return; }
  res.sendStatus(204);
});

export default router;
