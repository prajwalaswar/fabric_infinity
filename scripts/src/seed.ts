import { db, categoriesTable, productsTable, bannersTable, settingsTable, couponsTable, reviewsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Categories
  const [cats] = await db.insert(categoriesTable).values([
    { name: "Cotton Fabrics", slug: "cotton-fabrics" },
    { name: "Handblock Prints", slug: "handblock-prints" },
    { name: "Ajrakh Collection", slug: "ajrakh-collection" },
    { name: "Dupattas", slug: "dupattas" },
    { name: "Sarees", slug: "sarees" },
    { name: "Dress Materials", slug: "dress-materials" },
  ]).returning().onConflictDoNothing();

  const allCats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));
  console.log("Categories seeded:", allCats.length);

  // Products using attached product photos
  const productImages = [
    ["/api/uploads/placeholder"],
  ];

  await db.insert(productsTable).values([
    {
      name: "Ajrakh Handblock Floral Print Cotton Fabric",
      slug: "ajrakh-handblock-floral-cotton-" + Date.now().toString(36),
      description: "Beautiful Ajrakh handblock floral print cotton fabric with traditional motifs. Perfect for kurtas, salwar suits, and ethnic wear. Handcrafted by skilled artisans using natural dyes.",
      fabricDetails: "100% Cotton | Handblock Printed | Width: 44 inches | Length per meter",
      price: "1899",
      offerPrice: "1499",
      stock: 45,
      categoryId: catMap["handblock-prints"] || catMap["ajrakh-collection"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.24.12-PM_1785595081554.jpeg"],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      isActive: true,
    },
    {
      name: "Indigo Blue Ajrakh Cotton Print Fabric",
      slug: "indigo-ajrakh-cotton-" + (Date.now() + 1).toString(36),
      description: "Classic indigo blue Ajrakh print cotton fabric with intricate geometric patterns. A timeless design rooted in the Kutch craft tradition.",
      fabricDetails: "100% Cotton | Ajrakh Print | Width: 44 inches",
      price: "1699",
      offerPrice: null,
      stock: 30,
      categoryId: catMap["ajrakh-collection"] || catMap["cotton-fabrics"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.24.13-PM-1_1785595081554.jpeg"],
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      isActive: true,
    },
    {
      name: "Premium Cambric Cotton Plain Fabric",
      slug: "cambric-cotton-plain-" + (Date.now() + 2).toString(36),
      description: "Soft and breathable cambric cotton plain fabric ideal for everyday wear. Available in a range of beautiful earthy tones.",
      fabricDetails: "100% Cambric Cotton | Plain | Width: 58 inches",
      price: "850",
      offerPrice: "700",
      stock: 120,
      categoryId: catMap["cotton-fabrics"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.24.38-PM-1_1785595081555.jpeg"],
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      isActive: true,
    },
    {
      name: "Silk Dupatta with Handblock Print",
      slug: "silk-handblock-dupatta-" + (Date.now() + 3).toString(36),
      description: "Elegant silk dupatta with handblock print. Lightweight and perfect for festive occasions. Features traditional floral motifs with delicate border work.",
      fabricDetails: "Pure Silk | Handblock Printed | Size: 100x200cm",
      price: "2499",
      offerPrice: "1999",
      stock: 18,
      categoryId: catMap["dupattas"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.25.04-PM-1_1785595081555.jpeg"],
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      isActive: true,
    },
    {
      name: "Ikat Cotton Dress Material Set",
      slug: "ikat-cotton-dress-material-" + (Date.now() + 4).toString(36),
      description: "Beautiful ikat cotton dress material set with matching dupatta. Features vibrant woven patterns typical of the Pochampally tradition.",
      fabricDetails: "Ikat Cotton | Woven | Set includes 2.5m fabric + 2m dupatta",
      price: "3299",
      offerPrice: "2599",
      stock: 25,
      categoryId: catMap["dress-materials"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.25.06-PM-1_1785595081556.jpeg"],
      isFeatured: false,
      isBestseller: true,
      isNewArrival: true,
      isActive: true,
    },
    {
      name: "Modal Silk Print Fabric",
      slug: "modal-silk-print-" + (Date.now() + 5).toString(36),
      description: "Luxuriously soft modal silk fabric with contemporary print designs. Perfect for flowing kurtas, sarees, and dress materials.",
      fabricDetails: "Modal Silk | Printed | Width: 44 inches",
      price: "2199",
      offerPrice: null,
      stock: 40,
      categoryId: catMap["sarees"] || catMap["cotton-fabrics"],
      images: ["@assets/WhatsApp-Image-2026-06-24-at-2.25.44-PM_1785595081556.jpeg"],
      isFeatured: true,
      isBestseller: false,
      isNewArrival: false,
      isActive: true,
    },
  ]).onConflictDoNothing();
  console.log("Products seeded");

  // Banners
  await db.insert(bannersTable).values([
    {
      image: "@assets/banner-slide-1-dupatta-story_1785595081552.png",
      title: "Every Dupatta Tells a Story",
      subtitle: "Inspired by Heritage. Designed for Today.",
      ctaText: "Shop Dupattas",
      ctaLink: "/shop?category=dupattas",
      isActive: true,
      sortOrder: 1,
    },
    {
      image: "@assets/banner-slide-2-softness-perfection_1785595081560.png",
      title: "Softness & Perfection",
      subtitle: "Premium fabrics crafted with love",
      ctaText: "Explore Collection",
      ctaLink: "/shop",
      isActive: true,
      sortOrder: 2,
    },
    {
      image: "@assets/banner-slide-3-festive-vibes_1785595081549.png",
      title: "Festive Vibes",
      subtitle: "The Beauty of Indian Weaves",
      ctaText: "Shop Festive",
      ctaLink: "/shop",
      isActive: true,
      sortOrder: 3,
    },
    {
      image: "@assets/banner-slide-4-elevate-creation_1785595081561.png",
      title: "Elevate Your Creation",
      subtitle: "Discover our premium handcrafted fabrics",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      isActive: true,
      sortOrder: 4,
    },
  ]).onConflictDoNothing();
  console.log("Banners seeded");

  // Default settings
  const defaultSettings = [
    { key: "storeName", value: "Fabric Infinity" },
    { key: "storeEmail", value: "support@fabricinfinity.com" },
    { key: "storePhone", value: "+91 98765 43210" },
    { key: "currency", value: "INR" },
    { key: "freeShippingThreshold", value: "999" },
    { key: "standardShippingCharge", value: "60" },
    { key: "razorpayEnabled", value: "true" },
    { key: "codEnabled", value: "true" },
    { key: "metaTitle", value: "Fabric Infinity — Premium Indian Fabrics" },
    { key: "metaDescription", value: "Shop premium handcrafted Indian fabrics, dupattas, sarees, and dress materials. Authentic handblock prints, Ajrakh, and more." },
    { key: "announcementBar", value: "Free shipping on orders above ₹999! | COD available | Authentic handcrafted fabrics" },
  ];
  for (const s of defaultSettings) {
    await db.insert(settingsTable).values(s).onConflictDoNothing();
  }
  console.log("Settings seeded");

  // Sample coupons
  await db.insert(couponsTable).values([
    { code: "WELCOME10", discountType: "percentage", discountValue: "10", minOrder: "500", isActive: true, maxUses: 1000 },
    { code: "FLAT200", discountType: "fixed", discountValue: "200", minOrder: "1000", isActive: true, maxUses: 500 },
  ]).onConflictDoNothing();
  console.log("Coupons seeded");

  // Sample reviews
  const prods = await db.select().from(productsTable).limit(3);
  if (prods.length > 0) {
    await db.insert(reviewsTable).values([
      { productId: prods[0].id, customerName: "Priya Sharma", rating: 5, comment: "Absolutely love the quality! The fabric feels premium and the print is vibrant. Will definitely order again." },
      { productId: prods[0].id, customerName: "Meena Patel", rating: 4, comment: "Beautiful fabric, great for festive wear. Shipping was fast too." },
      { productId: prods.length > 1 ? prods[1].id : prods[0].id, customerName: "Ananya Krishnan", rating: 5, comment: "The Ajrakh print is stunning! Exactly as shown in the photos. Very happy with the purchase." },
    ]).onConflictDoNothing();
    console.log("Reviews seeded");
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
