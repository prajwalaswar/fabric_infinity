// Seed script to create default categories for Fabric Infinity
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { categoriesTable } from "./schema/categories";

const { Pool } = pg;

const defaultCategories = [
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    image: null,
    description: "Latest fabric collections"
  },
  {
    name: "Fabrics",
    slug: "fabrics",
    image: null,
    description: "All types of premium fabrics"
  },
  {
    name: "Dress Material",
    slug: "dress-material",
    image: null,
    description: "Ready to stitch dress materials"
  },
  {
    name: "Saree Collection",
    slug: "saree-collection",
    image: null,
    description: "Beautiful saree fabrics"
  }
];

async function seedCategories() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Please configure it in your Replit Secrets.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { categoriesTable } });

  console.log("🌱 Seeding categories...");

  try {
    // Check if categories already exist
    const existing = await db.select().from(categoriesTable);
    
    if (existing.length > 0) {
      console.log(`ℹ️  Found ${existing.length} existing categories:`);
      existing.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));
      
      const needToAdd = defaultCategories.filter(
        def => !existing.some(ex => ex.slug === def.slug)
      );

      if (needToAdd.length === 0) {
        console.log("✅ All default categories already exist!");
        await pool.end();
        return;
      }

      console.log(`\n📦 Adding ${needToAdd.length} missing categories...`);
      for (const cat of needToAdd) {
        await db.insert(categoriesTable).values({
          name: cat.name,
          slug: cat.slug,
          image: cat.image
        });
        console.log(`   ✓ Added: ${cat.name}`);
      }
    } else {
      console.log("📦 Creating all default categories...");
      for (const cat of defaultCategories) {
        await db.insert(categoriesTable).values({
          name: cat.name,
          slug: cat.slug,
          image: cat.image
        });
        console.log(`   ✓ Created: ${cat.name}`);
      }
    }

    console.log("\n✅ Categories seeded successfully!");
    console.log("\n📋 Current categories:");
    
    const allCategories = await db.select().from(categoriesTable);
    allCategories.forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });

  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { seedCategories, defaultCategories };
