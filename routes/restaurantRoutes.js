// ROUTING: "The Traffic Cop"
// A router determines how your application responds to client requests for
// specific endpoints. It looks at the HTTP Method (GET, POST, etc.) and the
// URL path, and then directs the traffic to the correct controller.

const express = require("express");
const router = express.Router();

// Import the controllers we created
const restaurantController = require("../controllers/restaurantController");

// 1. GET request: Asking for all restaurants
// When someone visits /restaurants, call the getAllRestaurants controller.
router.get("/", restaurantController.getAllRestaurants);

// 2. GET request (with ID): Asking for a specific restaurant
router.get("/:id", restaurantController.getRestaurantById);

// 3. POST request: Creating a new restaurant
router.post("/", restaurantController.createRestaurant);

// 4. PUT request: Updating an existing restaurant
router.put("/:id", restaurantController.updateRestaurant);

// 5. DELETE request: Removing a restaurant
router.delete("/:id", restaurantController.deleteRestaurant);

// Export the router so we can use it in our main app.js
module.exports = router;
