const express = require("express");
const router = express.Router();

const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

// Import Auth Middleware
const { protect, authorize } = require("../middleware/authMiddleware");

// PUBLIC ROUTES: Anyone can view restaurants
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// PROTECTED ROUTES: Only authenticated users can create, update, or delete
router.post("/", protect, createRestaurant);
router.put("/:id", protect, updateRestaurant);
router.delete("/:id", protect, deleteRestaurant);

module.exports = router;
