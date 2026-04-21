import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(CURRENT_DIR, "..");
const DEFAULT_DB_PATH = resolve(BACKEND_DIR, "data/app.db");
const DATABASE_PATH = process.env.DB_FILE
  ? resolve(process.env.DB_FILE)
  : DEFAULT_DB_PATH;
const SCHEMA_PATH = resolve(BACKEND_DIR, "sql/schema.sql");

mkdirSync(dirname(DATABASE_PATH), { recursive: true });

export const getDatabase = async () =>
  open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database,
  });

export const migrateDatabase = async () => {
  const db = await getDatabase();
  const schema = readFileSync(SCHEMA_PATH, "utf8");

  await db.exec(schema);
  return db;
};

export { DATABASE_PATH };
