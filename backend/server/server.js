import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

/* =========================
   BASIC MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).send("Science Academy Backend is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "running",
    mongodb: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  try {

    console.log("=================================");
    console.log("🚀 Starting Science Academy");
    console.log("PORT:", PORT);
    console.log("=================================");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    /*
      مهم جدًا:
      افتح الـ HTTP server الأول
      عشان Abasthan يشوف الـ port فورًا.
    */

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    /*
      MongoDB بعد تشغيل السيرفر
    */

    try {

      await mongoose.connect(process.env.MONGO_URI);

      console.log("✅ MongoDB connected successfully");

    } catch (mongoError) {

      console.error("❌ MongoDB connection failed:");
      console.error(mongoError);

      /*
        السيرفر يفضل شغال
        والـ health endpoint يوضح إن MongoDB واقع.
      */

    }

  } catch (error) {

    console.error("❌ SERVER STARTUP ERROR:");
    console.error(error);

    process.exit(1);
  }
};

startServer();