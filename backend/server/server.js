import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cron from "node-cron";

import User from "./models/User.js";
import Teacher from "./models/Teacher.js";
import Homework from "./models/Homework.js";

import courseRoutes from "./routes/courseRoutes.js";
import homeworkRoutes from "./routes/homeworkRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import examAttemptRoutes from "./routes/examAttemptRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { verifyToken } from "./middleware/auth.js";

dotenv.config();

/* ==================================================
   APP
================================================== */

const app = express();

/*
  مهم جدًا:
  منصات الاستضافة بتحدد PORT تلقائيًا.
*/

const PORT = process.env.PORT || 3000;

console.log("🔥 ABASHTAN PORT:", process.env.PORT);
console.log("🔥 USING PORT:", PORT);

/* ==================================================
   ENVIRONMENT
================================================== */

const NODE_ENV =
  process.env.NODE_ENV || "production";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "";

const MONGO_URI =
  process.env.MONGO_URI || "";

const JWT_SECRET =
  process.env.JWT_SECRET || "";

const EMAIL_USER =
  process.env.EMAIL_USER || "";

const EMAIL_PASS =
  process.env.EMAIL_PASS || "";

const TEACHER_REGISTRATION_CODE =
  process.env.TEACHER_REGISTRATION_CODE || "";

/* ==================================================
   LOG STARTUP INFO
================================================== */

console.log("==========================================");
console.log("🚀 SCIENCE ACADEMY BACKEND");
console.log("==========================================");
console.log("Environment:", NODE_ENV);
console.log("PORT:", PORT);
console.log(
  "FRONTEND_URL:",
  FRONTEND_URL || "NOT SET"
);
console.log(
  "MONGO_URI:",
  MONGO_URI ? "SET" : "NOT SET"
);
console.log(
  "JWT_SECRET:",
  JWT_SECRET ? "SET" : "NOT SET"
);
console.log(
  "EMAIL_USER:",
  EMAIL_USER ? "SET" : "NOT SET"
);
console.log(
  "EMAIL_PASS:",
  EMAIL_PASS ? "SET" : "NOT SET"
);
console.log(
  "TEACHER_REGISTRATION_CODE:",
  TEACHER_REGISTRATION_CODE
    ? "SET"
    : "NOT SET"
);
console.log("==========================================");

/* ==================================================
   REQUIRED ENV CHECK
================================================== */

if (!JWT_SECRET) {
  console.error(
    "⚠️ WARNING: JWT_SECRET is missing."
  );
}

if (!MONGO_URI) {
  console.error(
    "⚠️ WARNING: MONGO_URI is missing."
  );
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error(
    "⚠️ WARNING: EMAIL_USER or EMAIL_PASS is missing."
  );
}

/* ==================================================
   CORS
================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  FRONTEND_URL,
].filter(Boolean);

console.log(
  "Allowed Origins:",
  allowedOrigins
);

app.use(
  cors({
    origin: function (origin, callback) {
      /*
        Requests without Origin:
        Postman / server-to-server / health checks
      */

      if (!origin) {
        return callback(null, true);
      }

      /*
        Allow configured frontend URLs
      */

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      /*
        في production نرفض origin غير معروف
      */

      console.log(
        "❌ CORS blocked:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,
  })
);

/* ==================================================
   BODY PARSER
================================================== */

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

/* ==================================================
   HEALTH CHECK
================================================== */

app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      status: "ok",
      message:
        "Science Academy Backend is running 🚀",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",
    });
  }
);

/* ==================================================
   ROOT
================================================== */

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Science Academy Backend is running 🚀",
      health: "/health",
    });
  }
);

/* ==================================================
   EMAIL TRANSPORTER
================================================== */

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  console.log(
    "📧 Gmail transporter initialized"
  );
} else {
  console.log(
    "⚠️ Email transporter NOT initialized"
  );
}

/* ==================================================
   ROUTES
================================================== */

console.log(
  "📦 Loading API routes..."
);

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/homeworks",
  homeworkRoutes
);

app.use(
  "/api/exams",
  examRoutes
);

