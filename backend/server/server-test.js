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
console.log("🧪 SCIENCE ACADEMY FULL BACKEND TEST");
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

  database: false,

  models: {
    user: false,
    teacher: false,
    homework: false,
  },

  routes: {
    courses: false,
    homeworks: false,
    classes: false,
    exams: false,
    progress: false,
    questions: false,
    examAttempt: false,
    user: false,
    teacher: false,
    upload: false,
  },

  errors: {
    progress: null,
    questions: null,
    examAttempt: null,
    user: null,
    teacher: null,
    upload: null,
  },

};


// ======================================================
// MODELS
// ======================================================

console.log("");
console.log("==========================================");
console.log("🧩 TESTING MODELS");
console.log("==========================================");


try {

  if (!User) {
    throw new Error("User model is undefined");
  }

  testStatus.models.user = true;

  console.log("👤 User Model: SUCCESS ✅");

} catch (error) {

  console.error("❌ User Model:", error.message);

}


try {

  if (!Teacher) {
    throw new Error("Teacher model is undefined");
  }

  testStatus.models.teacher = true;

  console.log("👨‍🏫 Teacher Model: SUCCESS ✅");

} catch (error) {

  console.error("❌ Teacher Model:", error.message);

}


try {

  if (!Homework) {
    throw new Error("Homework model is undefined");
  }

  testStatus.models.homework = true;

  console.log("📝 Homework Model: SUCCESS ✅");

} catch (error) {

  console.error("❌ Homework Model:", error.message);

}


// ======================================================
// STATIC ROUTES
// ======================================================

console.log("");
console.log("==========================================");
console.log("🛣️ TESTING STATIC ROUTES");
console.log("==========================================");


try {

  app.use(
    "/api/courses",
    courseRoutes
  );

  testStatus.routes.courses = true;

  console.log("📚 Course Routes: SUCCESS ✅");

} catch (error) {

  console.error("❌ Course Routes:", error.message);

}


try {

  app.use(
    "/api/homeworks",
    homeworkRoutes
  );

  testStatus.routes.homeworks = true;

  console.log("📝 Homework Routes: SUCCESS ✅");

} catch (error) {

  console.error("❌ Homework Routes:", error.message);

}


try {

  app.use(
    "/api/classes",
    classRoutes
  );

  testStatus.routes.classes = true;

  console.log("👥 Class Routes: SUCCESS ✅");

} catch (error) {

  console.error("❌ Class Routes:", error.message);

}


try {

  app.use(
    "/api/exams",
    examRoutes
  );

  testStatus.routes.exams = true;

  console.log("📝 Exam Routes: SUCCESS ✅");

} catch (error) {

  console.error("❌ Exam Routes:", error.message);

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
        "Science Academy Full Backend Test Server 🚀",

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

      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",

      routes: testStatus.routes,

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
// START SERVER
// ======================================================

console.log("");
console.log("==========================================");
console.log("🚀 STARTING SERVER");
console.log("==========================================");


const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");
    console.log("==========================================");
    console.log("🚀 SERVER STARTED SUCCESSFULLY");
    console.log("📡 PORT:", PORT);
    console.log("==========================================");

    console.log("🌐 /");
    console.log("❤️ /health");
    console.log("🧪 /test-status");

  }
);


// ======================================================
// SERVER ERROR
// ======================================================

server.on(
  "error",
  (error) => {

    console.error("");
    console.error("==========================================");
    console.error("❌ SERVER ERROR");
    console.error("==========================================");

    console.error(error);

  }
);


// ======================================================
// DATABASE
// ======================================================

const connectDatabase = async () => {

  if (!MONGO_URI) {

    console.error("");
    console.error("❌ MONGO_URI IS MISSING");

    return;

  }

  try {

    console.log("");
    console.log("==========================================");
    console.log("⏳ CONNECTING TO MONGODB");
    console.log("==========================================");

    await mongoose.connect(
      MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      }
    );

    testStatus.database = true;

    console.log("🟢 MongoDB CONNECTED ✅");

    printStatus();

  } catch (error) {

    console.error("");
    console.error("❌ MONGODB CONNECTION ERROR");
    console.error(error.message);

  }

};


// ======================================================
// MONGOOSE EVENTS
// ======================================================

mongoose.connection.on(
  "connected",
  () => {

    console.log("🟢 MongoDB connection established");

  }
);


