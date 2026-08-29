import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Disable SSL certificate verification check to allow local connections through firewalls/proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = process.env.DATABASE_URL || process.env.DATABASE_URI;
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Prevent multiple instances of database connection client in development
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

export const client = globalForDb.client ?? (
  (url && url !== "file:sqlite.db") 
    ? createClient({ url, authToken })
    : createClient({ url: "file:sqlite.db" })
);

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

// Auto-ensure required tables & columns exist
client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});
client.execute(`
  CREATE TABLE IF NOT EXISTS reels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    badge_text TEXT DEFAULT 'NEW',
    views_count TEXT DEFAULT '2.5M',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT
  );
`).catch(() => {});

export const db = drizzle(client, { schema });
