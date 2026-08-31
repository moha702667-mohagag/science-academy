import express from "express";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.get("/", (req, res) => {
  res.send("Science Academy Backend is Working 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("🚀 TEST SERVER STARTED");
  console.log("PORT:", PORT);
  console.log("=================================");
});