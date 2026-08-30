import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

console.log("🔍 Loading routes...");

try {
  const { default: courseRoutes } =
    await import("./routes/courseRoutes.js");
  console.log("✅ courseRoutes loaded");

  const { default: homeworkRoutes } =
    await import("./routes/homeworkRoutes.js");
  console.log("✅ homeworkRoutes loaded");

  const { default: classRoutes } =
    await import("./routes/classRoutes.js");
  console.log("✅ classRoutes loaded");

  const { default: examRoutes } =
    await import("./routes/examRoutes.js");
  console.log("✅ examRoutes loaded");

  const { default: progressRoutes } =
    await import("./routes/progressRoutes.js");
  console.log("✅ progressRoutes loaded");

  const { default: questionRoutes } =
    await import("./routes/questionRoutes.js");
  console.log("✅ questionRoutes loaded");

  const { default: examAttemptRoutes } =
    await import("./routes/examAttemptRoutes.js");
  console.log("✅ examAttemptRoutes loaded");

  const { default: uploadRoutes } =
    await import("./routes/uploadRoutes.js");
  console.log("✅ uploadRoutes loaded");

  const { default: teacherRoutes } =
    await import("./routes/teacherRoutes.js");
  console.log("✅ teacherRoutes loaded");

  const { default: userRoutes } =
    await import("./routes/userRoutes.js");
  console.log("✅ userRoutes loaded");

  console.log("🎉 ALL ROUTES LOADED SUCCESSFULLY");

  app.use("/api/courses", courseRoutes);
  app.use("/api/homeworks", homeworkRoutes);
  app.use("/api/classes", classRoutes);
  app.use("/api/exams", examRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/exam-attempt", examAttemptRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/teacher", teacherRoutes);
  app.use("/api/user", userRoutes);

} catch (error) {
  console.error("❌ ROUTE LOAD ERROR:");
  console.error(error);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀"
  });
});

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