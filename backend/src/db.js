import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(CURRENT_DIR, "..");
dotenv.config({ path: resolve(BACKEND_DIR, ".env"), override: true });
const DB_CLIENT = String(process.env.DB_CLIENT || "sqlite").trim().toLowerCase();
const DEFAULT_DB_PATH = resolve(BACKEND_DIR, "data/app.db");
const DATABASE_PATH = process.env.DB_FILE
  ? resolve(process.env.DB_FILE)
  : DEFAULT_DB_PATH;
const SCHEMA_PATH = resolve(BACKEND_DIR, "sql/schema.sql");
const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "zose_db";

const MYSQL_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

const MYSQL_PRODUCTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  actual_price DECIMAL(10, 2) NOT NULL,
  offer_price DECIMAL(10, 2) NOT NULL,
  sizes_json JSON NOT NULL,
  images_json JSON NOT NULL,
  color_image_map_json JSON NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

let mysqlPool = null;

const getSqliteDatabase = async () => {
  mkdirSync(dirname(DATABASE_PATH), { recursive: true });
  return open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database,
  });
};

const getMysqlPool = async () => {
  if (mysqlPool) {
    return mysqlPool;
  }

  const bootstrapConnection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
  });
  await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
  await bootstrapConnection.end();

  mysqlPool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return mysqlPool;
};

const getMysqlDatabase = async () => {
  const pool = await getMysqlPool();
  return {
    run: async (sql, params = []) => {
      const [result] = await pool.execute(sql, params);
      return {
        lastID: result.insertId,
        changes: result.affectedRows,
      };
    },
    get: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    all: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    exec: async (sql) => {
      await pool.query(sql);
    },
  };
};

export const getDatabase = async () => {
  if (DB_CLIENT === "mysql") {
    return getMysqlDatabase();
  }
  return getSqliteDatabase();
};

export const migrateDatabase = async () => {
  const db = await getDatabase();
  if (DB_CLIENT === "mysql") {
    await db.exec(MYSQL_USERS_TABLE_SQL);
    await db.exec(MYSQL_PRODUCTS_TABLE_SQL);
  } else {
    const schema = readFileSync(SCHEMA_PATH, "utf8");
    await db.exec(schema);
  }
  return db;
};

export { DATABASE_PATH, DB_CLIENT };
