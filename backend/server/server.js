import express from "express";

console.log("===== SERVER FILE STARTED =====");

const app = express();

const PORT = process.env.PORT || 5000;

console.log("PORT =", PORT);

try {
  console.log("Loading courseRoutes...");

  const { default: courseRoutes } =
    await import("./routes/courseRoutes.js");

  console.log("✅ courseRoutes loaded");

  app.use("/api/courses", courseRoutes);

} catch (error) {
  console.error("❌ courseRoutes FAILED");
  console.error(error);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});