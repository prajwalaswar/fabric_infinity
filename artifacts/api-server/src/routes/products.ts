import { Router, type IRouter } from "express";
import { eq, ilike, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable, reviewsTable } from "@workspace/db";

const router: IRouter = Router();

function formatProduct(p: typeof productsTable.$inferSelect & { categoryName?: string; averageRating?: number; reviewCount?: number }) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    fabricDetails: p.fabricDetails,
    price: parseFloat(p.price as string),
    offerPrice: p.offerPrice ? parseFloat(p.offerPrice as string) : null,
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: p.categoryName ?? "",
    images: p.images ?? [],
    variants: p.variants,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    isNewArrival: p.isNewArrival,
    isActive: p.isActive,
    averageRating: p.averageRating != null ? p.averageRating : undefined,
    reviewCount: p.reviewCount ?? 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const { category, search, priceMin, priceMax, sort, page = "1", limit = "24", featured, bestseller, newArrival } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 24, 100);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(productsTable.isActive, true)];

  if (category) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat[0]) conditions.push(eq(productsTable.categoryId, cat[0].id));
  }
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (priceMin) conditions.push(gte(productsTable.price, priceMin));
  if (priceMax) conditions.push(lte(productsTable.price, priceMax));
  if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
  if (bestseller === "true") conditions.push(eq(productsTable.isBestseller, true));
  if (newArrival === "true") conditions.push(eq(productsTable.isNewArrival, true));

  let orderBy = desc(productsTable.createdAt);
  if (sort === "price_asc") orderBy = asc(productsTable.price);
  else if (sort === "price_desc") orderBy = desc(productsTable.price);
  else if (sort === "popular") orderBy = desc(productsTable.isBestseller);

  const where = and(...conditions);

  const [products, countResult] = await Promise.all([
    db.select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    products: products.map(({ product, categoryName }) => formatProduct({ ...product, categoryName: categoryName ?? "" })),
    total,
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.isActive, true)))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(products.map(({ product, categoryName }) => formatProduct({ ...product, categoryName: categoryName ?? "" })));
});

router.get("/products/bestsellers", async (_req, res): Promise<void> => {
  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isBestseller, true), eq(productsTable.isActive, true)))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(products.map(({ product, categoryName }) => formatProduct({ ...product, categoryName: categoryName ?? "" })));
});

router.get("/products/new-arrivals", async (_req, res): Promise<void> => {
  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isNewArrival, true), eq(productsTable.isActive, true)))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(products.map(({ product, categoryName }) => formatProduct({ ...product, categoryName: categoryName ?? "" })));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Product not found" }); return; }

  // Get average rating and review count
  const [ratingRow] = await db
    .select({
      avg: sql<number>`avg(${reviewsTable.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, id));

  res.json(formatProduct({
    ...row.product,
    categoryName: row.categoryName ?? "",
    averageRating: ratingRow?.avg ? parseFloat(String(ratingRow.avg)) : null,
    reviewCount: Number(ratingRow?.count ?? 0),
  }));
});

export default router;
