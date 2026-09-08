/**
 * =======================================================
 * API CLIENT MODULE (api.js)
 * =======================================================
 * Pure Vanilla JavaScript HTTP Client
 * Handles token storage, request headers, and API calls.
 */

const API_BASE = window.location.origin.includes("http") && !window.location.origin.includes("null") 
  ? window.location.origin 
  : "http://localhost:3000";

// --- Token Management Helpers ---
export const tokenManager = {
  get: () => localStorage.getItem("loopy_jwt_token"),
  set: (token) => localStorage.setItem("loopy_jwt_token", token),
  remove: () => localStorage.removeItem("loopy_jwt_token"),
  hasToken: () => Boolean(localStorage.getItem("loopy_jwt_token")),
};

// Global event listener hook for console inspector
let onApiCallListener = null;
export const setApiCallListener = (fn) => {
  onApiCallListener = fn;
};

/**
 * Generic Fetch Wrapper that injects Authorization header
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach JWT Bearer token if user is logged in
  const token = tokenManager.get();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    // Trigger real-time logger for student visual feedback
    if (onApiCallListener) {
      onApiCallListener({
        method: options.method || "GET",
        endpoint,
        status: response.status,
        headers,
        body: options.body ? JSON.parse(options.body) : null,
        response: data,
      });
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    if (onApiCallListener) {
      onApiCallListener({
        method: options.method || "GET",
        endpoint,
        status: 500,
        headers,
        response: { error: error.message },
      });
    }
    throw error;
  }
}

// --- Authentication Endpoints ---
export const authAPI = {
  register: (name, email, password, role = "user") =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    request("/api/auth/me", {
      method: "GET",
    }),
};

// --- Restaurant Endpoints ---
export const restaurantAPI = {
  getAll: () =>
    request("/api/restaurants", {
      method: "GET",
    }),

  getById: (id) =>
    request(`/api/restaurants/${id}`, {
      method: "GET",
    }),

  create: (restaurantData) =>
    request("/api/restaurants", {
      method: "POST",
      body: JSON.stringify(restaurantData),
    }),

  update: (id, restaurantData) =>
    request(`/api/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(restaurantData),
    }),

  delete: (id) =>
    request(`/api/restaurants/${id}`, {
      method: "DELETE",
    }),
};
