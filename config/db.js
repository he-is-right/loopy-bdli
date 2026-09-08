// Analogy: Think of Mongoose as a "translator" and "guard"
// between your Express application and the MongoDB database.
// It ensures data is structured properly before storing it.

const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loopy_db";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Tip: Make sure MongoDB is running locally (e.g., 'net start MongoDB') or update MONGO_URI in your .env file with a cloud MongoDB Atlas connection string.`);
  }
};

module.exports = connectDB;
