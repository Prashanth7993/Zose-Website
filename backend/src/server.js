import "dotenv/config";
import cors from "cors";
import express from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import multer from "multer";
import { migrateDatabase } from "./db.js";

const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || "admin@gmail.com");
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "password@123");

const createPasswordHash = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, key] = String(storedHash || "").split(":");

  if (!salt || !key) {
    return false;
  }

  const passwordBuffer = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");

  if (passwordBuffer.length !== keyBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, keyBuffer);
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: Boolean(user.isAdmin),
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const issueToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.isAdmin),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const buildAdminUser = () => ({
  id: "admin",
  name: "Admin",
  email: ADMIN_EMAIL,
  isAdmin: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const getBearerToken = (req) => {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice("Bearer ".length).trim();
};

const requireAuth = (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
};

const parseJsonField = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return fallback;

  try {
    return JSON.parse(value);
  } catch {
    if (Array.isArray(fallback)) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return fallback;
  }
};

const sanitizePublicProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  actualPrice: Number(product.actual_price),
  offerPrice: Number(product.offer_price),
  sizes: parseJsonField(product.sizes_json, []),
  images: parseJsonField(product.images_json, []),
  colorImageMap: parseJsonField(product.color_image_map_json, {}),
});

const sanitizeAdminProduct = (product) => ({
  ...sanitizePublicProduct(product),
  createdBy: product.created_by,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

const db = await migrateDatabase();
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(CURRENT_DIR, "..");
const UPLOADS_DIR = resolve(BACKEND_DIR, "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

const uploadsStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOADS_DIR),
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname || "").toLowerCase();
    callback(null, `${Date.now()}-${randomBytes(4).toString("hex")}${extension}`);
  },
});

const upload = multer({
  storage: uploadsStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const app = express();
// app.use(cors({ origin: true, credentials: true }));
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true 
}));
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    // Log only safe metadata. Never log Authorization headers, tokens, or request body.
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const passwordHash = createPasswordHash(password);
    const result = await db.run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    const createdUser = await db.get("SELECT * FROM users WHERE id = ?", [result.lastID]);

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(createdUser),
      token: issueToken(createdUser),
    });
  } catch (error) {
    if (String(error?.message || "").includes("UNIQUE constraint failed")) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("Register error:", error);
    return res.status(500).json({ message: "Unable to create account right now." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser = buildAdminUser();
    return res.json({
      message: "Login successful.",
      user: sanitizeUser(adminUser),
      token: issueToken(adminUser),
    });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      message: "Login successful.",
      user: sanitizeUser({ ...user, isAdmin: false }),
      token: issueToken({ ...user, isAdmin: false }),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Unable to login right now." });
  }
});

app.get("/api/auth/validate", requireAuth, async (req, res) => {
  if (req.auth?.isAdmin) {
    const adminUser = buildAdminUser();
    return res.json({
      message: "Token is valid.",
      user: sanitizeUser(adminUser),
    });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.auth.sub]);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }

    return res.json({
      message: "Token is valid.",
      user: sanitizeUser({ ...user, isAdmin: false }),
    });
  } catch (error) {
    console.error("Token validate error:", error);
    return res.status(500).json({ message: "Unable to validate token right now." });
  }
});

app.get("/api/secure/profile", requireAuth, async (req, res) => {
  if (req.auth?.isAdmin) {
    const adminUser = buildAdminUser();
    return res.json({
      message: "Secure profile fetched successfully.",
      user: sanitizeUser(adminUser),
    });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.auth.sub]);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: "Secure profile fetched successfully.",
      user: sanitizeUser({ ...user, isAdmin: false }),
    });
  } catch (error) {
    console.error("Secure profile error:", error);
    return res.status(500).json({ message: "Unable to fetch secure profile right now." });
  }
});

app.get("/api/admin/validate", requireAuth, requireAdmin, (_req, res) => {
  res.json({ message: "Admin session is valid." });
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await db.all("SELECT * FROM products ORDER BY id DESC");
    return res.json({
      products: products.map(sanitizePublicProduct),
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return res.status(500).json({ message: "Unable to fetch products right now." });
  }
});

app.get("/api/admin/products", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const products = await db.all("SELECT * FROM products ORDER BY id DESC");
    return res.json({
      products: products.map(sanitizeAdminProduct),
    });
  } catch (error) {
    console.error("Fetch admin products error:", error);
    return res.status(500).json({ message: "Unable to fetch admin products right now." });
  }
});

