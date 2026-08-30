import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

/* ================================
   TEST MODELS
================================ */

console.log("🔍 Loading models...");

try {
  const { default: User } = await import("./models/User.js");
  console.log("✅ User model loaded");

  const { default: Teacher } = await import("./models/Teacher.js");
  console.log("✅ Teacher model loaded");

  const { default: Homework } = await import("./models/Homework.js");
  console.log("✅ Homework model loaded");

} catch (error) {
  console.error("❌ MODEL LOAD ERROR:");
  console.error(error);
  process.exit(1);
}

/* ================================
   ROUTE
================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀"
  });
});

/* ================================
   DATABASE
================================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  })
  .catch((error) => {

    console.error("❌ MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);

  });