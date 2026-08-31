import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

console.log("==========================================");
console.log("🧪 SCIENCE ACADEMY DEPLOYMENT TEST");
console.log("==========================================");
console.log("Express: ✅");
console.log("dotenv: ✅");
console.log("mongoose: ✅");
console.log("PORT:", PORT);
console.log("MONGO_URI:", MONGO_URI ? "SET" : "NOT SET");
console.log("==========================================");

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Science Academy Test Server",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log("==========================================");
  console.log("🚀 TEST SERVER STARTED");
  console.log("📡 PORT:", PORT);
  console.log("==========================================");

  if (!MONGO_URI) {
    console.log("⚠️ MONGO_URI is not configured");
    return;
  }

  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("🟢 MongoDB connected successfully");
  } catch (error) {
    console.error("🔴 MongoDB CONNECTION ERROR:");
    console.error(error.message);
  }
});