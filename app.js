const express = require("express");

const app = express();

// MIDDLEWARE: "The Assembly Line"
// Middleware functions run in the middle of a request, before it reaches the controller.
// They can modify the request, log information, check permissions, etc.

// 1. Built-in Middleware: Parses incoming JSON data from requests
app.use(express.json());

// 2. Custom Middleware: A simple logger
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);

  // Important: next() must be called to pass the request down the assembly line!
  next();
};

// Use our custom logger middleware globally for all routes
app.use(logger);

// IMPORT ROUTERS
const restaurantRoutes = require("./routes/restaurantRoutes");

// Tell the app to use the restaurantRoutes for any URL that starts with "/restaurants"
app.use("/restaurants", restaurantRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to BDLI");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
