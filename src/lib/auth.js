const USER_STORAGE_KEY = "zose-auth-user";
const TOKEN_STORAGE_KEY = "zose-auth-token";
const API_BASE_URL = "https://zose-backend.onrender.com";


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

export const fetchAdminProducts = async () => authFetch(`${API_BASE_URL}/api/admin/products`);
