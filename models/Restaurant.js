// This replaces the temporary in-memory JavaScript array we used before!
// Data is now persisted permanently in MongoDB.

const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a restaurant name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Please specify a category (e.g. Fast Food, Pizza, Seafood)"],
      trim: true,
    },
    address: {
      type: String,
      default: "Not provided",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: 4.0,
    },
    // DATABASE INTEGRATION & RELATIONSHIPS:
    // Linking each restaurant to the user who created it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
