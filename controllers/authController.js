// Handles registration, login, and token generation.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to generate a signed JSON Web Token (JWT)
// Analogy: Generating a digital stamped passport with user ID inside.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "loopy_jwt_secret_key_12345", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation: Ensure required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // 2. Check if user already exists with this email
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // 3. Create user in database (Password is hashed automatically in User model hook!)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "user",
    });

    // 4. Generate JWT token for immediate login after registration
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation: Check that email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // 2. Find user by email (Explicitly select '+password' because select: false was in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (User not found).",
      });
    }

    // 3. Verify password against the stored bcrypt hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (Incorrect password).",
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private (Requires 'protect' middleware)
const getMe = async (req, res) => {
  try {
    // req.user was already fetched and attached by the protect middleware!
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