mongoose.connection.on(
  "error",
  (error) => {

    console.error(
      "🔴 MongoDB ERROR:",
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
// PRINT STATUS
// ======================================================

const printStatus = () => {

  console.log("");
  console.log("==========================================");
  console.log("🧪 CURRENT BACKEND TEST STATUS");
  console.log("==========================================");

  console.log(
    "🟢 Database:",
    testStatus.database
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log("");

  console.log(
    "👤 User Model:",
    testStatus.models.user
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "👨‍🏫 Teacher Model:",
    testStatus.models.teacher
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "📝 Homework Model:",
    testStatus.models.homework
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log("");

  console.log(
    "📚 Course Routes:",
    testStatus.routes.courses
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "📝 Homework Routes:",
    testStatus.routes.homeworks
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "👥 Class Routes:",
    testStatus.routes.classes
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "📝 Exam Routes:",
    testStatus.routes.exams
      ? "SUCCESS ✅"
      : "FAILED ❌"
  );

  console.log(
    "📈 Progress Routes:",
    testStatus.routes.progress
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log(
    "❓ Question Routes:",
    testStatus.routes.questions
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log(
    "🧾 Exam Attempt Routes:",
    testStatus.routes.examAttempt
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log(
    "👤 User Routes:",
    testStatus.routes.user
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log(
    "👨‍🏫 Teacher Routes:",
    testStatus.routes.teacher
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log(
    "☁️ Upload Routes:",
    testStatus.routes.upload
      ? "SUCCESS ✅"
      : "NOT TESTED ❌"
  );

  console.log("==========================================");

};


// ======================================================
// LOAD PROGRESS ROUTES
// ======================================================

const loadProgressRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("📈 PROGRESS ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/progressRoutes.js"
      );

    const progressRoutes =
      module.default;

    if (!progressRoutes) {

      throw new Error(
        "progressRoutes.js has no default export"
      );

    }

    app.use(
      "/api/progress",
      progressRoutes
    );

    testStatus.routes.progress = true;

    console.log(
      "📈 Progress Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.progress = false;

    testStatus.errors.progress =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ Progress Routes:",
      error.message
    );

  }

};


// ======================================================
// LOAD QUESTION ROUTES
// ======================================================

const loadQuestionRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("❓ QUESTION ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/questionRoutes.js"
      );

    const questionRoutes =
      module.default;

    if (!questionRoutes) {

      throw new Error(
        "questionRoutes.js has no default export"
      );

    }

    app.use(
      "/api/questions",
      questionRoutes
    );

    testStatus.routes.questions = true;

    console.log(
      "❓ Question Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.questions = false;

    testStatus.errors.questions =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ Question Routes:",
      error.message
    );

  }

};


// ======================================================
// LOAD EXAM ATTEMPT ROUTES
// ======================================================

const loadExamAttemptRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("🧾 EXAM ATTEMPT ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/examAttemptRoutes.js"
      );

    const examAttemptRoutes =
      module.default;

    if (!examAttemptRoutes) {

      throw new Error(
        "examAttemptRoutes.js has no default export"
      );

    }

    app.use(
      "/api/exam-attempt",
      examAttemptRoutes
    );

    testStatus.routes.examAttempt = true;

    console.log(
      "🧾 Exam Attempt Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.examAttempt = false;

    testStatus.errors.examAttempt =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ Exam Attempt Routes:",
      error.message
    );

  }

};


// ======================================================
// LOAD USER ROUTES
// ======================================================

const loadUserRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("👤 USER ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/userRoutes.js"
      );

    const userRoutes =
      module.default;

    if (!userRoutes) {

      throw new Error(
        "userRoutes.js has no default export"
      );

    }

    app.use(
      "/api/user",
      userRoutes
    );

    testStatus.routes.user = true;

    console.log(
      "👤 User Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.user = false;

    testStatus.errors.user =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ User Routes:",
      error.message
    );

  }

};


// ======================================================
// LOAD TEACHER ROUTES
// ======================================================

const loadTeacherRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("👨‍🏫 TEACHER ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/teacherRoutes.js"
      );

    const teacherRoutes =
      module.default;

    if (!teacherRoutes) {

      throw new Error(
        "teacherRoutes.js has no default export"
      );

    }

    app.use(
      "/api/teacher",
      teacherRoutes
    );

    testStatus.routes.teacher = true;

    console.log(
      "👨‍🏫 Teacher Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.teacher = false;

    testStatus.errors.teacher =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ Teacher Routes:",
      error.message
    );

  }

};


// ======================================================
// LOAD UPLOAD ROUTES
// ======================================================

const loadUploadRoutes = async () => {

  console.log("");
  console.log("==========================================");
  console.log("☁️ UPLOAD ROUTES");
  console.log("==========================================");

  try {

    const module =
      await import(
        "./routes/uploadRoutes.js"
      );

    const uploadRoutes =
      module.default;

    if (!uploadRoutes) {

      throw new Error(
        "uploadRoutes.js has no default export"
      );

    }

    app.use(
      "/api/upload",
      uploadRoutes
    );

    testStatus.routes.upload = true;

    console.log(
      "☁️ Upload Routes: SUCCESS ✅"
    );

  } catch (error) {

    testStatus.routes.upload = false;

    testStatus.errors.upload =
      error?.stack ||
      error?.message ||
      String(error);

    console.error(
      "❌ Upload Routes:",
      error.message
    );

  }

};


// ======================================================
// START EVERYTHING
// ======================================================

const startTests = async () => {

  await connectDatabase();

  await loadProgressRoutes();

  await loadQuestionRoutes();

  await loadExamAttemptRoutes();

  await loadUserRoutes();

  await loadTeacherRoutes();

  await loadUploadRoutes();

  // مهم جدًا:
  // الـ 404 لازم يكون بعد تحميل كل الـ routes

  app.use(
    (req, res) => {

      res.status(404).json({

        success: false,

        message: "Route not found",

        path: req.originalUrl,

      });

    }
  );

  printStatus();

};


startTests();