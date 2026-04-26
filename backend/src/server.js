import "dotenv/config";
import cors from "cors";
import express from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
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
  phone: user.phone,
  isAdmin: Boolean(user.isAdmin),
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const issueToken = (user, extraFields = {}) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.isAdmin),
      ...extraFields,
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

const sanitizePublicProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    actualPrice: Number(product.actual_price),
    offerPrice: Number(product.offer_price),
    sizes: parseJsonField(product.sizes_json, []),
    images: parseJsonField(product.images_json, []),
    colorImageMap: parseJsonField(product.color_image_map_json, {}),
  };
};

const sanitizeAdminProduct = (product) => ({
  ...sanitizePublicProduct(product),
  createdBy: product.created_by,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

const db = await migrateDatabase();
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(CURRENT_DIR, "..");
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : resolve(BACKEND_DIR, "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });
console.log(`Uploads directory: ${UPLOADS_DIR}`);

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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://zose-frontend.onrender.com", // add your production frontend URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("/{*splat}", cors());
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
  const phone = String(req.body?.phone || "");

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
      "INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, phone || null]
    );
    const createdUser = await db.get("SELECT * FROM users WHERE id = ?", [result.lastID]);

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(createdUser),
      token: issueToken(createdUser, { phone: createdUser.phone }),
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
      token: issueToken({ ...user, isAdmin: false }, { phone: user.phone }),
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

// Update user's phone number
app.put("/api/auth/phone", requireAuth, async (req, res) => {
  if (req.auth?.isAdmin) {
    return res.status(400).json({ message: "Cannot update admin phone via this endpoint." });
  }

  const phone = String(req.body?.phone || "").trim();

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    await db.run(
      "UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [phone, req.auth.sub]
    );

    const updatedUser = await db.get("SELECT * FROM users WHERE id = ?", [req.auth.sub]);
    return res.json({
      message: "Phone number updated successfully.",
      user: sanitizeUser({ ...updatedUser, isAdmin: false }),
    });
  } catch (error) {
    console.error("Update phone error:", error);
    return res.status(500).json({ message: "Unable to update phone number right now." });
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

// ==================== ORDER ENDPOINTS ====================

const generateOrderId = () => {
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `ZOSE-${randomNum}`;
};

const sanitizeOrder = (order) => ({
  id: order.id,
  orderId: order.order_id,
  userId: order.user_id,
  customerDetails: {
    name: order.customer_name,
    phone: order.customer_phone,
    address: order.customer_address,
    email: order.customer_email,
  },
  products: parseJsonField(order.products_json, []),
  totalAmount: Number(order.total_amount),
  paymentMode: order.payment_mode || "COD",
  status: order.status,
  timeline: parseJsonField(order.timeline_json, []),
  thirdPartyTracking: parseJsonField(order.third_party_tracking_json, {}),
  createdAt: order.created_at,
  updatedAt: order.updated_at,
});

// Get user's orders (requires auth) - placed BEFORE /:orderId to avoid Express treating "user" as an orderId
app.get("/api/orders/user", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const userEmail = req.auth.email;
    const userPhone = req.auth.phone;

    console.log(`[getUserOrders] userId=${userId}, email=${userEmail}, phone=${userPhone}`);

    // For admin users (sub === "admin"), fetch orders by email match
    if (userId === "admin") {
      const orders = await db.all(
        "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC",
        [userEmail]
      );
      return res.json({ orders: orders.map(sanitizeOrder) });
    }

    // For regular users, match by user_id (numeric) OR customer_phone OR customer_email
    const numericUserId = parseInt(String(userId || ""), 10);
    const searchPhone = userPhone ? String(userPhone).trim() : "";

    console.log(`[getUserOrders] numericUserId=${numericUserId}, searchPhone="${searchPhone}"`);

    const orders = await db.all(
      `SELECT * FROM orders
       WHERE (? IS NOT NULL AND user_id = ?)
          OR customer_phone = ?
          OR customer_email = ?
       ORDER BY created_at DESC`,
      [numericUserId || null, numericUserId, searchPhone, userEmail || ""]
    );

    console.log(`[getUserOrders] found ${orders.length} orders`);
    return res.json({ orders: orders.map(sanitizeOrder) });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return res.status(500).json({ message: "Unable to fetch orders right now." });
  }
});

// Public: Get order by ID (for tracking page) - MUST be AFTER /user route
app.get("/api/orders/:orderId", async (req, res) => {
  const orderId = String(req.params.orderId || "").trim().toUpperCase();

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  try {
    const order = await db.get("SELECT * FROM orders WHERE order_id = ?", [orderId]);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.json({ order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Fetch order error:", error);
    return res.status(500).json({ message: "Unable to fetch order right now." });
  }
});

// Create order (after WhatsApp placement)
app.post("/api/orders", async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    customerEmail,
    products,
    totalAmount,
    paymentMode = "COD",
    userId,
  } = req.body || {};

  if (!customerName || !customerPhone || !customerAddress) {
    return res.status(400).json({ message: "Customer name, phone, and address are required." });
  }
  if (!Array.isArray(products) || !products.length) {
    return res.status(400).json({ message: "At least one product is required." });
  }
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ message: "Total amount must be greater than 0." });
  }

  const orderId = generateOrderId();
  const timeline = [
    { stage: "placed", label: "Order Placed", timestamp: new Date().toISOString(), confirmed: true },
  ];

  // Normalize userId: must be a finite number or null
  const normalizedUserId = Number.isFinite(Number(userId)) ? Number(userId) : null;

  try {
    const result = await db.run(
      `INSERT INTO orders
      (order_id, user_id, customer_name, customer_phone, customer_address, customer_email, products_json, total_amount, payment_mode, timeline_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        normalizedUserId,
        customerName,
        customerPhone,
        customerAddress,
        customerEmail || null,
        JSON.stringify(products),
        totalAmount,
        paymentMode,
        JSON.stringify(timeline),
      ]
    );

    const createdOrder = await db.get("SELECT * FROM orders WHERE id = ?", [result.lastID]);
    return res.status(201).json({
      message: "Order created successfully.",
      order: sanitizeOrder(createdOrder),
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Unable to create order right now." });
  }
});

// Get user's orders (requires auth)
app.get("/api/orders/user", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const userEmail = req.auth.email;
    const userPhone = req.auth.phone;

    console.log(`[getUserOrders] userId=${userId}, email=${userEmail}, phone=${userPhone}`);

    // For admin users (sub === "admin"), fetch orders by email match
    if (userId === "admin") {
      const orders = await db.all(
        "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC",
        [userEmail]
      );
      return res.json({ orders: orders.map(sanitizeOrder) });
    }

    // For regular users, match by user_id (numeric) OR customer_phone OR customer_email
    const numericUserId = parseInt(String(userId || ""), 10);
    const searchPhone = userPhone ? String(userPhone).trim() : "";

    console.log(`[getUserOrders] numericUserId=${numericUserId}, searchPhone="${searchPhone}"`);

    const orders = await db.all(
      `SELECT * FROM orders
       WHERE (? IS NOT NULL AND user_id = ?)
          OR customer_phone = ?
          OR customer_email = ?
       ORDER BY created_at DESC`,
      [numericUserId || null, numericUserId, searchPhone, userEmail || ""]
    );

    console.log(`[getUserOrders] found ${orders.length} orders`);
    return res.json({ orders: orders.map(sanitizeOrder) });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return res.status(500).json({ message: "Unable to fetch orders right now." });
  }
});

// Public: Get order by ID (for tracking page) - MUST be AFTER /user route
app.get("/api/orders/:orderId", async (req, res) => {
  const orderId = String(req.params.orderId || "").trim().toUpperCase();

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  try {
    const order = await db.get("SELECT * FROM orders WHERE order_id = ?", [orderId]);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.json({ order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Fetch order error:", error);
    return res.status(500).json({ message: "Unable to fetch order right now." });
  }
});

// Admin: Get all orders
app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const orders = await db.all("SELECT * FROM orders ORDER BY created_at DESC");
    return res.json({
      orders: orders.map(sanitizeOrder),
    });
  } catch (error) {
    console.error("Fetch admin orders error:", error);
    return res.status(500).json({ message: "Unable to fetch orders right now." });
  }
});

// Admin: Update order status
app.put("/api/admin/orders/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const orderId = Number(req.params.id);
  const { stage, confirmed } = req.body || {};

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Invalid order id." });
  }
  if (!stage) {
    return res.status(400).json({ message: "Stage is required." });
  }

  const STAGE_ORDER = ["placed", "confirmed", "packed", "ready_for_shipment", "shipped", "delivered"];

  try {
    const order = await db.get("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const timeline = parseJsonField(order.timeline_json, []);
    const existingStageIndex = timeline.findIndex((t) => t.stage === stage);

    if (existingStageIndex >= 0) {
      timeline[existingStageIndex].confirmed = Boolean(confirmed);
      if (confirmed) {
        timeline[existingStageIndex].timestamp = new Date().toISOString();
      }
    } else if (confirmed) {
      const stageLabels = {
        placed: "Order Placed",
        confirmed: "Order Confirmed",
        packed: "Order Packed",
        ready_for_shipment: "Ready for Shipment",
        shipped: "Order Shipped",
        delivered: "Delivered",
      };
      timeline.push({
        stage,
        label: stageLabels[stage] || stage,
        timestamp: new Date().toISOString(),
        confirmed: true,
      });
    }

    // Determine the new status: if confirming a stage, advance to the next stage
    // EXCEPT: don't auto-advance from shipped to delivered - admin must click delivered's Done explicitly
    let newStatus = order.status;
    if (confirmed) {
      const currentStageIndex = STAGE_ORDER.indexOf(stage);
      const nextStage = STAGE_ORDER[currentStageIndex + 1];
      // Only auto-advance if there IS a next stage AND it's not "delivered"
      // For "delivered" stage or last stage, stay at current stage
      newStatus = (nextStage && nextStage !== "delivered") ? nextStage : stage;
    }

    await db.run(
      "UPDATE orders SET timeline_json = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [JSON.stringify(timeline), newStatus, orderId]
    );

    const updatedOrder = await db.get("SELECT * FROM orders WHERE id = ?", [orderId]);
    return res.json({
      message: "Order status updated successfully.",
      order: sanitizeOrder(updatedOrder),
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ message: "Unable to update order status right now." });
  }
});

// Admin: Add third-party tracking
app.put("/api/admin/orders/:id/third-party", requireAuth, requireAdmin, async (req, res) => {
  const orderId = Number(req.params.id);
  const { courierName, trackingId } = req.body || {};

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Invalid order id." });
  }

  try {
    const order = await db.get("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const thirdPartyTracking = {
      courierName: courierName || "",
      trackingId: trackingId || "",
      addedAt: new Date().toISOString(),
    };

    await db.run(
      "UPDATE orders SET third_party_tracking_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [JSON.stringify(thirdPartyTracking), orderId]
    );

    const updatedOrder = await db.get("SELECT * FROM orders WHERE id = ?", [orderId]);
    return res.json({
      message: "Third-party tracking added successfully.",
      order: sanitizeOrder(updatedOrder),
    });
  } catch (error) {
    console.error("Add third-party tracking error:", error);
    return res.status(500).json({ message: "Unable to add tracking right now." });
  }
});

// ==================== RETURN ENDPOINTS ====================

// Customer: Create return request
app.post("/api/returns", async (req, res) => {
  const { orderId, reason, description, photos } = req.body || {};

  if (!orderId || !reason) {
    return res.status(400).json({ message: "Order ID and reason are required." });
  }

  const validReasons = ["wrong_product", "damaged", "size_mismatch", "not_as_described", "changed_mind"];
  if (!validReasons.includes(reason)) {
    return res.status(400).json({ message: "Invalid return reason." });
  }

  if (description && description.length > 300) {
    return res.status(400).json({ message: "Description cannot exceed 300 characters." });
  }

  try {
    const order = await db.get("SELECT * FROM orders WHERE order_id = ?", [orderId]);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if return already exists
    const existingReturn = await db.get("SELECT * FROM returns WHERE order_id = ?", [orderId]);
    if (existingReturn) {
      return res.status(400).json({ message: "A return request already exists for this order." });
    }

    const timeline = [
      { stage: "return_requested", label: "Return Requested", timestamp: new Date().toISOString(), confirmed: true },
    ];

    await db.run(
      `INSERT INTO returns (order_id, reason, description, photos_json, status, timeline_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, reason, description || "", JSON.stringify(photos || []), "return_requested", JSON.stringify(timeline)]
    );

    const newReturn = await db.get("SELECT * FROM returns WHERE order_id = ?", [orderId]);
    return res.status(201).json({
      message: "Return request submitted successfully.",
      return: newReturn,
    });
  } catch (error) {
    console.error("Create return error:", error);
    return res.status(500).json({ message: "Unable to create return request right now." });
  }
});

