// Analogy: A Mongoose Schema is like a blueprint or a form template.
// It defines what fields a document must have, their data types,
// and any validation rules before data is saved to the database.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      // select: false prevents the password hash from being returned in queries by default
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// ==========================================
// PRE-SAVE HOOK: Password Hashing
// ==========================================
// Before saving a user to the database, we ALWAYS hash their password.
// We NEVER store raw passwords in plain text!
// Analogy: Putting a secret message into a meat grinder (one-way hashing).
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is newly created)
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt (random string added to the password to prevent rainbow table attacks)
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==========================================
// INSTANCE METHOD: Compare Passwords
// ==========================================
// Helper function to check if an entered plain-text password matches the stored hash.
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
