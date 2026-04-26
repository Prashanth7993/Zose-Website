const USER_STORAGE_KEY = "zose-auth-user";
const TOKEN_STORAGE_KEY = "zose-auth-token";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zose-backend.onrender.com";

export const resolveApiAssetUrl = (assetPath) => {
  if (!assetPath) return "";
  if (/^(https?:|data:|blob:)/i.test(assetPath)) return assetPath;
  if (assetPath.startsWith("/")) return `${API_BASE_URL}${assetPath}`;
  return `${API_BASE_URL}/uploads/${encodeURIComponent(assetPath)}`;
};


const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

const getStorage = () => window.sessionStorage;

export const loadStoredToken = () => getStorage().getItem(TOKEN_STORAGE_KEY);

export const loadStoredUser = () => {
  const rawValue = getStorage().getItem(USER_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    getStorage().removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const storeUser = (user) => {
  getStorage().setItem(USER_STORAGE_KEY, JSON.stringify(user || null));
};

export const storeAuthSession = ({ user, token }) => {
  storeUser(user);
  if (token) {
    getStorage().setItem(TOKEN_STORAGE_KEY, token);
  } else {
    getStorage().removeItem(TOKEN_STORAGE_KEY);
  }
};

export const clearStoredSession = () => {
  getStorage().removeItem(USER_STORAGE_KEY);
  getStorage().removeItem(TOKEN_STORAGE_KEY);
};

// Backward-compatible alias used by existing app code.
export const clearStoredUser = clearStoredSession;

export const authFetch = async (input, init = {}) => {
  const token = loadStoredToken();
  const headers = {
    ...(init.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${input}`, {
    ...init,
    headers,
  });

  return parseResponse(response);
};

export const validateStoredToken = async () => authFetch("/api/auth/validate");

export const validateAdminSession = async () => authFetch("/api/admin/validate");

// Update user's phone number in database
export const updateUserPhone = async (phone) =>
  authFetch("/api/auth/phone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

export const createAdminProduct = async (payload) =>
  authFetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateAdminProduct = async (productId, payload) =>
  authFetch(`/api/admin/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteAdminProduct = async (productId) =>
  authFetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });

export const uploadAdminImages = async (files) => {
  const token = loadStoredToken();
  const formData = new window.FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  return parseResponse(response);
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return parseResponse(response);
};

export const fetchAdminProducts = async () => authFetch("/api/admin/products");

// ==================== ORDER API FUNCTIONS ====================

// Create order after WhatsApp placement
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerEmail: orderData.customerEmail,
      products: orderData.products,
      totalAmount: orderData.totalAmount,
      paymentMode: orderData.paymentMode || "COD",
      userId: orderData.userId,
    }),
  });
  return parseResponse(response);
};

// Get order by ID (for tracking page)
export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
  return parseResponse(response);
};

// Get user's orders (logged-in users)
export const getUserOrders = async () => authFetch("/api/orders/user");

// Admin: Get all orders
export const getAdminOrders = async () => authFetch("/api/admin/orders");

// Admin: Update order status (confirm a stage)
export const updateOrderStatus = async (orderId, stage, confirmed) =>
  authFetch(`/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, confirmed }),
  });

// Admin: Add third-party tracking info
export const addThirdPartyTracking = async (orderId, courierName, trackingId) =>
  authFetch(`/api/admin/orders/${orderId}/third-party`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courierName, trackingId }),
  });

// ==================== RETURN API FUNCTIONS ====================

// Customer: Create return request
export const createReturnRequest = async (orderId, reason, description, photos) => {
  const response = await fetch(`${API_BASE_URL}/api/returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, reason, description, photos }),
  });
  return parseResponse(response);
};

// Customer: Get return by order ID
export const getReturnByOrderId = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/api/returns/order/${orderId}`);
  return parseResponse(response);
};

// Admin: Get all returns
export const getAdminReturns = async () => authFetch("/api/admin/returns");

// Admin: Update return status
export const updateReturnStatus = async (returnId, payload) =>
  authFetch(`/api/admin/returns/${returnId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
