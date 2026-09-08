// We have upgraded from an in-memory array to real MongoDB queries using Mongoose!
// Every write action (Create, Update, Delete) is linked to authenticated users.

const Restaurant = require("../models/Restaurant");

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = async (req, res) => {
  try {
    // Fetch all restaurants and populate creator's name & email
    const restaurants = await Restaurant.find().populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching restaurants",
      error: error.message,
    });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    // If Mongoose CastError happens (e.g. invalid ObjectId format)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${req.params.id}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (Requires authentication)
const createRestaurant = async (req, res) => {
  try {
    const { name, category, address, rating } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and category for the restaurant.",
      });
    }

    // Associate the logged in user as the creator
    const newRestaurant = await Restaurant.create({
      name,
      category,
      address,
      rating,
      createdBy: req.user._id, // Gotten from protect middleware!
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully!",
      data: newRestaurant,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating restaurant",
      error: error.message,
    });
  }
};

// @desc    Update an existing restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Owner or Admin only)
const updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // AUTHORIZATION CHECK:
    // Ensure that only the creator of the restaurant (or an admin) can update it
    if (
      restaurant.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this restaurant (Not the owner).",
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the modified document rather than original
      runValidators: true, // Run schema validators on update
    });

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully!",
      data: restaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${req.params.id}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner or Admin only)
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // AUTHORIZATION CHECK:
    // Ensure that only the creator of the restaurant (or an admin) can delete it
    if (
      restaurant.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this restaurant (Not the owner).",
      });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully!",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${req.params.id}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
