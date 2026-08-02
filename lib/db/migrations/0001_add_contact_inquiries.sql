-- Migration: add contact_inquiries table
-- Run via: pnpm --filter @workspace/db run push
-- Or apply manually against your database.

CREATE TABLE IF NOT EXISTS "contact_inquiries" (
  "id"         serial PRIMARY KEY,
  "name"       text NOT NULL,
  "email"      text NOT NULL,
  "message"    text NOT NULL,
  "status"     text NOT NULL DEFAULT 'new',
  "created_at" timestamptz NOT NULL DEFAULT now()
);