app.use(
  "/api/questions",
  questionRoutes
);

app.use(
  "/api/exam-attempt",
  examAttemptRoutes
);

app.use(
  "/api/classes",
  classRoutes
);

app.use(
  "/api/progress",
  progressRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/user",
  userRoutes
);

app.use(
  "/api/teacher",
  teacherRoutes
);

console.log(
  "✅ API routes loaded"
);

/* ==================================================
   VERIFICATION CODE
================================================== */

const generateVerificationCode = () => {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
};

/* ==================================================
   SEND VERIFICATION EMAIL
================================================== */

const sendVerificationEmail = async (
  email,
  fullName,
  verificationCode
) => {
  if (!transporter) {
    throw new Error(
      "Email transporter is not configured"
    );
  }

  await transporter.sendMail({
    from: EMAIL_USER,

    to: email,

    subject:
      "تأكيد البريد الإلكتروني - Science Academy",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        direction: rtl;
        text-align: center;
        padding: 30px;
        background: #f5f7fb;
      ">

        <div style="
          max-width: 500px;
          margin: auto;
          background: white;
          padding: 35px;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">

          <h2 style="
            color: #2563EB;
            margin-bottom: 20px;
          ">
            تأكيد البريد الإلكتروني
          </h2>

          <p style="
            font-size: 16px;
            color: #333;
          ">
            أهلاً ${fullName} 👋
          </p>

          <p style="
            color: #555;
            line-height: 1.8;
          ">
            شكرًا لتسجيلك في
            <strong>Science Academy</strong>
          </p>

          <p style="
            color: #555;
            line-height: 1.8;
          ">
            استخدم كود التحقق التالي لتأكيد بريدك الإلكتروني:
          </p>

          <div style="
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #2563EB;
            margin: 30px 0;
            padding: 15px;
            background: #eff6ff;
            border-radius: 12px;
          ">
            ${verificationCode}
          </div>

          <p style="
            color: #777;
            font-size: 14px;
          ">
            الكود صالح لمدة
            <strong>10 دقائق</strong>
            فقط.
          </p>

          <p style="
            color: #999;
            font-size: 13px;
            margin-top: 25px;
          ">
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة.
          </p>

        </div>

      </div>
    `,
  });
};

/* ==================================================
   TESTIMONIALS
================================================== */

const testimonials = [
  {
    id: 1,
    name: "محمد أحمد",
    grade: "الأول الإعدادي",
    comment:
      "الشرح واضح جدًا والمستر بيتابع معانا باستمرار.",
  },

  {
    id: 2,
    name: "سارة خالد",
    grade: "الخامس الابتدائي",
    comment:
      "المحتوى مرتب والواجبات ساعدتني أفهم الدروس.",
  },

  {
    id: 3,
    name: "يوسف علي",
    grade: "السادس الابتدائي",
    comment:
      "المراجعات ممتازة وطريقة الشرح سهلة جدًا.",
  },
];

/* ==================================================
   CONTACT
================================================== */

const contactMessages = [];

/* ==================================================
   AUTH - REGISTER
================================================== */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        phone,
        parentPhone,
        address,
        governorate,
        age,
        grade,
        school,
        role,
        registrationCode,
        subject,
        experience,
        qualification,
        bio,
      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (
        !fullName ||
        !email ||
        !password ||
        !phone ||
        !role
      ) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك املأ كل البيانات المطلوبة",
        });
      }

      if (
        !["student", "teacher"].includes(
          role
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "نوع الحساب غير صحيح",
        });
      }

      if (
        role === "student" &&
        !grade
      ) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك اختر الصف الدراسي",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        });
      }

      /* =========================
         NORMALIZE EMAIL
      ========================= */

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      /* =========================
         CHECK USER
      ========================= */

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "هذا البريد مسجل بالفعل",
        });
      }

      /* =========================
         TEACHER
      ========================= */

      if (role === "teacher") {
        if (!registrationCode) {
          return res.status(400).json({
            success: false,
            message:
              "من فضلك أدخل كود المدرس",
          });
        }

        if (!TEACHER_REGISTRATION_CODE) {
          return res.status(500).json({
            success: false,
            message:
              "كود تسجيل المدرس غير مضبوط في السيرفر",
          });
        }

        if (
          registrationCode.trim() !==
          TEACHER_REGISTRATION_CODE.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "كود المدرس غير صحيح",
          });
        }

        const existingTeacher =
          await User.findOne({
            role: "teacher",
          });

        if (existingTeacher) {
          return res.status(400).json({
            success: false,
            message:
              "تم إنشاء حساب المدرس بالفعل",
          });
        }
      }

      /* =========================
         PASSWORD
      ========================= */

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      /* =========================
         ACCOUNT STATUS
      ========================= */

      const accountStatus =
        role === "teacher"
          ? "approved"
          : "pending";

      /* =========================
         VERIFICATION
      ========================= */

      const verificationCode =
        generateVerificationCode();

      const verificationExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      /* =========================
         CREATE USER
      ========================= */

      const newUser =
        await User.create({
          fullName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          phone,

          address:
            address || "",

          governorate:
            governorate || "",

          age:
            age
              ? Number(age)
              : null,

          parentPhone:
            role === "student"
              ? parentPhone || ""
              : "",

          grade:
            role === "student"
              ? grade || ""
              : "",

          school:
            role === "student"
              ? school || ""
              : "",

          role,

          accountStatus,

          emailVerified: false,

          emailVerificationCode:
            verificationCode,

          emailVerificationExpires:
            verificationExpires,

          approvedAt: null,
        });

      /* =========================
         SEND EMAIL
      ========================= */

      try {
        await sendVerificationEmail(
          normalizedEmail,
          fullName,
          verificationCode
        );
      } catch (emailError) {
        console.error(
          "VERIFICATION EMAIL ERROR:",
          emailError
        );

        await User.findByIdAndDelete(
          newUser._id
        );

        return res.status(500).json({
          success: false,
          message:
            "تعذر إرسال كود التحقق. تأكد من إعدادات البريد الإلكتروني.",
        });
      }

      /* =========================
         TEACHER PROFILE
      ========================= */

      if (role === "teacher") {
        try {
          await Teacher.create({
            userId:
              newUser._id,

            name:
              newUser.fullName,

            email:
              newUser.email,

            phone:
              newUser.phone,

            age:
              age || null,

            governorate:
              governorate || "",

            subject:
              subject || "Science",

            experience:
              experience || "",

            qualification:
              qualification || "",

            bio:
              bio || "",
          });
        } catch (teacherError) {
          console.error(
            "TEACHER PROFILE ERROR:",
            teacherError
          );

          await User.findByIdAndDelete(
            newUser._id
          );

          return res.status(500).json({
            success: false,
            message:
              "حدث خطأ أثناء إنشاء حساب المدرس",
          });
        }
      }

      return res.status(201).json({
        success: true,

        verificationRequired:
          true,

        email:
          normalizedEmail,

        message:
          "تم إنشاء الحساب. تم إرسال كود التحقق إلى بريدك الإلكتروني.",
      });
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء إنشاء الحساب",
      });
    }
  }
);

/* ==================================================
   DELETE UNVERIFIED ACCOUNT
================================================== */

app.delete(
  "/api/auth/delete-unverified-account",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "البريد الإلكتروني مطلوب",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "الحساب غير موجود",
        });
      }

      if (user.emailVerified) {
        return res.status(403).json({
          success: false,
          message:
            "لا يمكن حذف حساب مؤكد من خلال هذه العملية.",
        });
      }

      if (user.role === "teacher") {
        await Teacher.deleteOne({
          userId: user._id,
        });
      }

      await User.findByIdAndDelete(
        user._id
      );

      return res.status(200).json({
        success: true,
        deleted: true,
        message:
          "تم حذف الحساب غير المؤكد بنجاح.",
      });
    } catch (error) {
      console.error(
        "DELETE UNVERIFIED ACCOUNT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء حذف الحساب.",
      });
    }
  }
);

/* ==================================================
   VERIFY EMAIL
================================================== */

app.post(
  "/api/auth/verify-email",
  async (req, res) => {
    try {
      const {
        email,
        code,
      } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك أدخل البريد وكود التحقق",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const verificationCode =
        code.toString().trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "هذا الحساب غير موجود",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message:
            "البريد الإلكتروني مؤكد بالفعل",
        });
      }

      if (
        user.emailVerificationCode !==
        verificationCode
      ) {
        return res.status(400).json({
          success: false,
          message:
            "كود التحقق غير صحيح",
        });
      }

      if (
        !user.emailVerificationExpires ||
        user.emailVerificationExpires <
          new Date()
      ) {
        return res.status(400).json({
          success: false,
          expired: true,
          message:
            "انتهت صلاحية كود التحقق. اطلب كودًا جديدًا.",
        });
      }

      user.emailVerified = true;

      user.emailVerificationCode =
        null;

      user.emailVerificationExpires =
        null;

      if (
        user.role === "teacher"
      ) {
        user.accountStatus =
          "approved";

        user.approvedAt =
          new Date();
      }

      await user.save();

      /* =========================
         TEACHER
      ========================= */

      if (
        user.role === "teacher"
      ) {
        if (!JWT_SECRET) {
          return res.status(500).json({
            success: false,
            message:
              "JWT_SECRET غير مضبوط في السيرفر",
          });
        }

        const token =
          jwt.sign(
            {
              id: user._id,
              email:
                user.email,
              role:
                user.role,
            },
            JWT_SECRET,
            {
              expiresIn: "7d",
            }
          );

        return res.status(200).json({
          success: true,
          verified: true,

          message:
            "تم تأكيد البريد الإلكتروني بنجاح.",

          token,

          user: {
            id:
              user._id,

            fullName:
              user.fullName,

            email:
              user.email,

            phone:
              user.phone,

            parentPhone:
              user.parentPhone,

            address:
              user.address,

            grade:
              user.grade,

            role:
              user.role,

            accountStatus:
              user.accountStatus,

            emailVerified:
              user.emailVerified,
          },
        });
      }

      /* =========================
         STUDENT
      ========================= */

      return res.status(200).json({
        success: true,

        verified: true,

        pending: true,

        message:
          "تم تأكيد بريدك الإلكتروني بنجاح. حسابك الآن في انتظار موافقة المدرس.",

        user: {
          id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          role:
            user.role,

          accountStatus:
            user.accountStatus,

          emailVerified:
            user.emailVerified,
        },
      });
    } catch (error) {
      console.error(
        "VERIFY EMAIL ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء تأكيد البريد الإلكتروني",
      });
    }
  }
);

/* ==================================================
   RESEND VERIFICATION
================================================== */

app.post(
  "/api/auth/resend-verification",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك أدخل البريد الإلكتروني",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "هذا الحساب غير موجود",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message:
            "البريد الإلكتروني مؤكد بالفعل",
        });
      }

      const verificationCode =
        generateVerificationCode();

      const verificationExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      user.emailVerificationCode =
        verificationCode;

      user.emailVerificationExpires =
        verificationExpires;

      await user.save();

      try {
        await sendVerificationEmail(
          user.email,
          user.fullName,
          verificationCode
        );
      } catch (emailError) {
        console.error(
          "RESEND EMAIL ERROR:",
          emailError
        );

        return res.status(500).json({
          success: false,
          message:
            "تعذر إرسال كود التحقق.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "تم إرسال كود تحقق جديد إلى بريدك الإلكتروني.",
      });
    } catch (error) {
      console.error(
        "RESEND VERIFICATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء إعادة إرسال الكود",
      });
    }
  }
);

/* ==================================================
   LOGIN
================================================== */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك أدخل البريد الإلكتروني وكلمة المرور",
        });
      }

      const user =
        await User.findOne({
          email:
            email
              .toLowerCase()
              .trim(),
        });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "هذا الحساب غير موجود",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            "كلمة المرور غير صحيحة",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          emailNotVerified: true,
          message:
            "من فضلك قم بتأكيد بريدك الإلكتروني أولاً.",
        });
      }

      if (
        user.role === "student" &&
        user.accountStatus ===
          "pending"
      ) {
        return res.status(403).json({
          success: false,
          pending: true,
          message:
            "تم تأكيد بريدك الإلكتروني، ولكن حسابك في انتظار موافقة المدرس.",
        });
      }

      if (
        user.role === "student" &&
        user.accountStatus ===
          "rejected"
      ) {
        return res.status(403).json({
          success: false,
          rejected: true,
          message:
            "تم رفض طلب إنشاء الحساب. يرجى التواصل مع المدرس.",
        });
      }

      if (!JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message:
            "JWT_SECRET غير مضبوط في السيرفر",
        });
      }

      const token =
        jwt.sign(
          {
            id:
              user._id,

            role:
              user.role,

            email:
              user.email,

            grade:
              user.grade,
          },

          JWT_SECRET,

          {
            expiresIn: "7d",
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "تم تسجيل الدخول بنجاح",

        token,

        user: {
          id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          phone:
            user.phone,

          parentPhone:
            user.parentPhone,

          address:
            user.address,

          grade:
            user.grade,

          role:
            user.role,

          accountStatus:
            user.accountStatus,

          emailVerified:
            user.emailVerified,
        },
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء تسجيل الدخول",
      });
    }
  }
);

/* ==================================================
   CURRENT USER
================================================== */

app.get(
  "/api/auth/me",
  verifyToken,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "المستخدم غير موجود",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          emailNotVerified: true,
          message:
            "يجب تأكيد البريد الإلكتروني أولاً.",
        });
      }

      if (
        user.role === "student" &&
        user.accountStatus !==
          "approved"
      ) {
        return res.status(403).json({
          success: false,

          pending:
            user.accountStatus ===
            "pending",

          rejected:
            user.accountStatus ===
            "rejected",

          message:
            user.accountStatus ===
            "pending"
              ? "حسابك في انتظار موافقة المدرس"
              : "تم رفض حسابك",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "GET CURRENT USER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء جلب بيانات المستخدم",
      });
    }
  }
);

/* ==================================================
   GET PENDING STUDENTS
================================================== */

app.get(
  "/api/teacher/pending-students",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "غير مسموح لك",
        });
      }

      const students =
        await User.find({
          role: "student",

          accountStatus:
            "pending",

          emailVerified: true,
        })
          .select("-password")
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        students,
      });
    } catch (error) {
      console.error(
        "GET PENDING STUDENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء جلب الطلاب",
      });
    }
  }
);

/* ==================================================
   APPROVE STUDENT
================================================== */

app.put(
  "/api/teacher/students/:id/approve",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "غير مسموح لك",
        });
      }

      const student =
        await User.findOne({
          _id:
            req.params.id,

          role:
            "student",
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "الطالب غير موجود",
        });
      }

      if (!student.emailVerified) {
        return res.status(400).json({
          success: false,
          message:
            "لا يمكن قبول الطالب قبل تأكيد البريد الإلكتروني.",
        });
      }

      student.accountStatus =
        "approved";

      student.approvedAt =
        new Date();

      student.approvedBy =
        req.user.id;

      await student.save();

      return res.json({
        success: true,

        message:
          "تم قبول الطالب بنجاح",

        student: {
          id:
            student._id,

          fullName:
            student.fullName,

          email:
            student.email,

          grade:
            student.grade,

          accountStatus:
            student.accountStatus,
        },
      });
    } catch (error) {
      console.error(
        "APPROVE STUDENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء قبول الطالب",
      });
    }
  }
);

/* ==================================================
   REJECT STUDENT
================================================== */

app.put(
  "/api/teacher/students/:id/reject",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "غير مسموح لك",
        });
      }

      const student =
        await User.findOne({
          _id:
            req.params.id,

          role:
            "student",
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "الطالب غير موجود",
        });
      }

      await User.findByIdAndDelete(
        student._id
      );

      return res.status(200).json({
        success: true,

        deleted: true,

        message:
          "تم رفض طلب الطالب وحذف بياناته من قاعدة البيانات بنجاح",
      });
    } catch (error) {
      console.error(
        "REJECT STUDENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء رفض وحذف الطالب",
      });
    }
  }
);

/* ==================================================
   TEACHER PROFILE
================================================== */

app.get(
  "/api/teacher-profile",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      const teacher =
        await Teacher.findOne({
          userId:
            req.user.id,
        });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message:
            "بيانات المدرس غير موجودة",
        });
      }

      return res.json({
        success: true,
        teacher,
      });
    } catch (error) {
      console.error(
        "GET TEACHER PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   UPDATE TEACHER PROFILE
================================================== */

app.put(
  "/api/teacher-profile",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      const teacher =
        await Teacher.findOneAndUpdate(
          {
            userId:
              req.user.id,
          },

          req.body,

          {
            new: true,
          }
        );

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message:
            "بيانات المدرس غير موجودة",
        });
      }

      return res.json({
        success: true,
        teacher,
      });
    } catch (error) {
      console.error(
        "UPDATE TEACHER PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   UPDATE TEACHER
================================================== */

app.put(
  "/api/teacher-account",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.user.role !== "teacher"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      let teacher =
        await Teacher.findOne({
          userId:
            req.user.id,
        });

      if (!teacher) {
        teacher =
          new Teacher({
            ...req.body,
            userId:
              req.user.id,
          });
      } else {
        Object.assign(
          teacher,
          req.body
        );
      }

      await teacher.save();

      return res.json({
        success: true,
        teacher,
      });
    } catch (error) {
      console.error(
        "UPDATE TEACHER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   TESTIMONIALS
================================================== */

app.get(
  "/api/testimonials",
  (req, res) => {
    res.json(
      testimonials
    );
  }
);

/* ==================================================
   CONTACT
================================================== */

app.post(
  "/api/contact",
  async (req, res) => {
    try {
      const {
        name,
        phone,
        message,
      } = req.body;

      if (
        !name ||
        !phone ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "من فضلك املأ كل البيانات المطلوبة",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "خدمة البريد الإلكتروني غير مضبوطة في السيرفر",
        });
      }

      await transporter.sendMail({
        from: EMAIL_USER,

        to: EMAIL_USER,

        subject:
          "رسالة جديدة من موقع Science Academy",

        html: `
          <h2>رسالة جديدة</h2>

          <p>
            <strong>الاسم:</strong>
            ${name}
          </p>

          <p>
            <strong>رقم الهاتف:</strong>
            ${phone}
          </p>

          <p>
            <strong>الرسالة:</strong>
          </p>

          <p>
            ${message}
          </p>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "تم إرسال الرسالة بنجاح",
      });
    } catch (error) {
      console.error(
        "CONTACT EMAIL ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "حدث خطأ أثناء إرسال الرسالة",
      });
    }
  }
);

