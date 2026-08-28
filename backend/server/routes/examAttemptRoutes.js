import express from "express";

import {
startExam,
getAttempt,
submitExam,
saveAnswers,
pauseExam,
resumeExam,
getExamResult,
getMyResults,
reviewEssay,
getEssayReviews,
getExamStudentsResults,
getTeacherExamResults,
getTeacherStudentResult

} from "../controllers/examAttemptController.js";

import {verifyToken} from "../middleware/auth.js";


const router = express.Router();



// بداية الامتحان
router.post(
"/start/:examId",
verifyToken,
startExam
);

router.post(
  "/:id/pause",
  verifyToken,
  pauseExam
);

router.post(
  "/:id/resume",
  verifyToken,
  resumeExam
);

router.get(
"/results",
verifyToken,
getMyResults
);

// النتيجة
router.get(
"/result/:examId",
verifyToken,
getExamResult
);


// جلب الامتحان
router.get(
"/:id",
verifyToken,
getAttempt
);


// حفظ الإجابات
router.put(
"/:id/save",
verifyToken,
saveAnswers
);


// تسليم الامتحان
router.post(
"/:id/submit",
verifyToken,
submitExam
);


// مراجعة الأسئلة المقالية
router.put(
"/:id/review",
verifyToken,
reviewEssay
);

router.get(
"/essay/reviews",
verifyToken,
getEssayReviews
);


router.get(
"/teacher-results/:examId",
verifyToken,
getTeacherExamResults
);

// نتائج الطلاب للمدرس
router.get(
"/exam/:examId/results",
verifyToken,
getExamStudentsResults
);


router.get(
  "/student-result/:attemptId",
  verifyToken,
  getTeacherStudentResult
);

export default router;