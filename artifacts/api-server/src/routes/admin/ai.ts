import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middlewares/adminAuth";
import fs from "fs";
import path from "path";
import { ObjectNotFoundError, ObjectStorageService } from "../../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

async function getGroqApiKey(): Promise<string | null> {
  const rows = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "groqApiKey"))
    .limit(1);
  return rows[0]?.value ?? process.env.GROQ_API_KEY ?? null;
}

/**
 * POST /api/admin/ai/analyze-fabric
 * Body: { imageDataUrl?: string, imageUrl?: string }
 *  - imageDataUrl: a base64 data URL sent straight from the browser (preferred —
 *    works no matter where the image is stored)
 *  - imageUrl: a stored image path (e.g. "/api/storage/objects/uploads/xxx")
 * Returns: { name, description, fabricDetails, suggestedPrice, suggestedOfferPrice, category }
 */
router.post(
  "/admin/ai/analyze-fabric",
  requireAdmin,
  async (req, res): Promise<void> => {
    const { imageUrl, imageDataUrl } = req.body as {
      imageUrl?: string;
      imageDataUrl?: string;
    };

    if (!imageDataUrl && !imageUrl) {
      res.status(400).json({ error: "imageDataUrl or imageUrl is required" });
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

    // Resolve the image to a base64 data URL. The browser may send the raw image
// as a data URL (preferred — works regardless of where files are stored);
// otherwise we read a stored image from App Storage or the local uploads dir
// (kept so older products can still be analyzed).
    let dataUrl: string;
    if (imageDataUrl) {
      dataUrl = imageDataUrl;
    } else {
      try {
        let fileBuffer: Buffer;
        let mimeType = "image/jpeg";

        const storagePrefix = "/api/storage/objects";
        if (imageUrl!.startsWith(`${storagePrefix}/`)) {
          const objectPath = imageUrl!.slice("/api/storage".length);
          const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
          [fileBuffer] = await objectFile.download();
          const [metadata] = await objectFile.getMetadata();
          mimeType = metadata.contentType || mimeType;
        } else {
          const uploadsPrefix = "/api/uploads/";
          if (!imageUrl!.startsWith(uploadsPrefix)) {
            res.status(400).json({
              error: "Please upload the image in the owner dashboard before analyzing it",
            });
            return;
          }
          const filename = imageUrl!.slice(uploadsPrefix.length);
          const filePath = path.join(process.cwd(), "uploads", filename);
          fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(filename).toLowerCase().slice(1);
          mimeType =
            ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : ext === "png"
                ? "image/png"
                : ext === "webp"
                  ? "image/webp"
                  : mimeType;
        }

        dataUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      } catch (err) {
        req.log.error({ err }, "Failed to read uploaded image");
        if (err instanceof ObjectNotFoundError) {
          res.status(400).json({
            error: "The uploaded image could not be found. Please upload it again.",
          });
          return;
        }
        res
          .status(400)
          .json({ error: "Could not read image file. Please upload it again." });
        return;
      }
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
            model: GROQ_VISION_MODEL,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: dataUrl },
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
