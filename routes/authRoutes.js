// Defines endpoints for user signup, login, and profile verification.

const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public endpoints
router.post("/register", register);
router.post("/login", login);

// Protected endpoint (Requires Bearer token in header)
router.get("/me", protect, getMe);

module.exports = router;
