import express from "express";

import {
  getTeacherDashboardStats,
  getTeacherStudents,
  getTeacherStudentDashboard
} from "../controllers/teacherController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/dashboard/stats",
  verifyToken,
  getTeacherDashboardStats
);

router.get(
  "/students",
  verifyToken,
  getTeacherStudents
);

router.get(
  "/students/:studentId/dashboard",
  verifyToken,
  getTeacherStudentDashboard
);

export default router;