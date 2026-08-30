import express from "express";

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Science Academy Backend is running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 TEST SERVER RUNNING ON PORT ${PORT}`);
});