import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

function fmtProduct(p: typeof productsTable.$inferSelect & { categoryName?: string }) {
  return {
    id: p.id, name: p.name, slug: p.slug,
    description: p.description, fabricDetails: p.fabricDetails,
    price: parseFloat(p.price as string),
    offerPrice: p.offerPrice ? parseFloat(p.offerPrice as string) : null,
    stock: p.stock, categoryId: p.categoryId, categoryName: p.categoryName ?? "",
    images: p.images ?? [], variants: p.variants,
    isFeatured: p.isFeatured, isBestseller: p.isBestseller,
    isNewArrival: p.isNewArrival, isActive: p.isActive,
    averageRating: null, reviewCount: 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

router.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const { search, category, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countRow] = await Promise.all([
    db.select({ product: productsTable, categoryName: categoriesTable.name })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(productsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  res.json({
    products: products.map(({ product, categoryName }) => fmtProduct({ ...product, categoryName: categoryName ?? "" })),
    total: Number(countRow[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

router.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const { name, description, fabricDetails, price, offerPrice, stock, categoryId, images, variants, isFeatured, isBestseller, isNewArrival, isActive } = req.body;

  if (!name || !price) {
    res.status(400).json({ error: "name and price are required" });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    name, slug: slugify(name), description, fabricDetails,
    price: String(price),
    offerPrice: offerPrice ? String(offerPrice) : null,
    stock: Number(stock ?? 0), categoryId: categoryId ? Number(categoryId) : null,
    images: images ?? [], variants,
    isFeatured: Boolean(isFeatured), isBestseller: Boolean(isBestseller),
    isNewArrival: Boolean(isNewArrival), isActive: isActive !== false,
  }).returning();

  res.status(201).json(fmtProduct(product));
});

router.get("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id)).limit(1);

  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(fmtProduct({ ...row.product, categoryName: row.categoryName ?? "" }));
});

router.put("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, description, fabricDetails, price, offerPrice, stock, categoryId, images, variants, isFeatured, isBestseller, isNewArrival, isActive } = req.body;

  const updates: Partial<typeof productsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (fabricDetails !== undefined) updates.fabricDetails = fabricDetails;
  if (price !== undefined) updates.price = String(price);
  if (offerPrice !== undefined) updates.offerPrice = offerPrice !== null ? String(offerPrice) : null;
  if (stock !== undefined) updates.stock = Number(stock);
  if (categoryId !== undefined) updates.categoryId = categoryId ? Number(categoryId) : null;
  if (images !== undefined) updates.images = images;
  if (variants !== undefined) updates.variants = variants;
  if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
  if (isBestseller !== undefined) updates.isBestseller = Boolean(isBestseller);
  if (isNewArrival !== undefined) updates.isNewArrival = Boolean(isNewArrival);
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json(fmtProduct(product));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

export default router;
