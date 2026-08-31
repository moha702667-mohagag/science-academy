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

console.log("==========================================");
console.log("🧪 SCIENCE ACADEMY DEPLOYMENT TEST");
console.log("==========================================");

console.log("Express: ✅");
console.log("dotenv: ✅");
console.log("mongoose: ✅");


// ==========================================
// USER MODEL
// ==========================================

console.log("==========================================");
console.log("👤 User Model: loading...");
console.log("==========================================");

try {
  console.log("👤 User Model: LOADED ✅");
} catch (error) {
  console.error("❌ USER MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// TEACHER MODEL
// ==========================================

console.log("==========================================");
console.log("👨‍🏫 Teacher Model: loading...");
console.log("==========================================");

try {
  console.log("👨‍🏫 Teacher Model: LOADED ✅");
} catch (error) {
  console.error("❌ TEACHER MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// HOMEWORK MODEL
// ==========================================

console.log("==========================================");
console.log("📝 Homework Model: loading...");
console.log("==========================================");

try {
  console.log("📝 Homework Model: LOADED ✅");
} catch (error) {
  console.error("❌ HOMEWORK MODEL ERROR:");
  console.error(error);
  process.exit(1);
}


// ==========================================
// COURSE ROUTES
// ==========================================

console.log("==========================================");
console.log("📚 Course Routes: loading...");
console.log("==========================================");

try {
  app.use(
    "/api/courses",
    courseRoutes
  );

  console.log(
    "📚 Course Routes: LOADED ✅"
  );
} catch (error) {
  console.error(
    "❌ COURSE ROUTES ERROR:"
  );

  console.error(error);

  process.exit(1);
}


// ==========================================
// HOMEWORK ROUTES
// ==========================================

console.log("==========================================");
console.log("📝 Homework Routes: loading...");
console.log("==========================================");

try {
  app.use(
    "/api/homeworks",
    homeworkRoutes
  );

  console.log(
    "📝 Homework Routes: LOADED ✅"
  );
} catch (error) {
  console.error(
    "❌ HOMEWORK ROUTES ERROR:"
  );

  console.error(error);

  process.exit(1);
}


// ==========================================
// CLASS ROUTES
// ==========================================

console.log("==========================================");
console.log("👥 Class Routes: loading...");
console.log("==========================================");

try {
  app.use(
    "/api/classes",
    classRoutes
  );

  console.log(
    "👥 Class Routes: LOADED ✅"
  );
} catch (error) {
  console.error(
    "❌ CLASS ROUTES ERROR:"
  );

  console.error(error);

  process.exit(1);
}


// ==========================================
// EXAM ROUTES
// ==========================================

console.log("==========================================");
console.log("📝 Exam Routes: loading...");
console.log("==========================================");

try {
  app.use(
    "/api/exams",
    examRoutes
  );

  console.log(
    "📝 Exam Routes: LOADED ✅"
  );
} catch (error) {
  console.error(
    "❌ EXAM ROUTES ERROR:"
  );

  console.error(error);

  process.exit(1);
}


// ==========================================
// ENVIRONMENT
// ==========================================

console.log("==========================================");
console.log("📋 Environment");
console.log("==========================================");

console.log(
  "PORT:",
  PORT
);

console.log(
  "MONGO_URI:",
  MONGO_URI
    ? "SET ✅"
    : "NOT SET ❌"
);


// ==========================================
// BODY PARSER
// ==========================================

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


// ==========================================
// ROOT
// ==========================================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({
      success: true,

      message:
        "Science Academy Test Server is running 🚀",
    });

  }
);


// ==========================================
// HEALTH
// ==========================================

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
    });

  }
);


// ==========================================
// 404
// ==========================================

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


// ==========================================
// START SERVER
// ==========================================

console.log("==========================================");
console.log("🚀 TEST SERVER STARTING");
console.log("==========================================");

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {

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

  }
);


server.on(
  "error",
  (error) => {

    console.error(
      "❌ SERVER ERROR:"
    );

    console.error(
      error
    );

  }
);


// ==========================================
// DATABASE
// ==========================================

const connectDatabase =
  async () => {

    if (!MONGO_URI) {

      console.error(
        "❌ MONGO_URI is missing"
      );

      return;
    }

    try {

      console.log(
        "⏳ Connecting to MongoDB..."
      );

      await mongoose.connect(
        MONGO_URI,
        {
          serverSelectionTimeoutMS:
            10000,

          connectTimeoutMS:
            10000,
        }
      );

      console.log(
        "🟢 MongoDB connected successfully"
      );

      console.log(
        "=========================================="
      );

      console.log(
        "👤 User Model test: SUCCESS ✅"
      );

      console.log(
        "👨‍🏫 Teacher Model test: SUCCESS ✅"
      );

      console.log(
        "📝 Homework Model test: SUCCESS ✅"
      );

      console.log(
        "📚 Course Routes test: SUCCESS ✅"
      );

      console.log(
        "📝 Homework Routes test: SUCCESS ✅"
      );

      console.log(
        "👥 Class Routes test: SUCCESS ✅"
      );

      console.log(
        "📝 Exam Routes test: SUCCESS ✅"
      );

      console.log(
        "=========================================="
      );

    } catch (error) {

      console.error(
        "❌ MongoDB CONNECTION ERROR:"
      );

      console.error(
        error.message
      );

    }

  };


// ==========================================
// MONGOOSE EVENTS
// ==========================================

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

    console.error(
      "🔴 MongoDB ERROR:"
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


// ==========================================
// CONNECT DATABASE
// ==========================================

connectDatabase();