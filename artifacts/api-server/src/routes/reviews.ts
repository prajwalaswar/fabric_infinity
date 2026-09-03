import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const { productId } = req.query as { productId?: string };

  let query = db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)).$dynamic();
  const parsedProductId = productId ? parseInt(String(productId), 10) : NaN;
  if (!isNaN(parsedProductId)) {
    query = query.where(eq(reviewsTable.productId, parsedProductId));
  }

  const reviews = await query.limit(50);
  res.json(reviews.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  })));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const { productId, customerName, rating, comment } = req.body;

  if (!productId || !customerName || !rating) {
    res.status(400).json({ error: "productId, customerName, and rating are required" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ productId: Number(productId), customerName, rating: Number(rating), comment })
    .returning();

  res.status(201).json({
    ...review,
    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : String(review.createdAt),
  });
});

export default router;