app.post("/api/admin/uploads", requireAuth, requireAdmin, upload.array("images", 30), async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  return res.status(201).json({
    files: files.map((file) => ({
      fileName: file.originalname,
      storedName: file.filename,
      url: `/uploads/${file.filename}`,
    })),
  });
});

app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const description = String(req.body?.description || "").trim();
  const actualPrice = Number(req.body?.actualPrice);
  const offerPrice = Number(req.body?.offerPrice);
  const sizes = Array.isArray(req.body?.sizes) ? req.body.sizes : [];
  const images = Array.isArray(req.body?.images) ? req.body.images : [];
  const colorImageMap = req.body?.colorImageMap && typeof req.body.colorImageMap === "object"
    ? req.body.colorImageMap
    : {};

  if (!name) {
    return res.status(400).json({ message: "Product name is required." });
  }
  if (!description) {
    return res.status(400).json({ message: "Product description is required." });
  }
  if (!Number.isFinite(actualPrice) || actualPrice <= 0) {
    return res.status(400).json({ message: "Actual price must be greater than 0." });
  }
  if (!Number.isFinite(offerPrice) || offerPrice < 0 || offerPrice > actualPrice) {
    return res.status(400).json({ message: "Offer price must be between 0 and actual price." });
  }
  if (!sizes.length) {
    return res.status(400).json({ message: "Select at least one size." });
  }

  const createdBy = String(req.auth.email || "admin");

  try {
    const result = await db.run(
      `INSERT INTO products
      (name, description, actual_price, offer_price, sizes_json, images_json, color_image_map_json, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        actualPrice,
        offerPrice,
        JSON.stringify(sizes),
        JSON.stringify(images),
        JSON.stringify(colorImageMap),
        createdBy,
      ]
    );

    const createdProduct = await db.get("SELECT * FROM products WHERE id = ?", [result.lastID]);

    return res.status(201).json({
      message: "Product saved successfully.",
      product: sanitizeAdminProduct(createdProduct),
    });
  } catch (error) {
    console.error("Admin product save error:", error);
    return res.status(500).json({ message: "Unable to save product right now." });
  }
});

app.put("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);
  const name = String(req.body?.name || "").trim();
  const description = String(req.body?.description || "").trim();
  const actualPrice = Number(req.body?.actualPrice);
  const offerPrice = Number(req.body?.offerPrice);
  const sizes = Array.isArray(req.body?.sizes) ? req.body.sizes : [];
  const images = Array.isArray(req.body?.images) ? req.body.images : [];
  const colorImageMap = req.body?.colorImageMap && typeof req.body.colorImageMap === "object"
    ? req.body.colorImageMap
    : {};

  if (!Number.isFinite(productId) || productId <= 0) {
    return res.status(400).json({ message: "Invalid product id." });
  }
  if (!name) {
    return res.status(400).json({ message: "Product name is required." });
  }
  if (!description) {
    return res.status(400).json({ message: "Product description is required." });
  }
  if (!Number.isFinite(actualPrice) || actualPrice <= 0) {
    return res.status(400).json({ message: "Actual price must be greater than 0." });
  }
  if (!Number.isFinite(offerPrice) || offerPrice < 0 || offerPrice > actualPrice) {
    return res.status(400).json({ message: "Offer price must be between 0 and actual price." });
  }
  if (!sizes.length) {
    return res.status(400).json({ message: "Select at least one size." });
  }

  try {
    const result = await db.run(
      `UPDATE products
      SET name = ?, description = ?, actual_price = ?, offer_price = ?, sizes_json = ?, images_json = ?, color_image_map_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        description,
        actualPrice,
        offerPrice,
        JSON.stringify(sizes),
        JSON.stringify(images),
        JSON.stringify(colorImageMap),
        productId,
      ]
    );

    if (!result?.changes) {
      return res.status(404).json({ message: "Product not found." });
    }

    const updatedProduct = await db.get("SELECT * FROM products WHERE id = ?", [productId]);
    return res.json({
      message: "Product updated successfully.",
      product: sanitizeAdminProduct(updatedProduct),
    });
  } catch (error) {
    console.error("Admin product update error:", error);
    return res.status(500).json({ message: "Unable to update product right now." });
  }
});

app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isFinite(productId) || productId <= 0) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  try {
    const result = await db.run("DELETE FROM products WHERE id = ?", [productId]);
    if (!result?.changes) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return res.status(500).json({ message: "Unable to delete product right now." });
  }
});

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Image is too large. Max allowed size is 20MB per image." });
    }
    return res.status(400).json({ message: error.message || "Upload failed." });
  }

  if (error) {
    console.error("Unhandled server error:", error);
    return res.status(500).json({ message: "Unexpected server error." });
  }

  return next();
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
