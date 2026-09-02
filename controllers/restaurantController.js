// CONTROLLERS: "The Managers"
// A controller's job is to contain the actual business logic of the application.
// It receives the order (request) from the router, does the necessary work
// (like fetching data), and sends back the result (response).

let restaurants = [
  {
    id: 1,
    name: "Chicken Republic",
    category: "Fast Food",
  },
  {
    id: 2,
    name: "Genesis",
    category: "Restaurant",
  },
  {
    id: 3,
    name: "Domino's Pizza",
    category: "Pizza",
  },
];

// Controller for getting all restaurants
const getAllRestaurants = (req, res) => {
  res.json(restaurants);
};

// Controller for getting a single restaurant by ID
const getRestaurantById = (req, res) => {
  const id = Number(req.params.id);
  const restaurant = restaurants.find((restaurant) => restaurant.id === id);

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  res.json(restaurant);
};

// Controller for adding a new restaurant
const createRestaurant = (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  const newId =
    restaurants.length > 0 ? Math.max(...restaurants.map((r) => r.id)) + 1 : 1;
  const newRestaurant = { id: newId, name, category };

  restaurants.push(newRestaurant);
  res.status(201).json(newRestaurant);
};

// Controller for updating a restaurant
const updateRestaurant = (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body;

  const restaurantIndex = restaurants.findIndex((r) => r.id === id);

  if (restaurantIndex === -1) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const updatedRestaurant = {
    ...restaurants[restaurantIndex],
    name: name !== undefined ? name : restaurants[restaurantIndex].name,
    category:
      category !== undefined ? category : restaurants[restaurantIndex].category,
  };

  restaurants[restaurantIndex] = updatedRestaurant;
  res.json(updatedRestaurant);
};

// Controller for deleting a restaurant
const deleteRestaurant = (req, res) => {
  const id = Number(req.params.id);
  const restaurantIndex = restaurants.findIndex((r) => r.id === id);

  if (restaurantIndex === -1) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const deletedRestaurant = restaurants.splice(restaurantIndex, 1);
  res.json(deletedRestaurant[0]);
};

// Export all the controller functions so they can be used in our routes file
module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
