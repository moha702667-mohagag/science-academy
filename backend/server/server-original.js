import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Teacher from "./models/Teacher.js";

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

import cron from "node-cron";
import Homework from "./models/Homework.js";

import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/auth.js";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


/* ==================================================
   MIDDLEWARE
================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());


/* ==================================================
   ROUTES
================================================== */

app.use("/api/courses", courseRoutes);

app.use("/api/homeworks", homeworkRoutes);

app.use("/api/exams", examRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/exam-attempt", examAttemptRoutes);

app.use("/api/classes", classRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/user", userRoutes);

app.use("/api/teacher", teacherRoutes);


/* ==================================================
   EMAIL
================================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


/* ==================================================
   GENERATE VERIFICATION CODE
================================================== */

const generateVerificationCode = () => {

  return Math.floor(
    100000 + Math.random() * 900000
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

  await transporter.sendMail({

    from:
      process.env.EMAIL_USER,

    to:
      email,

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
   MONGODB CONNECTION
================================================== */

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error);
    process.exit(1);
  }
};

startServer();

/* ==================================================
   CRON
================================================== */

cron.schedule("* * * * *", async () => {

  try {

    const today = new Date();

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
        `Deleted ${result.deletedCount} expired homeworks`
      );

    }

  } catch (error) {

    console.log(error);

  }

});

// ==================================================
// DELETE UNVERIFIED ACCOUNTS AFTER 14 DAYS
// ==================================================

const deleteExpiredUnverifiedAccounts = async () => {
  try {
    const expirationDate = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    );

    const expiredUsers = await User.find({
      emailVerified: false,
      createdAt: {
        $lt: expirationDate,
      },
    }).select("_id role email");

    if (expiredUsers.length === 0) {
      return;
    }

    const teacherIds = expiredUsers
      .filter((user) => user.role === "teacher")
      .map((user) => user._id);

    if (teacherIds.length > 0) {
      await Teacher.deleteMany({
        userId: {
          $in: teacherIds,
        },
      });
    }

    const userIds = expiredUsers.map(
      (user) => user._id
    );

    const result = await User.deleteMany({
      _id: {
        $in: userIds,
      },
      emailVerified: false,
    });

    if (result.deletedCount > 0) {
      console.log(
        `Deleted ${result.deletedCount} unverified accounts older than 14 days`
      );
    }

  } catch (error) {
    console.log(
      "DELETE EXPIRED UNVERIFIED ACCOUNTS ERROR:",
      error
    );
  }
};

// ==================================================
// CHECK EXPIRED UNVERIFIED ACCOUNTS DAILY
// ==================================================

cron.schedule("0 3 * * *", async () => {
  await deleteExpiredUnverifiedAccounts();
});

/* ==================================================
   TEACHER PROFILE
================================================== */

