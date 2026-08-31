import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

console.log("==========================================");
console.log("🧪 SCIENCE ACADEMY DEPLOYMENT TEST");
console.log("==========================================");
console.log("Express: ✅");
console.log("dotenv: ✅");
console.log("PORT:", PORT);
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
    test: true,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");
  console.log("🚀 TEST SERVER STARTED");
  console.log("📡 PORT:", PORT);
  console.log("==========================================");
});