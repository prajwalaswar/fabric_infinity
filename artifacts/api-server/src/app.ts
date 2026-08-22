import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  logger.error(
    "SESSION_SECRET env var is not set. " +
    "Admin cookie signing is disabled — all admin routes will be inaccessible until SESSION_SECRET is configured.",
  );
  // Fail closed: refuse to start with an insecure signing secret.
  process.exit(1);
}
app.use(cookieParser(sessionSecret));

// Serve uploaded files statically
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/assets", express.static(path.resolve(process.cwd(), "../../attached_assets")));

app.use("/api", router);

export default app;