// Customer: Get return by order ID (public - customer tracks via order ID)
app.get("/api/returns/order/:orderId", async (req, res) => {
  const orderId = String(req.params.orderId || "").trim();

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  try {
    const ret = await db.get("SELECT * FROM returns WHERE order_id = ?", [orderId]);
    if (!ret) {
      return res.status(404).json({ message: "No return found for this order." });
    }
    return res.json({ return: ret });
  } catch (error) {
    console.error("Get return error:", error);
    return res.status(500).json({ message: "Unable to fetch return right now." });
  }
});

// Admin: Get all returns
app.get("/api/admin/returns", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const returns = await db.all("SELECT * FROM returns ORDER BY created_at DESC");
    // Join with orders to get customer info
    const returnsWithOrders = await Promise.all(returns.map(async (ret) => {
      const order = await db.get("SELECT customer_name, customer_email FROM orders WHERE order_id = ?", [ret.order_id]);
      return { ...ret, customerName: order?.customer_name, customerEmail: order?.customer_email };
    }));
    return res.json({ returns: returnsWithOrders });
  } catch (error) {
    console.error("Fetch returns error:", error);
    return res.status(500).json({ message: "Unable to fetch returns right now." });
  }
});

// Admin: Update return status
app.put("/api/admin/returns/:id", requireAuth, requireAdmin, async (req, res) => {
  const returnId = Number(req.params.id);
  const { status, rejectionReason, courierName, trackingId, pickupDate } = req.body || {};

  if (!Number.isFinite(returnId) || returnId <= 0) {
    return res.status(400).json({ message: "Invalid return ID." });
  }

  const validStatuses = ["return_requested", "contacting_courier", "pickup_scheduled", "picked_up", "inspected", "refunded", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  try {
    const ret = await db.get("SELECT * FROM returns WHERE id = ?", [returnId]);
    if (!ret) {
      return res.status(404).json({ message: "Return not found." });
    }

    const timeline = parseJsonField(ret.timeline_json, []);
    const stageLabels = {
      return_requested: "Return Requested",
      contacting_courier: "Contacting Courier",
      pickup_scheduled: "Pickup Scheduled",
      picked_up: "Item Picked Up",
      inspected: "Inspected",
      refunded: "Refunded",
      rejected: "Rejected",
    };

    timeline.push({
      stage: status,
      label: stageLabels[status] || status,
      timestamp: new Date().toISOString(),
      confirmed: true,
    });

    let updateFields = "timeline_json = ?, status = ?, updated_at = CURRENT_TIMESTAMP";
    let params = [JSON.stringify(timeline), status];

    if (status === "rejected" && rejectionReason) {
      updateFields += ", rejection_reason = ?";
      params.push(rejectionReason);
    }

    if (["contacting_courier", "pickup_scheduled"].includes(status)) {
      if (courierName) {
        updateFields += ", courier_name = ?";
        params.push(courierName);
      }
      if (trackingId) {
        updateFields += ", tracking_id = ?";
        params.push(trackingId);
      }
      if (pickupDate) {
        updateFields += ", pickup_date = ?";
        params.push(pickupDate);
      }
    }

    params.push(returnId);

    await db.run(`UPDATE returns SET ${updateFields} WHERE id = ?`, params);

    const updatedReturn = await db.get("SELECT * FROM returns WHERE id = ?", [returnId]);
    return res.json({
      message: "Return updated successfully.",
      return: updatedReturn,
    });
  } catch (error) {
    console.error("Update return error:", error);
    return res.status(500).json({ message: "Unable to update return right now." });
  }
});

// ==================== ERROR HANDLER ====================

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
