// ==========================================
// LOOPY RESTAURANT MANAGER - STUDENT APP SCRIPT
// Simple Vanilla JavaScript for API consumption
// ==========================================

// Base API URL
const API_BASE = window.location.origin.includes("http") && !window.location.origin.includes("null") 
  ? window.location.origin 
  : "http://localhost:3000";

// Stored current user data and restaurants
let currentUser = null;
let restaurants = [];

// ==========================================
// 1. INITIALIZATION ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkAuth();
  fetchRestaurants();
});

// ==========================================
// 2. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Tab Switching between Login and Register
  document.getElementById("tab-login").addEventListener("click", () => showAuthTab("login"));
  document.getElementById("tab-register").addEventListener("click", () => showAuthTab("register"));

  // Form Submissions
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("register-form").addEventListener("submit", handleRegister);
  document.getElementById("add-restaurant-form").addEventListener("submit", handleAddRestaurant);

  // Logout and Refresh Buttons
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
  document.getElementById("refresh-btn").addEventListener("click", fetchRestaurants);

  // Search Input Filter
  document.getElementById("search-input").addEventListener("input", handleSearch);

  // Demo Autofill Buttons
  document.getElementById("demo-student").addEventListener("click", () => {
    document.getElementById("login-email").value = "student@example.com";
    document.getElementById("login-password").value = "password123";
  });
  document.getElementById("demo-admin").addEventListener("click", () => {
    document.getElementById("login-email").value = "admin@example.com";
    document.getElementById("login-password").value = "admin123";
  });
}

// Switch between Login and Register forms
function showAuthTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("tab-login").classList.toggle("active", isLogin);
  document.getElementById("tab-register").classList.toggle("active", !isLogin);
  document.getElementById("login-form").style.display = isLogin ? "block" : "none";
  document.getElementById("register-form").style.display = !isLogin ? "block" : "none";
  clearAlert("auth-alert");
}

// ==========================================
// 3. AUTHENTICATION FUNCTIONS
// ==========================================

// Check if user has a token stored in localStorage
async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    updateAuthUI(null);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (response.ok && result.user) {
      currentUser = result.user;
      updateAuthUI(currentUser);
    } else {
      localStorage.removeItem("token");
      updateAuthUI(null);
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    updateAuthUI(null);
  }
}

// Handle Login Form Submit
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok && result.token) {
      localStorage.setItem("token", result.token);
      currentUser = result.user;
      updateAuthUI(currentUser);
      showAlert("auth-alert", `Logged in successfully as ${result.user.name}`, "success");
      renderRestaurants(restaurants);
    } else {
      showAlert("auth-alert", result.message || "Invalid credentials", "error");
    }
  } catch (error) {
    showAlert("auth-alert", "Cannot connect to server", "error");
  }
}

// Handle Register Form Submit
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const result = await response.json();

    if (response.ok && result.token) {
      localStorage.setItem("token", result.token);
      currentUser = result.user;
      updateAuthUI(currentUser);
      showAlert("auth-alert", `Account created! Logged in as ${result.user.name}`, "success");
      showAuthTab("login");
      renderRestaurants(restaurants);
    } else {
      showAlert("auth-alert", result.message || "Registration failed", "error");
    }
  } catch (error) {
    showAlert("auth-alert", "Cannot connect to server", "error");
  }
}

// Handle Logout
function handleLogout() {
  localStorage.removeItem("token");
  currentUser = null;
  updateAuthUI(null);
  showAlert("auth-alert", "Logged out successfully", "success");
  renderRestaurants(restaurants);
}

// Update the top Auth Status Bar
function updateAuthUI(user) {
  const badge = document.getElementById("status-badge");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    badge.textContent = `Logged in: ${user.name} (${user.role})`;
    badge.className = "status-badge logged-in";
    logoutBtn.style.display = "inline-block";
  } else {
    badge.textContent = "Not Logged In";
    badge.className = "status-badge";
    logoutBtn.style.display = "none";
  }
}

// ==========================================
// 4. RESTAURANT CRUD FUNCTIONS
// ==========================================

// Fetch all restaurants from API
async function fetchRestaurants() {
  const container = document.getElementById("restaurant-list");
  container.innerHTML = `<p style="color: #718096; font-size: 14px;">Loading restaurants...</p>`;

  try {
    const response = await fetch(`${API_BASE}/api/restaurants`);
    const result = await response.json();

    if (response.ok && result.data) {
      restaurants = result.data;
      renderRestaurants(restaurants);
    } else {
      container.innerHTML = `<p style="color: #e53e3e;">${result.message || "Failed to load data"}</p>`;
    }
  } catch (error) {
    container.innerHTML = `<p style="color: #e53e3e;">Server error: Ensure backend and MongoDB are running.</p>`;
  }
}

// Render the restaurant list in HTML
function renderRestaurants(list) {
  const container = document.getElementById("restaurant-list");

  if (!list || list.length === 0) {
    container.innerHTML = `<p style="color: #718096; font-size: 14px; text-align: center; padding: 20px;">No restaurants found. Log in to add one.</p>`;
    return;
  }

  container.innerHTML = list.map((item) => {
    const creatorName = item.createdBy ? item.createdBy.name || item.createdBy.email : "Unknown";
    const canDelete = currentUser && item.createdBy && (item.createdBy._id === currentUser._id || currentUser.role === "admin");

    return `
      <div class="restaurant-item">
        <div class="restaurant-info">
          <h3>${escapeHtml(item.name)}</h3>
          <p><strong>Category:</strong> ${escapeHtml(item.category)} | <strong>Rating:</strong> ${item.rating || 4.0}/5</p>
          <p><strong>Address:</strong> ${escapeHtml(item.address || "Not specified")}</p>
          <div class="restaurant-meta">Added by: ${escapeHtml(creatorName)}</div>
        </div>
        <div>
          ${canDelete ? `<button type="button" class="btn-danger" onclick="deleteRestaurant('${item._id}')">Delete</button>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

// Search and Filter
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const filtered = restaurants.filter((r) => 
    r.name.toLowerCase().includes(query) ||
    r.category.toLowerCase().includes(query) ||
    (r.address && r.address.toLowerCase().includes(query))
  );
  renderRestaurants(filtered);
}

// Add a new restaurant (Protected Route)
async function handleAddRestaurant(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (!token) {
    showAlert("restaurant-alert", "You must log in first before adding a restaurant.", "error");
    return;
  }

  const name = document.getElementById("rest-name").value.trim();
  const category = document.getElementById("rest-category").value.trim();
  const address = document.getElementById("rest-address").value.trim();
  const rating = parseFloat(document.getElementById("rest-rating").value);

  try {
    const response = await fetch(`${API_BASE}/api/restaurants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, category, address, rating })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showAlert("restaurant-alert", `Restaurant "${name}" added successfully!`, "success");
      document.getElementById("add-restaurant-form").reset();
      fetchRestaurants();
    } else {
      showAlert("restaurant-alert", result.message || "Failed to add restaurant", "error");
    }
  } catch (error) {
    showAlert("restaurant-alert", "Network error adding restaurant", "error");
  }
}

// Delete a restaurant (Protected Route)
async function deleteRestaurant(id) {
  if (!confirm("Are you sure you want to delete this restaurant?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to delete.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/restaurants/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok && result.success) {
      fetchRestaurants();
    } else {
      alert(result.message || "Failed to delete");
    }
  } catch (error) {
    alert("Network error deleting restaurant");
  }
}

// Helper to show alert messages
function showAlert(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `alert ${type}`;
}

function clearAlert(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = "";
  el.className = "alert";
}

// Helper to escape HTML characters
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
