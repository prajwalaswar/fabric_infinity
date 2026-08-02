import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Warn rather than crash — allows the server to start (and pass health checks)
// even without a database. Routes that use `db` will return 500 errors until
// DATABASE_URL is configured via Secrets.
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] WARNING: DATABASE_URL is not set. " +
      "The server will start but all database operations will fail. " +
      "Add DATABASE_URL in Secrets to enable full functionality.",
  );
}

const _pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

// Cast as non-null so existing route code compiles; at runtime it will be null
// and throw a helpful error when a DB route is actually called.
export const pool = _pool as pg.Pool;
export const db = (_pool ? drizzle(_pool, { schema }) : null) as ReturnType<
  typeof drizzle<typeof schema>
>;

export * from "./schema";
