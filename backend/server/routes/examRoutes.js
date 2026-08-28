
import express from "express";

import {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  publishExam,
  getStudentExams,
  unpublishExam,
} from "../controllers/examController.js";


import {

  publishExamResults,
  unpublishExamResults,
} from "../controllers/examAttemptController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


// إضافة امتحان
router.post(
  "/",
  verifyToken,
  createExam
);


// جلب امتحانات المدرس
router.get(
  "/",
  verifyToken,
  getExams
);


// جلب امتحانات الطالب
router.get(
  "/student",
  verifyToken,
  getStudentExams
);


// تعديل امتحان
router.put(
  "/:id",
  verifyToken,
  updateExam
);


// نشر الامتحان
router.put(
  "/:id/publish",
  verifyToken,
  publishExam
);


// إلغاء نشر الامتحان
router.put(
  "/:id/unpublish",
  verifyToken,
  unpublishExam
);


// ================================
// نتائج الامتحان
// ================================

router.put(
  "/:id/publish-results",
  verifyToken,
  publishExamResults
);

router.put(
  "/:id/unpublish-results",
  verifyToken,
  unpublishExamResults
);


// حذف امتحان
router.delete(
  "/:id",
  verifyToken,
  deleteExam
);


export default router;