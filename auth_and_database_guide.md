# 🎓 Bootcamp Module 8: Authentication & Database Integration Complete Guide

Welcome to **Module 8**! In the previous lesson, we learned how **Routing, Middleware, and Controllers** work using simple in-memory JavaScript arrays. 

Now, we take our API to production level by integrating:
1. **Database Persistence with MongoDB & Mongoose** (Replacing temporary arrays so data is permanently saved).
2. **Password Security with Bcrypt** (Hashing passwords with salts so they are never stored in plain text).
3. **Stateless Authentication with JSON Web Tokens (JWT)** (Secure token-based login and session verification).
4. **Protected Routes & Role Authorization** (Ensuring only authenticated users/admins can perform write and delete operations).

---

## 📑 Table of Contents
1. [Core Architectural Overview](#1-core-architectural-overview)
2. [Database Integration with MongoDB & Mongoose](#2-database-integration-with-mongodb--mongoose)
3. [Password Security & Hashing (Bcrypt)](#3-password-security--hashing-bcrypt)
4. [JSON Web Tokens (JWT) Explained](#4-json-web-tokens-jwt-explained)
5. [Authentication & Authorization Middleware](#5-authentication--authorization-middleware)
6. [Complete Code Breakdown](#6-complete-code-breakdown)
7. [Step-by-Step Hands-On Testing Guide (Postman / Thunder Client)](#7-step-by-step-hands-on-testing-guide)
8. [Common Pitfalls & Teaching Tips](#8-common-pitfalls--teaching-tips)

---

## 1. Core Architectural Overview

### 🏛️ The High-Level Architecture Flow

```
+-------------------------------------------------------------------------------+
|                                 CLIENT (Postman / Browser)                    |
+-------------------------------------------------------------------------------+
                                      │  ▲
 1. Request with Bearer Token in Header │  │ 6. JSON Response
                                      ▼  │
+───────────────────────────────────────────────────────────────────────────────+
|                                EXPRESS APP                                    |
|                                                                               |
|  2. Global Middleware (express.json, logger)                                   |
|       │                                                                       |
|       ▼                                                                       |
|  3. Auth Middleware (protect) ──► Checks JWT & attaches `req.user`             |
|       │                                                                       |
|       ▼                                                                       |
|  4. Controller (authController / restaurantController)                        |
|       │                                                                       |
|       ▼                                                                       |
|  5. Mongoose Models (User / Restaurant) ◄──► MONGODB DATABASE                 |
+───────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Database Integration with MongoDB & Mongoose

### ❓ Why Do We Need a Database?
In our earlier exercises, we stored restaurants in a JavaScript array:
```javascript
let restaurants = [{ id: 1, name: "Chicken Republic" }];
```
*Problem:* Every time the server restarts or crashes, **all newly added data is lost forever**.
*Solution:* A database (like MongoDB) writes our data to persistent disk storage.

### 🧩 What is Mongoose?
**Mongoose** is an Object Data Modeling (ODM) library for MongoDB and Node.js.
- **Analogy:** Think of Mongoose as a **building inspector and blueprint architect**. MongoDB itself is flexible and unstructured (NoSQL), but Mongoose enforces schemas, data types, and validations before anything is written to the database.

### 📐 Schema vs Model
- **Schema:** The blueprint (defines fields, types, default values, validations).
- **Model:** The active constructor built from the schema that provides methods like `find()`, `create()`, `findByIdAndUpdate()`, and `findByIdAndDelete()`.

```javascript
// models/Restaurant.js
const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  category: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 4.0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", RestaurantSchema);
```

---

## 3. Password Security & Hashing (Bcrypt)

### 🚨 The Golden Rule of Authentication
> **NEVER, UNDER ANY CIRCUMSTANCES, STORE PASSWORDS IN PLAIN TEXT.**

If a database is ever leaked, plain text passwords expose all user accounts immediately.

### 🔒 Encryption vs Hashing
- **Encryption (Two-way):** `Data` ➡️ `Encrypted String` ➡️ (with Secret Key) ➡️ `Original Data`.
- **Hashing (One-way):** `Password` ➡️ `Hash Algorithm` ➡️ `Unique Fingerprint`. You **cannot** reverse a hash back to the original password!

### 🧂 What is a "Salt"?
If two users choose the password `"password123"`, standard hashing would produce the identical hash for both. Attackers use precomputed tables (**Rainbow Tables**) to crack these.
- A **Salt** is a random string added to the password *before* hashing. 
- Even identical passwords will have completely different hashes!

```javascript
// models/User.js - Automatic Hashing Hook
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // 1. Generate salt (rounds = 10)
  const salt = await bcrypt.genSalt(10);
  
  // 2. Hash password with salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method to compare entered password during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

---

## 4. JSON Web Tokens (JWT) Explained

### 🎫 The Concert Wristband Analogy
Imagine going to a concert:
1. **Login:** You show your ID and ticket at the entrance booth.
2. **Token Issuance:** The security guard checks your ID and attaches a **tamper-proof wristband** with your ticket tier stamped on it.
3. **Subsequent Requests:** Whenever you want to enter the VIP section or buy a drink, you don't show your ID card every single time; you simply **show your wristband**!

### 🔍 Anatomy of a JWT
A JWT is a string separated by two dots (`.`): `header.payload.signature`

1. **Header (Red):** Specifies the algorithm (e.g., `HS256`) and token type (`JWT`).
2. **Payload (Purple):** Contains the data claims (e.g., `{ id: "64f1a2...", role: "user" }`, expiration time).
3. **Signature (Blue):** Generated by hashing `Header + Payload + SecretKey`. This guarantees that nobody can tamper with the payload without invalidating the token.

```javascript
// Generating a token in authController.js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});
```

---

## 5. Authentication & Authorization Middleware

### 🛡️ Authentication (`protect`)
Checks if the incoming request includes a valid Bearer token in the `Authorization` header.

```javascript
// middleware/authMiddleware.js
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token invalid or expired." });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided." });
  }
};
```

### 👑 Authorization (`authorize`)
Checks if the logged-in user possesses the required role (e.g. `admin`).

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized.`
      });
    }
    next();
  };
};
```

---

## 6. Complete Code Breakdown

Here is how all the pieces in our project connect together:

| File | Purpose |
| :--- | :--- |
| [`app.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/app.js) | Main entry point; loads `.env`, connects to DB, mounts routes, error handlers |
| [`config/db.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/config/db.js) | Connects Express to MongoDB using Mongoose |
| [`models/User.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/models/User.js) | User schema, bcrypt password hashing hook, password matcher |
| [`models/Restaurant.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/models/Restaurant.js) | Restaurant schema, data types, `createdBy` relation to User |
| [`middleware/authMiddleware.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/middleware/authMiddleware.js) | JWT verification (`protect`) and role checker (`authorize`) |
| [`controllers/authController.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/controllers/authController.js) | Registration, Login, and `getMe` controllers |
| [`controllers/restaurantController.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/controllers/restaurantController.js) | Full MongoDB CRUD with ownership validation |
| [`routes/authRoutes.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/routes/authRoutes.js) | Public & protected auth route definitions |
| [`routes/restaurantRoutes.js`](file:///c:/Users/Tim%20Dawadakpoye/Desktop/loopy-api/routes/restaurantRoutes.js) | Public GET routes and protected POST/PUT/DELETE routes |

---

## 7. Step-by-Step Hands-On Testing Guide

Use **Postman**, **Thunder Client** (VS Code Extension), or `curl` to test the API.

### 🧪 Step 1: Register a New User
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a23b9c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```
👉 **Action for Student:** Copy the `token` string!

---

### 🧪 Step 2: Login Existing User
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Expected Response (200 OK):** Returns new valid JWT token.

---

### 🧪 Step 3: Access Protected Route (`/api/auth/me`)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/auth/me`
- **Headers:**
  - `Authorization: Bearer <PASTE_YOUR_TOKEN_HERE>`
- **Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "65f1a23b9c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### 🧪 Step 4: Create a Restaurant (Protected)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/restaurants`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <PASTE_YOUR_TOKEN_HERE>`
- **Body (JSON):**
```json
{
  "name": "Mega Bites Grill",
  "category": "BBQ & Grill",
  "address": "12 Innovation Hub Way",
  "rating": 4.8
}
```
- **Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Restaurant created successfully!",
  "data": {
    "_id": "65f1c998a12...",
    "name": "Mega Bites Grill",
    "category": "BBQ & Grill",
    "address": "12 Innovation Hub Way",
    "rating": 4.8,
    "createdBy": "65f1a23b9c...",
    "createdAt": "2026-09-08T09:20:00.000Z"
  }
}
```

---

### 🧪 Step 5: Test Security (Unauthorized Access)
1. Try sending the `POST /api/restaurants` request **without** the `Authorization` header.
2. **Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized. No Bearer token provided in headers."
}
```
3. Try sending an invalid or expired token.
4. **Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized. Token is invalid or expired."
}
```

---

## 8. Common Pitfalls & Teaching Tips

| Gotcha | Why It Happens | Solution |
| :--- | :--- | :--- |
| **`Cannot read properties of undefined (reading 'split')`** | The client forgot to send the `Authorization` header or misspelled it. | Add check: `if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))`. |
| **Token sent without `Bearer ` prefix** | The client only passed the token without `Bearer `. | Remind students that the standard HTTP convention is `Bearer <token>`. |
| **Password returned in queries** | Mongoose returns all fields by default. | Set `select: false` on the password schema field and use `.select('+password')` explicitly in login. |
| **Database fails to connect** | MongoDB service is not running locally or `.env` `MONGO_URI` is wrong. | Check if MongoDB daemon is running (`mongod`) or provide MongoDB Atlas connection string. |
| **Double response (`Cannot set headers after they are sent`)** | Calling `res.status().json()` multiple times without `return`. | Always use `return res.status(...).json(...)` when stopping execution inside a controller. |

---

> [!TIP]
> **Instructor Note:** When demonstrating this live in class, first show the student what happens when you query the database directly to show that the password is a completely unreadable hash. This visually reinforces the importance of encryption and cryptographic security!
