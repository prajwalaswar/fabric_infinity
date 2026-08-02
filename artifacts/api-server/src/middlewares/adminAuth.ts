import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = req.signedCookies?.adminSession;
  if (session !== "authenticated") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
