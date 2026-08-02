import { Router, type IRouter } from "express";
import { db, contactInquiriesTable } from "@workspace/db";

const router: IRouter = Router();

// POST /api/contact — store a customer inquiry from the chat widget
router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email and message are required" });
    return;
  }

  if (!db) {
    req.log.warn("Contact inquiry received but DATABASE_URL is not set — inquiry not persisted");
    res.status(503).json({
      error: "The store is not yet connected to a database. Please contact us via WhatsApp.",
    });
    return;
  }

  try {
    const [inquiry] = await db
      .insert(contactInquiriesTable)
      .values({ name: String(name), email: String(email), message: String(message) })
      .returning({ id: contactInquiriesTable.id });

    req.log.info({ inquiryId: inquiry.id }, "Contact inquiry saved");
    res.status(201).json({ success: true, id: inquiry.id });
  } catch (err) {
    req.log.error(err, "Failed to save contact inquiry");
    res.status(500).json({ error: "Failed to save your message. Please try again." });
  }
});

export default router;