app.get(
  "/api/teacher",
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


      res.json({

        success: true,

        teacher,

      });


    } catch (error) {

      console.log(error);

      res.status(500).json({

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
  "/api/teacher/profile",
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


      res.json({

        success: true,

        teacher,

      });


    } catch (error) {

      console.log(error);

      res.status(500).json({

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
  "/api/teacher",
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


      res.json({

        success: true,

        teacher,

      });


    } catch (error) {

      console.log(error);

      res.status(500).json({

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

const testimonials = [

  {
    id: 1,

    name:
      "محمد أحمد",

    grade:
      "الأول الإعدادي",

    comment:
      "الشرح واضح جدًا والمستر بيتابع معانا باستمرار.",

  },

  {
    id: 2,

    name:
      "سارة خالد",

    grade:
      "الخامس الابتدائي",

    comment:
      "المحتوى مرتب والواجبات ساعدتني أفهم الدروس.",

  },

  {
    id: 3,

    name:
      "يوسف علي",

    grade:
      "السادس الابتدائي",

    comment:
      "المراجعات ممتازة وطريقة الشرح سهلة جدًا.",

  },

];


/* ==================================================
   CONTACT
================================================== */

const contactMessages = [];


/* ==================================================
   TEST ROUTE
================================================== */

app.get(
  "/",
  (req, res) => {

    res.send(
      "Backend is running 🚀"
    );

  }
);


/* ==================================================
   AUTH
================================================== */


/* ==================================================
   REGISTER
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
         BASIC VALIDATION
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


      /* =========================
         ROLE
      ========================= */

      if (

        ![
          "student",
          "teacher",
        ].includes(role)

      ) {

        return res.status(400).json({

          success: false,

          message:
            "نوع الحساب غير صحيح",

        });

      }


      /* =========================
         STUDENT GRADE
      ========================= */

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


      /* =========================
         NORMALIZE EMAIL
      ========================= */

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();


      /* =========================
         CHECK EMAIL
      ========================= */

      const existingUser =
        await User.findOne({

          email:
            normalizedEmail,

        });


      if (existingUser) {

        return res.status(400).json({

          success: false,

          message:
            "هذا البريد مسجل بالفعل",

        });

      }


      /* ==================================================
         TEACHER REGISTRATION
      ================================================== */

      if (
        role === "teacher"
      ) {

        if (
          !registrationCode
        ) {

          return res.status(400).json({

            success: false,

            message:
              "من فضلك أدخل كود المدرس",

          });

        }


        const teacherCode =
          process.env
            .TEACHER_REGISTRATION_CODE;


        if (!teacherCode) {

          console.log(
            "TEACHER_REGISTRATION_CODE is missing from .env"
          );

          return res.status(500).json({

            success: false,

            message:
              "كود تسجيل المدرس غير مضبوط في السيرفر",

          });

        }


        const enteredCode =
          registrationCode.trim();


        if (

          enteredCode !==
          teacherCode.trim()

        ) {

          return res.status(400).json({

            success: false,

            message:
              "كود المدرس غير صحيح",

          });

        }


        /* =========================
           ONLY ONE TEACHER
        ========================= */

        const existingTeacher =
          await User.findOne({

            role:
              "teacher",

          });


        if (existingTeacher) {

          return res.status(400).json({

            success: false,

            message:
              "تم إنشاء حساب المدرس بالفعل",

          });

        }

      }


      /* ==================================================
         PASSWORD
      ================================================== */

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      /* ==================================================
         ACCOUNT STATUS
      ================================================== */

      const accountStatus =
        role === "teacher"
          ? "approved"
          : "pending";


      /* ==================================================
         EMAIL VERIFICATION
      ================================================== */

      const verificationCode =
        generateVerificationCode();


      const verificationExpires =
        new Date(
          Date.now() +
          10 * 60 * 1000
        );


      /* ==================================================
         CREATE USER
      ================================================== */

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

          emailVerified:
            false,

          emailVerificationCode:
            verificationCode,

          emailVerificationExpires:
            verificationExpires,

          approvedAt:
            null,

        });


      /* ==================================================
         SEND VERIFICATION EMAIL
      ================================================== */

      try {

        await sendVerificationEmail(

          normalizedEmail,

          fullName,

          verificationCode

        );

      } catch (emailError) {

        console.log(
          "VERIFICATION EMAIL ERROR:",
          emailError
        );


        /*
          لو الإيميل فشل:
          نحذف الحساب الذي تم إنشاؤه
          حتى لا يظل حساب غير قابل للتأكيد.
        */

        await User.findByIdAndDelete(
          newUser._id
        );


        return res.status(500).json({

          success: false,

          message:
            "تعذر إرسال كود التحقق. حاول مرة أخرى.",

        });

      }


      /* ==================================================
         CREATE TEACHER PROFILE
      ================================================== */

      if (
        role === "teacher"
      ) {

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

      }


      /* ==================================================
         RESPONSE
      ================================================== */

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

      console.log(
        "Register error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "حدث خطأ أثناء إنشاء الحساب",

      });

    }

  }
);



// ==================================================
// DELETE UNVERIFIED ACCOUNT
// ==================================================

app.delete(
  "/api/auth/delete-unverified-account",
  async (req, res) => {

    try {

      const { email } = req.body;

      // =========================
      // VALIDATION
      // =========================

      if (!email) {

        return res.status(400).json({
          success: false,
          message: "البريد الإلكتروني مطلوب",
        });

      }

      // =========================
      // NORMALIZE EMAIL
      // =========================

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      // =========================
      // FIND USER
      // =========================

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {

        return res.status(404).json({
          success: false,
          message: "الحساب غير موجود",
        });

      }

      // =========================
      // ONLY UNVERIFIED ACCOUNTS
      // =========================

      if (user.emailVerified) {

        return res.status(403).json({
          success: false,
          message:
            "لا يمكن حذف حساب مؤكد من خلال هذه العملية.",
        });

      }

      // =========================
      // DELETE TEACHER PROFILE
      // =========================

      if (user.role === "teacher") {

        await Teacher.deleteOne({
          userId: user._id,
        });

      }

      // =========================
      // DELETE USER
      // =========================

      await User.findByIdAndDelete(
        user._id
      );

      // =========================
      // RESPONSE
      // =========================

      return res.status(200).json({

        success: true,

        deleted: true,

        message:
          "تم حذف الحساب غير المؤكد بنجاح.",
      });

    } catch (error) {

      console.log(
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


      /* =========================
         VALIDATION
      ========================= */

      if (
        !email ||
        !code
      ) {

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
        code
          .toString()
          .trim();


      /* =========================
         FIND USER
      ========================= */

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


      /* =========================
         ALREADY VERIFIED
      ========================= */

      if (
        user.emailVerified
      ) {

        return res.status(400).json({

          success: false,

          message:
            "البريد الإلكتروني مؤكد بالفعل",

        });

      }


      /* =========================
         CHECK CODE
      ========================= */

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


      /* =========================
         CHECK EXPIRATION
      ========================= */

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


      /* ==================================================
         VERIFY
      ================================================== */

      user.emailVerified =
        true;


      user.emailVerificationCode =
        null;


      user.emailVerificationExpires =
        null;


      /*
        لو Teacher:
        الحساب Approved بالفعل
      */

      if (
        user.role === "teacher"
      ) {

        user.accountStatus =
          "approved";

        user.approvedAt =
          new Date();

      }


      /*
        لو Student:
        يظل Pending
        حتى يقبله المدرس
      */


      await user.save();


      /* ==================================================
         TEACHER TOKEN
      ================================================== */

      if (
        user.role === "teacher"
      ) {

        const token =
          jwt.sign(

            {

              id:
                user._id,

              email:
                user.email,

              role:
                user.role,

            },

            process.env.JWT_SECRET,

            {

              expiresIn:
                "7d",

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


      /* ==================================================
         STUDENT RESPONSE
      ================================================== */

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

      console.log(
        "VERIFY EMAIL ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "حدث خطأ أثناء تأكيد البريد الإلكتروني",

      });

    }

  }
);



/* ==================================================
   RESEND VERIFICATION CODE
================================================== */

app.post(
  "/api/auth/resend-verification",
  async (req, res) => {

    try {

      const {
        email,
      } = req.body;


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


      /* =========================
         ALREADY VERIFIED
      ========================= */

      if (
        user.emailVerified
      ) {

        return res.status(400).json({

          success: false,

          message:
            "البريد الإلكتروني مؤكد بالفعل",

        });

      }


      /* =========================
         NEW CODE
      ========================= */

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


      /* =========================
         SEND EMAIL
      ========================= */

      await sendVerificationEmail(

        user.email,

        user.fullName,

        verificationCode

      );


      res.status(200).json({

        success: true,

        message:
          "تم إرسال كود تحقق جديد إلى بريدك الإلكتروني.",

      });


    } catch (error) {

      console.log(
        "RESEND VERIFICATION ERROR:",
        error
      );


      res.status(500).json({

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


      /* =========================
         VALIDATION
      ========================= */

      if (
        !email ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            "من فضلك أدخل البريد الإلكتروني وكلمة المرور",

        });

      }


      /* =========================
         FIND USER
      ========================= */

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


      /* =========================
         PASSWORD
      ========================= */

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


      /* ==================================================
         EMAIL NOT VERIFIED
      ================================================== */

      if (
        !user.emailVerified
      ) {

        return res.status(403).json({

          success: false,

          emailNotVerified:
            true,

          message:
            "من فضلك قم بتأكيد بريدك الإلكتروني أولاً.",

        });

      }


      /* ==================================================
         STUDENT PENDING
      ================================================== */

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


      /* ==================================================
         STUDENT REJECTED
      ================================================== */

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


      /* ==================================================
         TOKEN
      ================================================== */

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

          process.env.JWT_SECRET,

          {

            expiresIn:
              "7d",

          }

        );


      /* ==================================================
         RESPONSE
      ================================================== */

      res.status(200).json({

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

      console.log(
        "Login error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "حدث خطأ أثناء تسجيل الدخول",

      });

    }

  }
);


/* ==================================================
   GET CURRENT USER
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


      /* =========================
         EMAIL VERIFICATION
      ========================= */

      if (
        !user.emailVerified
      ) {

        return res.status(403).json({

          success: false,

          emailNotVerified:
            true,

          message:
            "يجب تأكيد البريد الإلكتروني أولاً.",

        });

      }


      /* =========================
         STUDENT ACCOUNT STATUS
      ========================= */

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


      res.status(200).json({

        success: true,

        user,

      });


    } catch (error) {

      console.log(
        "Get current user error:",
        error
      );


      res.status(500).json({

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

          role:
            "student",

          accountStatus:
            "pending",

          emailVerified:
            true,

        })

          .select("-password")

          .sort({

            createdAt:
              -1,

          });


      res.json({

        success: true,

        students,

      });


    } catch (error) {

      console.log(
        "GET PENDING STUDENTS ERROR:",
        error
      );


      res.status(500).json({

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


      /* =========================
         EMAIL MUST BE VERIFIED
      ========================= */

      if (
        !student.emailVerified
      ) {

        return res.status(400).json({

          success: false,

          message:
            "لا يمكن قبول الطالب قبل تأكيد البريد الإلكتروني.",

        });

      }


      /* =========================
         APPROVE
      ========================= */

      student.accountStatus =
        "approved";


      student.approvedAt =
        new Date();


      student.approvedBy =
        req.user.id;


      await student.save();


      res.json({

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

      console.log(
        "APPROVE STUDENT ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "حدث خطأ أثناء قبول الطالب",

      });

    }

  }
);


/* ==================================================
   REJECT STUDENT
   DELETE STUDENT COMPLETELY
================================================== */

app.put(
  "/api/teacher/students/:id/reject",
  verifyToken,
  async (req, res) => {

    try {

      /* =========================
         TEACHER ONLY
      ========================= */

      if (
        req.user.role !== "teacher"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "غير مسموح لك",

        });

      }


      /* =========================
         FIND STUDENT
      ========================= */

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


      /* =========================
         DELETE STUDENT
      ========================= */

      await User.findByIdAndDelete(
        student._id
      );


      /* =========================
         RESPONSE
      ========================= */

      return res.status(200).json({

        success: true,

        deleted: true,

        message:
          "تم رفض طلب الطالب وحذف بياناته من قاعدة البيانات بنجاح",

      });


    } catch (error) {

      console.log(
        "REJECT STUDENT DELETE ERROR:",
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


      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to:
          process.env.EMAIL_USER,

        subject:
          "رسالة جديدة من موقع Science Academy",

        html: `

          <h2>
            رسالة جديدة
          </h2>

          <p>
            <strong>
              الاسم:
            </strong>

            ${name}
          </p>

          <p>
            <strong>
              رقم الهاتف:
            </strong>

            ${phone}
          </p>

          <p>
            <strong>
              الرسالة:
            </strong>
          </p>

          <p>
            ${message}
          </p>

        `,

      });


      res.status(200).json({

        success: true,

        message:
          "تم إرسال الرسالة بنجاح",

      });


    } catch (error) {

      console.log(
        "Email error:",
        error
      );


      res.status(500).json({

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
   SERVER
================================================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});