import express from "express";
import mongoose from "mongoose";

console.log("===== SERVER FILE STARTED =====");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

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
    console.log(`Loading ${name}...`);

    const { default: router } = await import(path);

    console.log(`✅ ${name} loaded`);

    if (name === "courseRoutes") {
      app.use("/api/courses", router);
    }

    if (name === "homeworkRoutes") {
      app.use("/api/homeworks", router);
    }

    if (name === "classRoutes") {
      app.use("/api/classes", router);
    }

    if (name === "examRoutes") {
      app.use("/api/exams", router);
    }

    if (name === "progressRoutes") {
      app.use("/api/progress", router);
    }

    if (name === "questionRoutes") {
      app.use("/api/questions", router);
    }

    if (name === "examAttemptRoutes") {
      app.use("/api/exam-attempt", router);
    }

    if (name === "uploadRoutes") {
      app.use("/api/upload", router);
    }

    if (name === "teacherRoutes") {
      app.use("/api/teacher", router);
    }

    if (name === "userRoutes") {
      app.use("/api/user", router);
    }

  } catch (error) {

    console.error(`❌ ${name} FAILED`);
    console.error(error);

    process.exit(1);
  }
}

console.log("🎉 ALL ROUTES LOADED SUCCESSFULLY");

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Science Academy Backend is running 🚀",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Science Academy Backend running on port ${PORT}`);
});