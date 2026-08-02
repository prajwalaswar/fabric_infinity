import { Router, type IRouter } from "express";
import { db, customersTable, customerOtpsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to phone or email
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    res.status(400).json({ error: "Phone or email is required" });
    return;
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(customerOtpsTable).values({
    phone: phone || null,
    email: email || null,
    otp,
    expiresAt,
    used: false,
  });

  // In production: send SMS via Twilio or email via SendGrid
  // For demo: return OTP in response
  req.log.info({ otp, phone, email }, "OTP generated (demo mode — normally sent via SMS/email)");

  res.json({
    success: true,
    message: phone ? `OTP sent to ${phone}` : `OTP sent to ${email}`,
    // Demo only — remove in production:
    demo_otp: otp,
  });
});

// Verify OTP and create session
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { phone, email, otp } = req.body;

  if ((!phone && !email) || !otp) {
    res.status(400).json({ error: "Phone/email and OTP are required" });
    return;
  }

  const now = new Date();
  const field = phone ? customerOtpsTable.phone : customerOtpsTable.email;
  const value = phone || email;

  const [record] = await db
    .select()
    .from(customerOtpsTable)
    .where(and(eq(field, value), eq(customerOtpsTable.otp, otp), eq(customerOtpsTable.used, false)))
    .orderBy(customerOtpsTable.createdAt)
    .limit(1);

  if (!record || record.expiresAt < now) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  // Mark OTP as used
  await db.update(customerOtpsTable).set({ used: true }).where(eq(customerOtpsTable.id, record.id));

  // Find or create customer
  let customer = phone
    ? (await db.select().from(customersTable).where(eq(customersTable.phone, phone)).limit(1))[0]
    : (await db.select().from(customersTable).where(eq(customersTable.email, email!)).limit(1))[0];

  if (!customer) {
    const [newCustomer] = await db
      .insert(customersTable)
      .values({ phone: phone || null, email: email || null, isVerified: true })
      .returning();
    customer = newCustomer;
  } else {
    await db.update(customersTable).set({ isVerified: true }).where(eq(customersTable.id, customer.id));
    customer.isVerified = true;
  }

  // Set session cookie
  res.cookie("customerSession", String(customer.id), {
    signed: true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
  });

  res.json({
    authenticated: true,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isVerified: customer.isVerified,
    },
  });
});

// Get current customer
router.get("/auth/me", async (req, res): Promise<void> => {
  const sessionId = req.signedCookies?.customerSession;
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, Number(sessionId)))
    .limit(1);

  if (!customer) {
    res.clearCookie("customerSession");
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    isVerified: customer.isVerified,
  });
});

// Update customer profile
router.put("/auth/profile", async (req, res): Promise<void> => {
  const sessionId = req.signedCookies?.customerSession;
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { name, email } = req.body;
  const [customer] = await db
    .update(customersTable)
    .set({ name: name || null, email: email || null })
    .where(eq(customersTable.id, Number(sessionId)))
    .returning();

  res.json({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone });
});

// Logout
router.post("/auth/logout", (_req, res): void => {
  res.clearCookie("customerSession");
  res.json({ success: true });
});

export default router;