/* ==================================================
   GET CONTACT MESSAGES
================================================== */

app.get(
  "/api/contact",
  (req, res) => {
    res.json(
      contactMessages
    );
  }
);

/* ==================================================
   404
================================================== */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Route not found",
      path: req.originalUrl,
    });
  }
);

/* ==================================================
   GLOBAL ERROR HANDLER
================================================== */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    if (
      res.headersSent
    ) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
);

/* ==================================================
   DATABASE CONNECTION
================================================== */

let databaseConnected = false;

const connectDatabase =
  async () => {
    if (!MONGO_URI) {
      console.error(
        "❌ MONGO_URI is missing. Database connection skipped."
      );

      return false;
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

      databaseConnected =
        true;

      console.log(
        "✅ MongoDB connected successfully"
      );

      return true;
    } catch (error) {
      databaseConnected =
        false;

      console.error(
        "❌ MongoDB connection failed:"
      );

      console.error(
        error.message
      );

      console.error(
        "⚠️ Server will continue running."
      );

      return false;
    }
  };

/* ==================================================
   DATABASE EVENTS
================================================== */

mongoose.connection.on(
  "connected",
  () => {
    databaseConnected = true;

    console.log(
      "🟢 MongoDB connection established"
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    databaseConnected = false;

    console.log(
      "🟡 MongoDB disconnected"
    );
  }
);

mongoose.connection.on(
  "error",
  (error) => {
    databaseConnected = false;

    console.error(
      "🔴 MongoDB error:",
      error.message
    );
  }
);

/* ==================================================
   CRON - DELETE EXPIRED HOMEWORK
================================================== */

cron.schedule(
  "* * * * *",
  async () => {
    if (!databaseConnected) {
      return;
    }

    try {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const result =
        await Homework.deleteMany({
          dueDate: {
            $ne: null,
            $lt: today,
          },
        });

      if (
        result.deletedCount > 0
      ) {
        console.log(
          `🗑️ Deleted ${result.deletedCount} expired homeworks`
        );
      }
    } catch (error) {
      console.error(
        "DELETE EXPIRED HOMEWORK ERROR:",
        error.message
      );
    }
  }
);

/* ==================================================
   DELETE UNVERIFIED ACCOUNTS
================================================== */

const deleteExpiredUnverifiedAccounts =
  async () => {
    if (!databaseConnected) {
      return;
    }

    try {
      const expirationDate =
        new Date(
          Date.now() -
            14 *
              24 *
              60 *
              60 *
              1000
        );

      const expiredUsers =
        await User.find({
          emailVerified:
            false,

          createdAt: {
            $lt:
              expirationDate,
          },
        }).select(
          "_id role email"
        );

      if (
        expiredUsers.length ===
        0
      ) {
        return;
      }

      const teacherIds =
        expiredUsers
          .filter(
            (user) =>
              user.role ===
              "teacher"
          )
          .map(
            (user) =>
              user._id
          );

      if (
        teacherIds.length >
        0
      ) {
        await Teacher.deleteMany({
          userId: {
            $in:
              teacherIds,
          },
        });
      }

      const userIds =
        expiredUsers.map(
          (user) =>
            user._id
        );

      const result =
        await User.deleteMany({
          _id: {
            $in:
              userIds,
          },

          emailVerified:
            false,
        });

      if (
        result.deletedCount >
        0
      ) {
        console.log(
          `🗑️ Deleted ${result.deletedCount} unverified accounts older than 14 days`
        );
      }
    } catch (error) {
      console.error(
        "DELETE EXPIRED UNVERIFIED ACCOUNTS ERROR:",
        error.message
      );
    }
  };

/* ==================================================
   DAILY CRON
================================================== */

cron.schedule(
  "0 3 * * *",
  async () => {
    await deleteExpiredUnverifiedAccounts();
  }
);

/* ==================================================
   START SERVER
================================================== */

const startServer =
  async () => {
    try {
      /*
        IMPORTANT:
        Open the HTTP port FIRST.
      */

      const server =
        app.listen(
          PORT,
          "0.0.0.0",
          () => {
            console.log(
              "=========================================="
            );

            console.log(
              `🚀 Science Academy server running`
            );

            console.log(
              `📡 PORT: ${PORT}`
            );

            console.log(
              `🏠 Root: /`
            );

            console.log(
              `❤️ Health: /health`
            );

            console.log(
              "=========================================="
            );
          }
        );

      /*
        Listen error
      */

      server.on(
        "error",
        (error) => {
          console.error(
            "❌ SERVER LISTEN ERROR:",
            error
          );
        }
      );

      /*
        Connect MongoDB AFTER server starts
      */

      await connectDatabase();

      console.log(
        "✅ Startup sequence completed"
      );
    } catch (error) {
      console.error(
        "❌ START SERVER ERROR:",
        error
      );

      /*
        Do NOT intentionally crash
        the application here.
      */
    }
  };

/* ==================================================
   PROCESS ERROR HANDLERS
================================================== */

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ UNCAUGHT EXCEPTION:",
      error
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "❌ UNHANDLED REJECTION:",
      reason
    );
  }
);

/* ==================================================
   START
================================================== */

startServer();