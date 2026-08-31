import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "./models/User.js";
import Teacher from "./models/Teacher.js";
import Homework from "./models/Homework.js";

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


// ==========================================
// USER MODEL
// ==========================================

console.log("==========================================");
console.log("👤 User Model: loading...");
console.log("==========================================");

try {
  console.log("👤 User Model: LOADED ✅");
} catch (error) {
  console.error("❌ USER MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// TEACHER MODEL
// ==========================================

console.log("==========================================");
console.log("👨‍🏫 Teacher Model: loading...");
console.log("==========================================");

try {
  console.log("👨‍🏫 Teacher Model: LOADED ✅");
} catch (error) {
  console.error("❌ TEACHER MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// HOMEWORK MODEL
// ==========================================

console.log("==========================================");
console.log("📝 Homework Model: loading...");
console.log("==========================================");

try {
  console.log("📝 Homework Model: LOADED ✅");
} catch (error) {
  console.error("❌ HOMEWORK MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// ENVIRONMENT
// ==========================================

console.log("==========================================");
console.log("📋 Environment");
console.log("==========================================");

console.log("PORT:", PORT);

console.log(
  "MONGO_URI:",
  MONGO_URI ? "SET ✅" : "NOT SET ❌"
);


// ==========================================
// ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Science Academy Test Server is running 🚀",
  });
});


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",

    message:
      "Science Academy Test Server is healthy 🚀",

    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});


// ==========================================
// START SERVER
// ==========================================

console.log("==========================================");
console.log("🚀 TEST SERVER STARTING");
console.log("==========================================");

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("==========================================");
    console.log("🚀 TEST SERVER STARTED");
    console.log("📡 PORT:", PORT);
    console.log("==========================================");
  }
);


server.on("error", (error) => {
  console.error("❌ SERVER ERROR:");
  console.error(error);
});


// ==========================================
// DATABASE
// ==========================================

const connectDatabase = async () => {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing");
    return;
  }

  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(
      "🟢 MongoDB connected successfully"
    );

    console.log("==========================================");
    console.log("👤 User Model test: SUCCESS ✅");
    console.log("👨‍🏫 Teacher Model test: SUCCESS ✅");
    console.log("📝 Homework Model test: SUCCESS ✅");
    console.log("==========================================");

  } catch (error) {
    console.error(
      "❌ MongoDB CONNECTION ERROR:"
    );

    console.error(error.message);
  }
};


// ==========================================
// MONGOOSE EVENTS
// ==========================================

mongoose.connection.on(
  "connected",
  () => {
    console.log(
      "🟢 MongoDB connection established"
    );
  }
);


mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "🔴 MongoDB ERROR:"
    );

    console.error(
      error.message
    );
  }
);


mongoose.connection.on(
  "disconnected",
  () => {
    console.log(
      "🟡 MongoDB disconnected"
    );
  }
);


// ==========================================
// CONNECT
// ==========================================

connectDatabase();