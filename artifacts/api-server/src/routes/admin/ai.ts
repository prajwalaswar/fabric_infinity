import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

async function getGroqApiKey(): Promise<string | null> {
  const rows = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "groqApiKey"))
    .limit(1);
  return rows[0]?.value ?? null;
}

/**
 * POST /api/admin/ai/analyze-fabric
 * Body: { imageUrl: string }  (e.g. "/api/uploads/xxx.jpg")
 * Returns: { name, description, fabricDetails, suggestedPrice, suggestedOfferPrice, category }
 */
router.post(
  "/admin/ai/analyze-fabric",
  requireAdmin,
  async (req, res): Promise<void> => {
    const { imageUrl } = req.body as { imageUrl?: string };

    if (!imageUrl) {
      res.status(400).json({ error: "imageUrl is required" });
      return;
    }

    const apiKey = await getGroqApiKey();
    if (!apiKey) {
      res.status(400).json({
        error:
          "Groq API key not configured. Please add it in Settings → AI Integration.",
      });
      return;
    }

    // Resolve image to base64 data URL
    let imageDataUrl: string;
    try {
      // URL pattern: /api/uploads/<filename>
      const uploadsPrefix = "/api/uploads/";
      if (!imageUrl.startsWith(uploadsPrefix)) {
        res
          .status(400)
          .json({ error: "Only locally uploaded images are supported" });
        return;
      }
      const filename = imageUrl.slice(uploadsPrefix.length);
      const filePath = path.join(process.cwd(), "uploads", filename);
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase().slice(1);
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
      imageDataUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    } catch (err) {
      req.log.error({ err }, "Failed to read uploaded image");
      res
        .status(400)
        .json({ error: "Could not read image file. Make sure it was uploaded." });
      return;
    }

    // Call Groq vision API
    const prompt = `You are a product listing expert for an Indian fabric and clothing e-commerce store called Fabric Infinity.

Analyze this fabric/clothing product image carefully and return a JSON object with these exact fields:
{
  "name": "specific product name (e.g. Ajrakh Handblock Print Cotton Fabric, Banarasi Silk Saree, Chanderi Dupatta)",
  "description": "2-3 sentence description mentioning fabric type, pattern/print style, occasions/uses, and key qualities. Write for online shoppers.",
  "fabricDetails": "technical details like: 100% Cotton | Handblock Printed | Width: 44 inches | GSM: 120 — adapt to what you can see",
  "suggestedPrice": (integer INR price, e.g. 1299),
  "suggestedOfferPrice": (integer INR discounted price, or null if no discount makes sense),
  "category": (one of exactly: "Fabrics", "Dress Materials", "Sarees", "Dupattas", "Kurtis", "Others")
}

Only return valid JSON — no markdown, no explanation, no code blocks.`;

    try {
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: imageDataUrl },
                  },
                  {
                    type: "text",
                    text: prompt,
                  },
                ],
              },
            ],
            temperature: 0.3,
            max_tokens: 512,
          }),
        },
      );

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        req.log.error({ status: groqRes.status, body: errText }, "Groq API error");

        if (groqRes.status === 401) {
          res.status(400).json({
            error:
              "Invalid Groq API key. Please update it in Settings → AI Integration.",
          });
        } else if (groqRes.status === 429) {
          res.status(429).json({
            error:
              "Groq rate limit reached. Please wait a moment and try again, or update your API key in Settings.",
          });
        } else {
          res
            .status(502)
            .json({ error: `Groq API error: ${groqRes.status}` });
        }
        return;
      }

      const groqData = (await groqRes.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = groqData.choices?.[0]?.message?.content ?? "";

      // Strip markdown code fences if present
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        req.log.error({ raw }, "Failed to parse Groq JSON response");
        res.status(502).json({
          error:
            "AI returned an unexpected response. Please try again or fill the details manually.",
        });
        return;
      }

      res.json({
        name: String(parsed.name ?? ""),
        description: String(parsed.description ?? ""),
        fabricDetails: String(parsed.fabricDetails ?? ""),
        suggestedPrice:
          typeof parsed.suggestedPrice === "number"
            ? parsed.suggestedPrice
            : null,
        suggestedOfferPrice:
          typeof parsed.suggestedOfferPrice === "number"
            ? parsed.suggestedOfferPrice
            : null,
        category: String(parsed.category ?? ""),
      });
    } catch (err) {
      req.log.error({ err }, "Groq fetch failed");
      res
        .status(502)
        .json({ error: "Failed to connect to AI service. Please try again." });
    }
  },
);

export default router;
