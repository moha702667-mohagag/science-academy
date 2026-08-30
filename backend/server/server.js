import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

console.log("🔍 Checking environment...");
console.log("PORT:", PORT);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log(
  "CLOUDINARY_CLOUD_NAME exists:",
  !!process.env.CLOUDINARY_CLOUD_NAME
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀",
  });
});

app.listen(PORT, "0.0.0.0", () => {
console.log(`🚀 Science Academy Backend running on port ${PORT}`);});