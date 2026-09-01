import express from "express";

import {
  getTeacherDashboardStats,
  getTeacherStudents,
  getTeacherStudentDashboard,
} from "../controllers/teacherController.js";

import Teacher from "../models/Teacher.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ==================================================
   GET TEACHER
   GET /api/teacher
================================================== */

router.get(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      /* =========================
         TEACHER ONLY
      ========================= */

      if (req.user.role !== "teacher") {
        return res.status(403).json({
          success: false,
          message: "غير مسموح لك",
        });
      }

      /* =========================
         GET TEACHER PROFILE
      ========================= */

      const teacher = await Teacher.findOne({
        userId: req.user.id,
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "بيانات المدرس غير موجودة",
        });
      }

      return res.status(200).json({
        success: true,
        teacher,
      });
    } catch (error) {
      console.error(
        "GET TEACHER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب بيانات المدرس",
      });
    }
  }
);

/* ==================================================
   TEACHER DASHBOARD STATS
   GET /api/teacher/dashboard/stats
================================================== */

router.get(
  "/dashboard/stats",
  verifyToken,
  getTeacherDashboardStats
);

/* ==================================================
   TEACHER STUDENTS
   GET /api/teacher/students
================================================== */

router.get(
  "/students",
  verifyToken,
  getTeacherStudents
);

/* ==================================================
   STUDENT DASHBOARD
   GET /api/teacher/students/:studentId/dashboard
================================================== */

router.get(
  "/students/:studentId/dashboard",
  verifyToken,
  getTeacherStudentDashboard
);

export default router;