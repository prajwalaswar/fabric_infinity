import { Router, type IRouter } from "express";
import { db, customersTable, customerOtpsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import { sendBrevoOtpEmail } from "../lib/brevo";

const router: IRouter = Router();

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp: string): string {
  const secret = process.env.SESSION_SECRET || "fabric-infinity-otp";
  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
}

// Send a verification OTP by email.
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const emailSent = await sendBrevoOtpEmail({ recipientEmail: email, otp });

  if (!emailSent) {
    req.log.error(
      "Brevo is not configured or rejected the OTP email. Check Brevo secrets and sender verification.",
    );
    res.status(503).json({ error: "Email delivery is temporarily unavailable. Please try again later." });
    return;
  }

  await db.insert(customerOtpsTable).values({
    phone: null,
    email,
    otp: hashOtp(otp),
    expiresAt,
    used: false,
  });

  res.json({
    success: true,
    message: `A verification code was sent to ${email}`,
  });
});

// Verify OTP and create session
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
    res.status(400).json({ error: "Email and a valid 6-digit OTP are required" });
    return;
  }

  const now = new Date();
  const otpHash = hashOtp(otp);

  const [record] = await db
    .select()
    .from(customerOtpsTable)
    .where(and(eq(customerOtpsTable.email, email), eq(customerOtpsTable.otp, otpHash), eq(customerOtpsTable.used, false)))
    .orderBy(desc(customerOtpsTable.createdAt))
    .limit(1);

  if (!record || record.expiresAt < now) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  // Mark OTP as used
  await db.update(customerOtpsTable).set({ used: true }).where(eq(customerOtpsTable.id, record.id));

  // Find or create customer
  let customer = (await db.select().from(customersTable).where(eq(customersTable.email, email)).limit(1))[0];

  if (!customer) {
    const [newCustomer] = await db
      .insert(customersTable)
      .values({ email, isVerified: true })
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
    secure: process.env.NODE_ENV === "production",
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

  const { name, email: requestedEmail } = req.body;
  const normalizedEmail =
    typeof requestedEmail === "string" && requestedEmail.trim()
      ? requestedEmail.trim().toLowerCase()
      : null;
  const [customer] = await db
    .update(customersTable)
    .set({ name: name || null, email: normalizedEmail })
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
