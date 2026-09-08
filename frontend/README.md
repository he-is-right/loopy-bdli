# 🌐 Loopy API Frontend Client

A standalone, pure **Vanilla HTML5, CSS3, and JavaScript (ES Modules)** frontend built to consume the **Loopy API** (Module 8: Authentication & Database Integration).

---

## 📁 Folder Structure

```
frontend/
├── index.html         # Semantic HTML5 layout and forms
├── css/
│   └── styles.css     # Modern dark mode theme with glassmorphism & responsive grid
├── js/
│   ├── api.js         # Fetch client, JWT token storage, and endpoint calls
│   └── app.js         # DOM manipulation, auth state management, and UI rendering
└── README.md          # Guide for students
```

---

## ⚡ How It Works

### 1. API Client (`js/api.js`)
- Stores and retrieves the JWT in `localStorage` (`loopy_jwt_token`).
- Automatically attaches the `Authorization: Bearer <token>` header to all protected requests (`POST`, `PUT`, `DELETE /api/restaurants`, `GET /api/auth/me`).
- Exposes modular functions: `authAPI.register()`, `authAPI.login()`, `authAPI.getMe()`, `restaurantAPI.getAll()`, `restaurantAPI.create()`, etc.

### 2. UI Controller (`js/app.js`)
- **Authentication**: Dynamically updates the user badge, online status dot, and token viewer upon login/register.
- **Protected Actions**: Disables/warns when guest users attempt protected write operations without logging in.
- **Network Inspector**: Displays the live HTTP Method, Status Code, and JSON Response directly in the UI for students to see client-server communication in real-time.

---

## 🚀 How to Run

### Option 1: Served by Express Backend (Recommended)
1. Start the backend:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   👉 **`http://localhost:3000/frontend/`** (or `http://localhost:3000`)

---

### Option 2: Standalone via Live Server
1. In VS Code, right click [`frontend/index.html`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/frontend/index.html) and select **"Open with Live Server"** (or use any static file server on port 5500 / 8080).
2. Because CORS headers are enabled on the backend in `app.js`, the frontend will connect to `http://localhost:3000` seamlessly!
