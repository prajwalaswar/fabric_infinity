import { Router, type IRouter, type Request, type Response } from "express";
import { db, settingsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const MAX_HISTORY = 10;

type ChatMessage = { role: "user" | "assistant"; content: string };

async function getSetting(key: string): Promise<string | null> {
  if (!db) return null;
  try {
    const rows = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, key))
      .limit(1);
    const val = rows[0]?.value;
    if (!val || val.trim() === "") return null;
    // Strip a stray leading "$" (copied from `export KEY=$gsk_...` examples).
    if (key === "groqApiKey") return val.trim().replace(/^\$+/, "") || null;
    return val.trim();
  } catch {
    return null;
  }
}

/**
 * Build a short catalog summary so the assistant knows what the store sells
 * (names + categories only — prices are deliberately NOT included, because
 * pricing questions are handed off to the owner on WhatsApp).
 */
async function getCatalogSummary(): Promise<string> {
  if (!db) return "Handloom fabrics, sarees, dupattas and dress materials.";
  try {
    const products = await db
      .select({ name: productsTable.name, isActive: productsTable.isActive })
      .from(productsTable)
      .limit(60);
    const categories = await db
      .select({ name: categoriesTable.name })
      .from(categoriesTable)
      .limit(20);
    const activeNames = products
      .filter((p) => p.isActive !== false)
      .map((p) => p.name)
      .slice(0, 40);
    const parts: string[] = [];
    if (categories.length) parts.push(`Categories: ${categories.map((c) => c.name).join(", ")}`);
    if (activeNames.length) parts.push(`Some products: ${activeNames.join(", ")}`);
    return parts.join("\n") || "Handloom fabrics, sarees, dupattas and dress materials.";
  } catch {
    return "Handloom fabrics, sarees, dupattas and dress materials.";
  }
}

function buildSystemPrompt(catalog: string, whatsappNumber: string | null): string {
  const waLine = whatsappNumber
    ? `The store's WhatsApp number is ${whatsappNumber} (link: https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}). When handing off, tell the customer to tap the WhatsApp tab in this chat window to talk to our team directly.`
    : "When handing off, tell the customer to use the WhatsApp tab in this chat window to talk to our team directly.";

  return `You are "Fabric Infinity Assistant" — the friendly support chatbot for Fabric Infinity, an Indian handloom fabric store. The store sells authentic handloom and hand block print fabrics: sarees, dupattas, dress materials, suit fabrics and plain/print fabrics sourced from artisans in Rajasthan and Gujarat.

Your job:
1. Answer SIMPLE, GENERAL questions yourself in 1-3 short sentences: what fabrics/types the store carries, category info, how to place an order, shipping policy (free shipping above ₹999, 5-7 day delivery pan-India), returns (7 days for unused uncut fabric), payment methods (Razorpay online + Cash on Delivery). Reply in the same language the customer uses (English, Hindi or Hinglish).
2. HAND OFF TO WHATSAPP for anything that needs the owner: exact price, price of a specific product, discounts or negotiation, bulk/wholesale quotes, order problems (late, damaged, wrong item), refunds/complaints, custom requests. For these, do NOT quote prices or make commitments — politely say our team will help best on WhatsApp. ${waLine}
3. Never invent prices, stock or policies. Keep answers short, warm and simple.

Store catalog for context (no prices on purpose):
${catalog}`;
}

// POST /api/chat — public AI chat for the storefront widget
router.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const history: ChatMessage[] = incoming
    .filter(
      (m: unknown): m is ChatMessage =>
        !!m &&
        typeof (m as ChatMessage).content === "string" &&
        ["user", "assistant"].includes((m as ChatMessage).role),
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (!history.length || history[history.length - 1].role !== "user") {
    res.status(400).json({ error: "A user message is required" });
    return;
  }

  const apiKey = (await getSetting("groqApiKey")) || process.env.GROQ_API_KEY || "";
  if (!apiKey) {
    // No key configured — tell the widget to fall back to keyword answers.
    res.status(503).json({ fallback: true, error: "AI chat is not configured" });
    return;
  }

  const [whatsappNumber, catalog] = await Promise.all([
    getSetting("whatsappNumber"),
    getCatalogSummary(),
  ]);

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: "system", content: buildSystemPrompt(catalog, whatsappNumber) },
          ...history,
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => "");
      req.log.error({ status: groqRes.status, body: errBody.slice(0, 300) }, "Groq chat failed");
      res.status(503).json({ fallback: true, error: "AI chat is temporarily unavailable" });
      return;
    }

    const data = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      res.status(503).json({ fallback: true, error: "Empty AI response" });
      return;
    }

    res.json({ reply, whatsappNumber: whatsappNumber || "" });
  } catch (err) {
    req.log.error(err, "Chat route error");
    res.status(503).json({ fallback: true, error: "AI chat is temporarily unavailable" });
  }
});

export default router;
