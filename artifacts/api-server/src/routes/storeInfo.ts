import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";

const router: IRouter = Router();

/**
 * GET /api/store-info
 * Public, non-sensitive store information used by the storefront:
 * announcement bar text, WhatsApp number, and which payment methods are
 * currently available (Razorpay only counts as configured when the owner has
 * saved both a Key ID and a Key Secret in the dashboard).
 */
router.get("/store-info", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const settings: Record<string, string | null> = {};
  for (const row of rows) settings[row.key] = row.value;

  const asBool = (key: string, fallback: boolean): boolean => {
    const val = settings[key];
    if (val === "true") return true;
    if (val === "false") return false;
    return fallback;
  };
  const asNum = (key: string, fallback: number): number => {
    const val = Number(settings[key]);
    return Number.isFinite(val) && settings[key] !== null && settings[key] !== ""
      ? val
      : fallback;
  };

  const razorpayConfigured = Boolean(
    settings.razorpayKeyId && settings.razorpayKeySecret,
  );

  res.json({
    storeName: settings.storeName || "Fabric Infinity",
    announcementBar: settings.announcementBar || "",
    whatsappNumber: settings.whatsappNumber || "",
    razorpayEnabled: asBool("razorpayEnabled", true) && razorpayConfigured,
    codEnabled: asBool("codEnabled", true),
    razorpayConfigured,
    freeShippingThreshold: asNum("freeShippingThreshold", 999),
    standardShippingCharge: asNum("standardShippingCharge", 60),
  });
});

export default router;
