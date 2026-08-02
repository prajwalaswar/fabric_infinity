import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

const SETTING_KEYS = [
  "storeName", "storeEmail", "storePhone", "storeAddress", "currency",
  "freeShippingThreshold", "standardShippingCharge",
  "razorpayEnabled", "codEnabled",
  "instagramUrl", "facebookUrl", "whatsappNumber",
  "metaTitle", "metaDescription", "announcementBar",
];

async function getAllSettings() {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, unknown> = {
    storeName: "Fabric Infinity", storeEmail: "", storePhone: "",
    storeAddress: "", currency: "INR", freeShippingThreshold: 999,
    standardShippingCharge: 60, razorpayEnabled: true, codEnabled: true,
    instagramUrl: "", facebookUrl: "", whatsappNumber: "",
    metaTitle: "Fabric Infinity", metaDescription: "", announcementBar: "",
  };
  for (const row of rows) {
    if (SETTING_KEYS.includes(row.key)) {
      const val = row.value;
      if (val === "true") result[row.key] = true;
      else if (val === "false") result[row.key] = false;
      else if (!isNaN(Number(val)) && val !== null && val !== "") result[row.key] = Number(val);
      else result[row.key] = val;
    }
  }
  return result;
}

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json(settings);
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const updates = req.body as Record<string, unknown>;

  for (const [key, value] of Object.entries(updates)) {
    if (!SETTING_KEYS.includes(key)) continue;
    const strValue = value === null ? null : String(value);
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value: strValue }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value: strValue });
    }
  }

  const settings = await getAllSettings();
  res.json(settings);
});

export default router;
