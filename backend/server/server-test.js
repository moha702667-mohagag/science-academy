import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "./models/User.js";
import Teacher from "./models/Teacher.js";
import Homework from "./models/Homework.js";

import courseRoutes from "./routes/courseRoutes.js";
import homeworkRoutes from "./routes/homeworkRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import examRoutes from "./routes/examRoutes.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "";


// ======================================================
// HEADER
// ======================================================

console.log("");
console.log("==========================================");
console.log("🧪 SCIENCE ACADEMY DEPLOYMENT TEST");
console.log("==========================================");

console.log("Express: ✅");
console.log("dotenv: ✅");
console.log("mongoose: ✅");


// ======================================================
// ENVIRONMENT
// ======================================================

console.log("");
console.log("==========================================");
console.log("📋 ENVIRONMENT");
console.log("==========================================");

console.log("PORT:", PORT);

console.log(
  "MONGO_URI:",
  MONGO_URI ? "SET ✅" : "NOT SET ❌"
);

console.log("==========================================");


// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


// ======================================================
// TEST STATUS
// ======================================================

const testStatus = {
  server: true,

  userModel: false,
  teacherModel: false,
  homeworkModel: false,

  courseRoutes: false,
  homeworkRoutes: false,
  classRoutes: false,
  examRoutes: false,
  progressRoutes: false,
  questionRoutes: false,

  progressError: null,
  questionError: null,

  database: false,
};


// ======================================================
// USER MODEL
// ======================================================

console.log("");
console.log("==========================================");
console.log("👤 User Model: loading...");
console.log("==========================================");

try {

  if (!User) {
    throw new Error("User model is undefined");
  }

  testStatus.userModel = true;

  console.log("👤 User Model: LOADED ✅");

} catch (error) {

  console.error("❌ USER MODEL ERROR:");
  console.error(error);

}


// ======================================================
// TEACHER MODEL
// ======================================================

console.log("");
console.log("==========================================");
console.log("👨‍🏫 Teacher Model: loading...");
console.log("==========================================");

try {

  if (!Teacher) {
    throw new Error("Teacher model is undefined");
  }

  testStatus.teacherModel = true;

  console.log("👨‍🏫 Teacher Model: LOADED ✅");

} catch (error) {

  console.error("❌ TEACHER MODEL ERROR:");
  console.error(error);

}


// ======================================================
// HOMEWORK MODEL
// ======================================================

console.log("");
console.log("==========================================");
console.log("📝 Homework Model: loading...");
console.log("==========================================");

try {

  if (!Homework) {
    throw new Error("Homework model is undefined");
  }

  testStatus.homeworkModel = true;

  console.log("📝 Homework Model: LOADED ✅");

} catch (error) {

  console.error("❌ HOMEWORK MODEL ERROR:");
  console.error(error);

}


// ======================================================
// COURSE ROUTES
// ======================================================

console.log("");
console.log("==========================================");
console.log("📚 Course Routes: loading...");
console.log("==========================================");

try {

  app.use(
    "/api/courses",
    courseRoutes
  );

  testStatus.courseRoutes = true;

  console.log("📚 Course Routes: LOADED ✅");

} catch (error) {

  console.error("❌ COURSE ROUTES ERROR:");
  console.error(error);

}


// ======================================================
// HOMEWORK ROUTES
// ======================================================

console.log("");
console.log("==========================================");
console.log("📝 Homework Routes: loading...");
console.log("==========================================");

try {

  app.use(
    "/api/homeworks",
    homeworkRoutes
  );

  testStatus.homeworkRoutes = true;

  console.log("📝 Homework Routes: LOADED ✅");

} catch (error) {

  console.error("❌ HOMEWORK ROUTES ERROR:");
  console.error(error);

}


// ======================================================
// CLASS ROUTES
// ======================================================

console.log("");
console.log("==========================================");
console.log("👥 Class Routes: loading...");
console.log("==========================================");

try {

  app.use(
    "/api/classes",
    classRoutes
  );

  testStatus.classRoutes = true;

  console.log("👥 Class Routes: LOADED ✅");

} catch (error) {

  console.error("❌ CLASS ROUTES ERROR:");
  console.error(error);

}


// ======================================================
// EXAM ROUTES
// ======================================================

console.log("");
console.log("==========================================");
console.log("📝 Exam Routes: loading...");
console.log("==========================================");

try {

  app.use(
    "/api/exams",
    examRoutes
  );

  testStatus.examRoutes = true;

  console.log("📝 Exam Routes: LOADED ✅");

} catch (error) {

  console.error("❌ EXAM ROUTES ERROR:");
  console.error(error);

}


// ======================================================
// ROOT
// ======================================================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Science Academy Test Server is running 🚀",

      testStatus,

    });

  }
);


// ======================================================
// HEALTH
// ======================================================

app.get(
  "/health",
  (req, res) => {

    res.status(200).json({

      success: true,

      status: "ok",

      message:
        "Science Academy Test Server is healthy 🚀",

      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",

      progressRoutes:
        testStatus.progressRoutes
          ? "loaded"
          : "not loaded",

      questionRoutes:
        testStatus.questionRoutes
          ? "loaded"
          : "not loaded",

    });

  }
);


// ======================================================
// TEST STATUS
// ======================================================

app.get(
  "/test-status",
  (req, res) => {

    res.status(200).json({

      success: true,

      ...testStatus,

    });

  }
);


// ======================================================
// START SERVER FIRST
// ======================================================

