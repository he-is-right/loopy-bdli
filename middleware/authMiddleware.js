// Analogy:
// 1. Authentication (protect) = "Security Guard checking your VIP Wristband / Passport"
//    - "Who are you? Is your ticket valid?"
// 2. Authorization (authorize) = "Checking if your VIP wristband gets you into the Backstage Lounge"
//    - "Do you have the right role (Admin) to perform this action?"

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware 1: Protect routes by verifying the JWT token
const protect = async (req, res, next) => {
  let token;

  // 1. Check if token is sent in the Authorization header in the format "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>" (splitting by space and getting 2nd element)
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token signature and expiration with our secret key
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "loopy_jwt_secret_key_12345"
      );

      // 3. Fetch user data from Database (excluding password) and attach to req object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User belonging to this token no longer exists.",
        });
      }

      // Move to the next middleware or controller
      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token is invalid or expired.",
      });
    }
  }

  // If no token is provided at all
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No Bearer token provided in headers.",
    });
  }
};

// Middleware 2: Restrict access based on user role (e.g. 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "unknown"}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
