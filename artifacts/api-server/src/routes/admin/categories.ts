import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

router.get("/admin/categories", requireAdmin, async (_req, res): Promise<void> => {
  const categories = await db.select({
    id: categoriesTable.id, name: categoriesTable.name, slug: categoriesTable.slug,
    image: categoriesTable.image, createdAt: categoriesTable.createdAt,
    productCount: sql<number>`count(${productsTable.id})`,
  })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.name);

  res.json(categories.map(c => ({
    ...c,
    productCount: Number(c.productCount),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  })));
});

router.post("/admin/categories", requireAdmin, async (req, res): Promise<void> => {
  const { name, image } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }

  const [cat] = await db.insert(categoriesTable).values({ name, slug: slugify(name), image }).returning();
  res.status(201).json({ ...cat, productCount: 0, createdAt: cat.createdAt.toISOString() });
});

router.put("/admin/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, image } = req.body;
  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
  if (image !== undefined) updates.image = image;

  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json({ ...cat, productCount: 0, createdAt: cat.createdAt.toISOString() });
});

router.delete("/admin/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Category not found" }); return; }
  res.sendStatus(204);
});

export default router;