console.log("");
console.log("==========================================");
console.log("🚀 TEST SERVER STARTING");
console.log("==========================================");

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "🚀 TEST SERVER STARTED"
    );

    console.log(
      "📡 PORT:",
      PORT
    );

    console.log(
      "=========================================="
    );

    console.log("");

    console.log(
      "🌐 Server is now listening"
    );

    console.log(
      "❤️ Health: /health"
    );

    console.log(
      "🧪 Status: /test-status"
    );

  }
);


// ======================================================
// SERVER ERROR
// ======================================================

server.on(
  "error",
  (error) => {

    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      "❌ SERVER ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(error);

  }
);


// ======================================================
// DATABASE
// ======================================================

const connectDatabase = async () => {

  if (!MONGO_URI) {

    console.error("");

    console.error(
      "❌ MONGO_URI is missing"
    );

    return;

  }

  try {

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "⏳ CONNECTING TO MONGODB..."
    );

    console.log(
      "=========================================="
    );

    await mongoose.connect(
      MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      }
    );

    testStatus.database = true;

    console.log("");

    console.log(
      "🟢 MongoDB connected successfully"
    );

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "🧪 CURRENT TEST STATUS"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "👤 User Model:",
      testStatus.userModel
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "👨‍🏫 Teacher Model:",
      testStatus.teacherModel
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "📝 Homework Model:",
      testStatus.homeworkModel
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "📚 Course Routes:",
      testStatus.courseRoutes
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "📝 Homework Routes:",
      testStatus.homeworkRoutes
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "👥 Class Routes:",
      testStatus.classRoutes
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "📝 Exam Routes:",
      testStatus.examRoutes
        ? "SUCCESS ✅"
        : "FAILED ❌"
    );

    console.log(
      "📈 Progress Routes:",
      testStatus.progressRoutes
        ? "SUCCESS ✅"
        : "NOT TESTED ❌"
    );

    console.log(
      "❓ Question Routes:",
      testStatus.questionRoutes
        ? "SUCCESS ✅"
        : "NOT TESTED ❌"
    );

    console.log(
      "=========================================="
    );

  } catch (error) {

    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      "❌ MONGODB CONNECTION ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(error.message);

  }

};


// ======================================================
// MONGOOSE EVENTS
// ======================================================

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

    console.error("");

    console.error(
      "🔴 MONGODB ERROR:"
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


// ======================================================
// PROGRESS ROUTES
// LOAD AFTER SERVER STARTS
// ======================================================

const loadProgressRoutes = async () => {

  console.log("");

  console.log(
    "=========================================="
  );

  console.log(
    "📈 PROGRESS ROUTES: loading..."
  );

  console.log(
    "=========================================="
  );

  try {

    console.log(
      "📈 Importing progressRoutes.js..."
    );

    const module =
      await import("./routes/progressRoutes.js");

    console.log(
      "📈 progressRoutes.js imported successfully"
    );

    const progressRoutes =
      module.default;

    if (!progressRoutes) {

      throw new Error(
        "progressRoutes.js does not have a default export"
      );

    }

    console.log(
      "📈 Registering /api/progress..."
    );

    app.use(
      "/api/progress",
      progressRoutes
    );

    testStatus.progressRoutes = true;
    testStatus.progressError = null;

    console.log(
      "📈 Progress Routes: LOADED ✅"
    );

    console.log(
      "=========================================="
    );

  } catch (error) {

    testStatus.progressRoutes = false;

    testStatus.progressError =
      error?.stack ||
      error?.message ||
      String(error);

    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      "❌ PROGRESS ROUTES ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error("");

    console.error(
      "FULL ERROR:"
    );

    console.error(
      error?.stack ||
      error
    );

    console.error("");

    console.error(
      "⚠️ Server will remain ONLINE so we can inspect the error."
    );

    console.error(
      "⚠️ Progress Routes were NOT registered."
    );

    console.error(
      "=========================================="
    );

  }

};


// ======================================================
// QUESTION ROUTES
// LOAD AFTER SERVER STARTS
// ======================================================

const loadQuestionRoutes = async () => {

  console.log("");

  console.log(
    "=========================================="
  );

  console.log(
    "❓ QUESTION ROUTES: loading..."
  );

  console.log(
    "=========================================="
  );

  try {

    console.log(
      "❓ Importing questionRoutes.js..."
    );

    const module =
      await import("./routes/questionRoutes.js");

    console.log(
      "❓ questionRoutes.js imported successfully"
    );

    const questionRoutes =
      module.default;

    if (!questionRoutes) {

      throw new Error(
        "questionRoutes.js does not have a default export"
      );

    }

    console.log(
      "❓ Registering /api/questions..."
    );

    app.use(
      "/api/questions",
      questionRoutes
    );

    testStatus.questionRoutes = true;
    testStatus.questionError = null;

    console.log(
      "❓ Question Routes: LOADED ✅"
    );

    console.log(
      "=========================================="
    );

  } catch (error) {

    testStatus.questionRoutes = false;

    testStatus.questionError =
      error?.stack ||
      error?.message ||
      String(error);

    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      "❌ QUESTION ROUTES ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error("");

    console.error(
      "FULL ERROR:"
    );

    console.error(
      error?.stack ||
      error
    );

    console.error("");

    console.error(
      "⚠️ Server will remain ONLINE so we can inspect the error."
    );

    console.error(
      "⚠️ Question Routes were NOT registered."
    );

    console.error(
      "=========================================="
    );

  }

};


// ======================================================
// 404
// ======================================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "Route not found",

      path:
        req.originalUrl,

    });

  }
);


// ======================================================
// START TESTS
// ======================================================

connectDatabase();

loadProgressRoutes();

loadQuestionRoutes();