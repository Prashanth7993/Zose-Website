const USER_STORAGE_KEY = "zose-auth-user";
const TOKEN_STORAGE_KEY = "zose-auth-token";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const registerUser = async (payload) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const loadStoredToken = () => window.localStorage.getItem(TOKEN_STORAGE_KEY);

export const loadStoredUser = () => {
  const rawValue = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const storeUser = (user) => {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user || null));
};

export const storeAuthSession = ({ user, token }) => {
  storeUser(user);
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const clearStoredSession = () => {
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
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

  const response = await fetch(input, {
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
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  return parseResponse(response);
};

export const fetchProducts = async () => {
  const response = await fetch("/api/products");
  return parseResponse(response);
};

export const fetchAdminProducts = async () => authFetch("/api/admin/products");
