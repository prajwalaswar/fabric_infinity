import { Router, type IRouter } from "express";
import { requireAdmin } from "../../middlewares/adminAuth";

const router: IRouter = Router();

router.post("/admin/auth/login", async (req, res): Promise<void> => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    req.log.error("ADMIN_PASSWORD env var not set");
    res.status(500).json({ error: "Admin password not configured" });
    return;
  }

  if (password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.cookie("adminSession", "authenticated", {
    signed: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    sameSite: "lax",
  });

  res.json({ authenticated: true });
});

router.post("/admin/auth/logout", (_req, res): void => {
  res.clearCookie("adminSession");
  res.json({ success: true });
});

router.get("/admin/auth/me", requireAdmin, (_req, res): void => {
  res.json({ authenticated: true });
});

export default router;
