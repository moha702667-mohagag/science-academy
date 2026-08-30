import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

console.log("🚀 SERVER STARTED");
console.log("🔍 Testing route imports...");

const routes = [
  ["courseRoutes", "./routes/courseRoutes.js"],
  ["homeworkRoutes", "./routes/homeworkRoutes.js"],
  ["classRoutes", "./routes/classRoutes.js"],
  ["examRoutes", "./routes/examRoutes.js"],
  ["progressRoutes", "./routes/progressRoutes.js"],
  ["questionRoutes", "./routes/questionRoutes.js"],
  ["examAttemptRoutes", "./routes/examAttemptRoutes.js"],
  ["uploadRoutes", "./routes/uploadRoutes.js"],
  ["teacherRoutes", "./routes/teacherRoutes.js"],
  ["userRoutes", "./routes/userRoutes.js"],
];

for (const [name, path] of routes) {
  try {
    await import(path);
    console.log(`✅ ${name} OK`);
  } catch (error) {
    console.error(`❌ ${name} FAILED`);
    console.error(error);
    process.exit(1);
  }
}

console.log("🎉 ALL ROUTES OK");

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB ERROR");
    console.error(error);
    process.exit(1);
  });