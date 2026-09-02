import ExamAttempt from "../models/ExamAttempt.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";


// ======================================================
// Helper
// تجهيز الإجابات القادمة من Frontend
// ======================================================

const normalizeAnswers = (answers) => {

  if (!Array.isArray(answers)) {
    return [];
  }

  return answers.map((answer) => {

    // ------------------------------------------
    // Essay
    // ------------------------------------------

    if (
      answer &&
      answer.essayAnswer !== undefined
    ) {

      return {

        questionId: answer.questionId,

        essayAnswer:
          answer.essayAnswer || "",

      };

    }


    // ------------------------------------------
    // MCQ / TrueFalse / Checkbox
    // ------------------------------------------

    return {

      questionId: answer.questionId,

      selectedAnswers:
        Array.isArray(answer.selectedAnswers)
          ? answer.selectedAnswers
          : [],

    };

  });

};


// ======================================================
// Helper
// تحويل الوقت إلى رقم آمن
// ======================================================

const normalizeRemainingTime = (value) => {

  const time = Number(value);

  if (!Number.isFinite(time)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(time)
  );

};


// ======================================================
// Start / Resume Exam
// ======================================================

export const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "الامتحان غير موجود",
      });
    }

    if (exam.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "الامتحان غير منشور",
      });
    }

    // ================================
    // CHECK EXAM DURATION
    // ================================

    const durationMinutes = Number(exam.duration);

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0
    ) {
      console.error("INVALID EXAM DURATION:", {
        examId,
        examTitle: exam.title,
        duration: exam.duration,
      });

      return res.status(400).json({
        success: false,
        message:
          "مدة الامتحان غير صحيحة. من فضلك تأكد أن مدة الامتحان أكبر من صفر دقيقة.",
      });
    }

    const durationSeconds = Math.floor(durationMinutes * 60);

    console.log("========== START EXAM ==========");
    console.log({
      examId,
      studentId,
      examTitle: exam.title,
      durationMinutes,
      durationSeconds,
    });

    // ================================
    // CHECK EXISTING ATTEMPT
    // ================================

    let attempt = await ExamAttempt.findOne({
      studentId,
      examId,
      status: { $in: ["in_progress", "paused"] },
    }).sort({ createdAt: -1 });

    if (attempt) {
      console.log("EXISTING ATTEMPT FOUND:", {
        attemptId: attempt._id,
        status: attempt.status,
        remainingTime: attempt.remainingTime,
        expiresAt: attempt.expiresAt,
        startedAt: attempt.startedAt,
      });

      // =================================
      // PAUSED ATTEMPT
      // =================================

      if (attempt.status === "paused") {
        const remainingTime = Math.max(
          0,
          Math.floor(Number(attempt.remainingTime) || 0)
        );

        if (remainingTime <= 0) {
          attempt.status = "submitted";
          attempt.finishedAt = new Date();
          attempt.isAutoSubmitted = true;
          attempt.remainingTime = 0;
          attempt.expiresAt = null;

          await attempt.save();

          return res.json({
            success: true,
            expired: true,
            attempt,
          });
        }

        console.log("RESUMING PAUSED ATTEMPT:", {
          attemptId: attempt._id,
          remainingTime,
        });

        return res.json({
          success: true,
          attempt,
        });
      }

      // =================================
      // IN-PROGRESS ATTEMPT
      // =================================

      const now = new Date();

      if (attempt.expiresAt) {
        const expiresAt = new Date(attempt.expiresAt);

        const remainingFromExpiry = Math.max(
          0,
          Math.ceil(
            (expiresAt.getTime() - now.getTime()) / 1000
          )
        );

        console.log("TIME CHECK:", {
          now,
          expiresAt,
          remainingFromExpiry,
          savedRemainingTime: attempt.remainingTime,
        });

        // الوقت انتهى فعلًا
        if (remainingFromExpiry <= 0) {
          attempt.status = "submitted";
          attempt.finishedAt = now;
          attempt.isAutoSubmitted = true;
          attempt.remainingTime = 0;
          attempt.expiresAt = null;

          await attempt.save();

          console.log("ATTEMPT EXPIRED:", attempt._id);

          return res.json({
            success: true,
            expired: true,
            attempt,
          });
        }

        // Sync remainingTime with expiresAt
        attempt.remainingTime = remainingFromExpiry;

        await attempt.save();

        console.log("RETURNING EXISTING ATTEMPT:", {
          attemptId: attempt._id,
          remainingTime: attempt.remainingTime,
          expiresAt: attempt.expiresAt,
        });

        return res.json({
          success: true,
          attempt,
        });
      }

      // =================================
      // OLD ATTEMPT WITHOUT expiresAt
      // =================================

      const savedRemainingTime = Math.max(
        0,
        Math.floor(Number(attempt.remainingTime) || 0)
      );

      if (savedRemainingTime <= 0) {
        attempt.status = "submitted";
        attempt.finishedAt = now;
        attempt.isAutoSubmitted = true;
        attempt.remainingTime = 0;
        attempt.expiresAt = null;

        await attempt.save();

        return res.json({
          success: true,
          expired: true,
          attempt,
        });
      }

      // إصلاح Attempt قديم مفيهوش expiresAt
      attempt.expiresAt = new Date(
        now.getTime() + savedRemainingTime * 1000
      );

      attempt.remainingTime = savedRemainingTime;

      await attempt.save();

      console.log("REPAIRED OLD ATTEMPT:", {
        attemptId: attempt._id,
        remainingTime: savedRemainingTime,
        expiresAt: attempt.expiresAt,
      });

      return res.json({
        success: true,
        attempt,
      });
    }

    // ================================
    // CHECK MAX ATTEMPTS
    // ================================

    const attemptsCount = await ExamAttempt.countDocuments({
      studentId,
      examId,
      status: { $in: ["submitted", "reviewed"] },
    });

    const maxAttempts = Number(exam.maxAttempts || 1);

    if (attemptsCount >= maxAttempts) {
      return res.status(400).json({
        success: false,
        message: "لقد استنفدت عدد المحاولات المسموح بها",
      });
    }

    // ================================
    // GET QUESTIONS
    // ================================

    let questions = await Question.find({
      examId,
    }).lean();

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد أسئلة في هذا الامتحان",
      });
    }

    // ================================
    // SHUFFLE QUESTIONS
    // ================================

    if (exam.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // ================================
    // SHUFFLE OPTIONS
    // ================================

    if (exam.shuffleOptions) {
      questions = questions.map((question) => {
        if (
          Array.isArray(question.options) &&
          question.options.length > 1
        ) {
          question.options = [...question.options].sort(
            () => Math.random() - 0.5
          );
        }

        return question;
      });
    }

    // ================================
    // CREATE NEW ATTEMPT
    // ================================

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() + durationSeconds * 1000
    );

    console.log("CREATING NEW ATTEMPT:", {
      startedAt,
      expiresAt,
      durationMinutes,
      durationSeconds,
    });

    attempt = await ExamAttempt.create({
      studentId,
      examId,

      status: "in_progress",

      startedAt,

      expiresAt,

      remainingTime: durationSeconds,

      answers: [],

      score: 0,

      totalScore: 0,

      percentage: 0,

      timeTaken: 0,

      isAutoSubmitted: false,
    });

    console.log("NEW ATTEMPT CREATED:", {
      attemptId: attempt._id,
      remainingTime: attempt.remainingTime,
      expiresAt: attempt.expiresAt,
    });

    return res.status(201).json({
      success: true,
      attempt,
      questions,
    });
  } catch (error) {
    console.error("START EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء بدء الامتحان",
    });
  }
};

// ======================================================
// Get Attempt
// Student: own attempt
// Teacher: attempt from his own exam
// ======================================================

export const getAttempt = async (
  req,
  res
) => {

  try {

    // ==================================================
    // جلب المحاولة
    // ==================================================

    const attempt =
      await ExamAttempt.findById(
        req.params.id
      )
      .populate(
        "studentId",
        "fullName grade email phone"
      )
      .populate(
        "examId",
        "title duration totalMarks passingMarks teacherId"
      );


    // ==================================================
    // المحاولة غير موجودة
    // ==================================================

    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    // ==================================================
    // IDs
    // ==================================================

    const currentUserId =
      String(req.user.id);

    const attemptStudentId =
      String(
        attempt.studentId?._id ||
        attempt.studentId
      );

    const examTeacherId =
      String(
        attempt.examId?.teacherId ||
        ""
      );


    // ==================================================
    // هل المستخدم هو الطالب صاحب المحاولة؟
    // ==================================================

    const isStudentOwner =
      attemptStudentId ===
      currentUserId;


    // ==================================================
    // هل المستخدم هو مدرس الامتحان؟
    // ==================================================

    const isExamTeacher =
      examTeacherId ===
      currentUserId;


    // ==================================================
    // السماح:
    // الطالب صاحب المحاولة
    // أو مدرس الامتحان
    // ==================================================

    if (
      !isStudentOwner &&
      !isExamTeacher
    ) {

      return res.status(403).json({

        success: false,

        message:
          "غير مسموح لك بالوصول إلى هذه المحاولة",

      });

    }


    console.log(
      "GET ATTEMPT ACCESS:",
      {
        attemptId:
          attempt._id,

        currentUserId,

        attemptStudentId,

        examTeacherId,

        isStudentOwner,

        isExamTeacher,

      }
    );


    // ==================================================
    // جلب الأسئلة
    // ==================================================

    const questions =
      await Question.find({

        examId:
          attempt.examId._id,

        isActive: true,

      }).sort({

        order: 1,

      });


    // ==================================================
    // لا توجد أسئلة
    // ==================================================

    if (
      !questions ||
      questions.length === 0
    ) {

      return res.status(200).json({

        success: true,

        attempt,

        questions: [],

      });

    }


    // ==================================================
    // لو مفيش ترتيب محفوظ
    // ==================================================

    if (
      !attempt.questionOrder ||
      attempt.questionOrder.length === 0
    ) {

      return res.json({

        success: true,

        attempt,

        questions:
          questions.map(
            q => q.toObject()
          ),

      });

    }


    // ==================================================
    // إعادة ترتيب الأسئلة
    // ==================================================

    const orderedQuestions = [];


    attempt.questionOrder.forEach(
      (item) => {

        const question =
          questions.find(
            q =>
              String(q._id) ===
              String(item.questionId)
          );


        if (!question) {
          return;
        }


        const q =
          question.toObject();


        // ==========================================
        // ترتيب الاختيارات
        // ==========================================

        if (
          item.optionsOrder &&
          item.optionsOrder.length > 0
        ) {

          const originalOptions =
            q.options || [];


          const originalCorrectAnswers =
            q.correctAnswers || [];


          // ----------------------------------------
          // إعادة ترتيب الاختيارات
          // ----------------------------------------

          q.options =
            item.optionsOrder
              .map(
                index =>
                  originalOptions[index]
              )
              .filter(Boolean);


          // ----------------------------------------
          // تحديث correctAnswers
          // ----------------------------------------

          q.correctAnswers =
            originalCorrectAnswers
              .map(
                correctIndex =>
                  item.optionsOrder.indexOf(
                    correctIndex
                  )
              )
              .filter(
                index =>
                  index !== -1
              );

        }


        orderedQuestions.push(q);

      }
    );


    // ==================================================
    // حماية من فقدان الأسئلة
    // ==================================================

    const finalQuestions =
      orderedQuestions.length > 0
        ? orderedQuestions
        : questions.map(
            q => q.toObject()
          );


    // ==================================================
    // Response
    // ==================================================

    return res.json({

      success: true,

      attempt,

      questions:
        finalQuestions,

    });


  } catch (error) {

    console.log(
      "GET ATTEMPT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};

// ======================================================
// Pause Exam
// ======================================================

export const pauseExam = async (
  req,
  res
) => {

  try {

    const {
      answers = [],
      remainingTime,
    } = req.body;


    // ==================================================
    // جلب المحاولة
    // ==================================================

    const attempt =
      await ExamAttempt.findById(
        req.params.id
      );


    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    // ==================================================
    // حماية الطالب
    // ==================================================

    if (
      String(attempt.studentId) !==
      String(req.user.id)
    ) {

      return res.status(403).json({

        success: false,

        message:
          "غير مسموح",

      });

    }


    // ==================================================
    // لو الامتحان اتسلم
    // ==================================================

    if (
      attempt.status === "submitted" ||
      attempt.status === "reviewed"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "الامتحان تم تسليمه بالفعل",

      });

    }


    // ==================================================
    // الوقت المتبقي
    // ==================================================

    const safeRemainingTime =
      normalizeRemainingTime(
        remainingTime
      );


    // ==================================================
    // حفظ الإجابات
    // ==================================================

    if (
      Array.isArray(answers)
    ) {

      attempt.answers =
        normalizeAnswers(
          answers
        );

    }


    // ==================================================
    // حفظ الوقت
    // ==================================================

    attempt.remainingTime =
      safeRemainingTime;


    // ==================================================
    // Pause
    // ==================================================

    attempt.status =
      "paused";


    attempt.pausedAt =
      new Date();


    // مهم جدًا:
    // مفيش Countdown شغال أثناء Pause

    attempt.expiresAt =
      null;


    // ==================================================
    // حفظ
    // ==================================================

    attempt.markModified(
      "answers"
    );

    await attempt.save();


    // ==================================================
    // Response
    // ==================================================

    return res.json({

      success: true,

      paused: true,

      message:
        "تم إيقاف الامتحان مؤقتًا وحفظ إجاباتك",

      remainingTime:
        attempt.remainingTime,

      attempt,

    });


  } catch (error) {

    console.log(
      "PAUSE EXAM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Resume Exam
// ======================================================

export const resumeExam = async (
  req,
  res
) => {

  try {

    const attempt =
      await ExamAttempt.findById(
        req.params.id
      );


    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    // ==================================================
    // حماية الطالب
    // ==================================================

    if (
      String(attempt.studentId) !==
      String(req.user.id)
    ) {

      return res.status(403).json({

        success: false,

        message:
          "غير مسموح",

      });

    }


    // ==================================================
    // لو الامتحان اتسلم
    // ==================================================

    if (
      attempt.status === "submitted" ||
      attempt.status === "reviewed"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "الامتحان تم تسليمه بالفعل",

      });

    }


    // ==================================================
    // لو مش Paused
    // ==================================================

    if (
      attempt.status !== "paused"
    ) {

      return res.json({

        success: true,

        resumed: false,

        alreadyRunning: true,

        attempt,

      });

    }


    // ==================================================
    // التأكد من الوقت
    // ==================================================

    const remainingTime =
      normalizeRemainingTime(
        attempt.remainingTime
      );


    if (
      remainingTime <= 0
    ) {

      attempt.remainingTime = 0;

      attempt.status =
        "submitted";

      attempt.finishedAt =
        new Date();

      attempt.isAutoSubmitted =
        true;

      attempt.expiresAt =
        null;

      await attempt.save();


      return res.json({

        success: true,

        resumed: false,

        expired: true,

        attempt,

      });

    }


    // ==================================================
    // Resume
    // ==================================================

    const now =
      new Date();


    attempt.status =
      "in_progress";


    attempt.pausedAt =
      null;


    // إعادة بناء وقت انتهاء جديد
    // من الوقت المتبقي فقط

    attempt.expiresAt =
      new Date(
        now.getTime() +
        remainingTime * 1000
      );


    // ==================================================
    // حفظ
    // ==================================================

    await attempt.save();


    // ==================================================
    // Response
    // ==================================================

    return res.json({

      success: true,

      resumed: true,

      expired: false,

      remainingTime:
        attempt.remainingTime,

      attempt,

    });


  } catch (error) {

    console.log(
      "RESUME EXAM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Submit Exam
// ======================================================

export const submitExam = async (
  req,
  res
) => {

  try {

    const {
      answers = [],
      isAutoSubmitted = false,
    } = req.body;


    // ==================================================
    // جلب المحاولة
    // ==================================================

    const attempt =
      await ExamAttempt.findById(
        req.params.id
      );


    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    // ==================================================
    // حماية الطالب
    // ==================================================

    if (
      String(attempt.studentId) !==
      String(req.user.id)
    ) {

      return res.status(403).json({

        success: false,

        message:
          "غير مسموح",

      });

    }


    // ==================================================
    // حماية من إعادة التسليم
    // ==================================================

    if (
      attempt.status === "submitted" ||
      attempt.status === "reviewed"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "الامتحان تم تسليمه بالفعل",

      });

    }


    // ==================================================
    // جلب الامتحان
    // ==================================================

    const exam =
      await Exam.findById(
        attempt.examId
      );


    if (!exam) {

      return res.status(404).json({

        success: false,

        message:
          "Exam not found",

      });

    }


    // ==================================================
    // جلب الأسئلة
    // ==================================================

    const questions =
      await Question.find({

        examId:
          attempt.examId,

        isActive: true,

      });


    // ==================================================
    // هل يوجد Essay؟
    // ==================================================

    const hasEssay =
      questions.some(
        q => q.type === "essay"
      );


    // ==================================================
    // تجهيز الإجابات
    // ==================================================

    const submittedAnswers =
      Array.isArray(answers)
        ? answers
        : [];


    let score = 0;


    // ==================================================
    // تصحيح الإجابات
    // ==================================================

    const checkedAnswers =
      submittedAnswers.map(
        (answer) => {

          const question =
            questions.find(
              q =>
                String(q._id) ===
                String(answer.questionId)
            );


          // ------------------------------------------
          // سؤال غير موجود
          // ------------------------------------------

          if (!question) {

            return answer;

          }


          let isCorrect = false;

          let marksAwarded = 0;


          // ==========================================
          // MCQ + True False
          // ==========================================

          if (
            question.type === "mcq" ||
            question.type === "trueFalse"
          ) {

            const studentAnswers = [
              ...(answer.selectedAnswers || []),
            ].sort(
              (a, b) => a - b
            );


            const correctAnswers = [
              ...(question.correctAnswers || []),
            ].sort(
              (a, b) => a - b
            );


            isCorrect =
              JSON.stringify(
                studentAnswers
              ) ===
              JSON.stringify(
                correctAnswers
              );

          }


          // ==========================================
          // Checkbox
          // ==========================================

          else if (
            question.type === "checkbox"
          ) {

            const studentAnswers = [
              ...(answer.selectedAnswers || []),
            ].sort(
              (a, b) => a - b
            );


            const correctAnswers = [
              ...(question.correctAnswers || []),
            ].sort(
              (a, b) => a - b
            );


            isCorrect =
              studentAnswers.length ===
                correctAnswers.length &&
              studentAnswers.every(
                (value, index) =>
                  value ===
                  correctAnswers[index]
              );

          }


          // ==========================================
          // Essay
          // ==========================================

          else if (
            question.type === "essay"
          ) {

            return {

              questionId:
                answer.questionId,

              essayAnswer:
                answer.essayAnswer || "",

              isCorrect: false,

              marksAwarded: 0,

              reviewed: false,

              teacherComment: "",

            };

          }


          // ==========================================
          // الدرجة
          // ==========================================

          if (
            isCorrect
          ) {

            marksAwarded =
              Number(
                question.marks
              ) || 0;


            score +=
              marksAwarded;

          }


          // ==========================================
          // حفظ الإجابة
          // ==========================================

          return {

            questionId:
              answer.questionId,

            selectedAnswers:
              Array.isArray(
                answer.selectedAnswers
              )
                ? answer.selectedAnswers
                : [],

            isCorrect,

            marksAwarded,

            reviewed: false,

            teacherComment: "",

          };

        }
      );


    // ==================================================
    // إضافة الأسئلة التي لم يتم الإجابة عليها
    // ==================================================

    questions.forEach(
      (question) => {

        const alreadyAnswered =
          checkedAnswers.some(
            answer =>
              String(
                answer.questionId
              ) ===
              String(question._id)
          );


        if (
          alreadyAnswered
        ) {

          return;

        }


        // ------------------------------------------
        // Essay
        // ------------------------------------------

        if (
          question.type === "essay"
        ) {

          checkedAnswers.push({

            questionId:
              question._id,

            essayAnswer: "",

            isCorrect: false,

            marksAwarded: 0,

            reviewed: false,

            teacherComment: "",

          });

        }


        // ------------------------------------------
        // Other
        // ------------------------------------------

        else {

          checkedAnswers.push({

            questionId:
              question._id,

            selectedAnswers: [],

            isCorrect: false,

            marksAwarded: 0,

            reviewed: false,

            teacherComment: "",

          });

        }

      }
    );


    // ==================================================
    // حساب النسبة
    // ==================================================

    const percentage =
      exam.totalMarks > 0

        ? (
            score /
            exam.totalMarks
          ) * 100

        : 0;


    // ==================================================
    // تحديث المحاولة
    // ==================================================

    attempt.answers =
      checkedAnswers;


    attempt.score =
      score;


    attempt.percentage =
      Math.round(
        percentage
      );


    // ==================================================
    // حالة الامتحان
    // ==================================================

    attempt.status =
      hasEssay
        ? "submitted"
        : "reviewed";


    // ==================================================
    // وقت التسليم
    // ==================================================

    const finishedAt =
      new Date();


    attempt.finishedAt =
      finishedAt;


    // ==================================================
    // Auto Submit
    // ==================================================

    attempt.isAutoSubmitted =
      Boolean(
        isAutoSubmitted
      );


    // ==================================================
    // الوقت المستغرق
    // ==================================================

    if (
      attempt.startedAt
    ) {

      const elapsed =
        Math.floor(
          (
            finishedAt -
            attempt.startedAt
          ) / 1000
        );


      // لو كان فيه pauses
      // نعتمد على الوقت المستخدم
      // من إجمالي وقت الامتحان

      const totalDuration =
        Math.floor(
          Number(
            exam.duration || 0
          ) * 60
        );


      attempt.timeTaken =
        Math.max(
          0,
          Math.min(
            elapsed,
            totalDuration
          )
        );

    }


    // ==================================================
    // انتهى الوقت
    // ==================================================

    attempt.remainingTime =
      0;


    attempt.expiresAt =
      null;


    attempt.pausedAt =
      null;


    // ==================================================
    // حفظ
    // ==================================================

    attempt.markModified(
      "answers"
    );


    await attempt.save();


    // ==================================================
    // Response
    // ==================================================

    return res.json({

      success: true,

      message:
        isAutoSubmitted

          ? "تم تسليم الامتحان تلقائيًا لانتهاء الوقت"

          : "تم تسليم الامتحان بنجاح",

      score,

      percentage:
        attempt.percentage,

      status:
        attempt.status,

      isAutoSubmitted:
        attempt.isAutoSubmitted,

    });


  } catch (error) {

    console.log(
      "SUBMIT EXAM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Save Answers During Exam
// ======================================================

export const saveAnswers = async (req, res) => {

  try {

    const attempt =
      await ExamAttempt.findById(
        req.params.id
      );

    // ==================================================
    // المحاولة غير موجودة
    // ==================================================

    if (!attempt) {

      return res.status(404).json({

        success: false,

        message: "Attempt not found",

      });

    }

    // ==================================================
    // حماية الطالب
    // ==================================================

    if (
      String(attempt.studentId) !==
      String(req.user.id)
    ) {

      return res.status(403).json({

        success: false,

        message: "غير مسموح",

      });

    }

    // ==================================================
    // لا يمكن الحفظ بعد التسليم
    // ==================================================

    if (
      attempt.status === "submitted" ||
      attempt.status === "reviewed"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "الامتحان تم تسليمه بالفعل",

      });

    }

    const {
      answers,
      remainingTime,
    } = req.body;

    // ==================================================
    // التأكد من الإجابات
    // ==================================================

    if (!Array.isArray(answers)) {

      return res.status(400).json({

        success: false,

        message: "Invalid answers",

      });

    }

    // ==================================================
    // Normalize الإجابات الجديدة
    // ==================================================

    const normalizedAnswers =
      normalizeAnswers(answers);

    // ==================================================
    // دمج الإجابات القديمة مع الجديدة
    // ==================================================

    const existingAnswers =
      Array.isArray(attempt.answers)
        ? attempt.answers.map(
            answer =>
              answer.toObject
                ? answer.toObject()
                : answer
          )
        : [];

    const answersMap =
      new Map();

    // حفظ الإجابات القديمة
    existingAnswers.forEach(
      answer => {

        if (
          answer &&
          answer.questionId
        ) {

          answersMap.set(
            String(answer.questionId),
            answer
          );

        }

      }
    );

    // تحديث الإجابات الجديدة
    normalizedAnswers.forEach(
      answer => {

        if (
          answer &&
          answer.questionId
        ) {

          const questionId =
            String(answer.questionId);

          const oldAnswer =
            answersMap.get(
              questionId
            );

          // ==========================================
          // لو Essay
          // ==========================================

          if (
            answer.essayAnswer !== undefined
          ) {

            answersMap.set(
              questionId,
              {
                ...oldAnswer,
                ...answer,
                questionId:
                  answer.questionId,
              }
            );

          }

          // ==========================================
          // MCQ / TrueFalse / Checkbox
          // ==========================================

          else {

            answersMap.set(
              questionId,
              {
                ...oldAnswer,
                ...answer,
                questionId:
                  answer.questionId,
              }
            );

          }

        }

      }
    );

    // ==================================================
    // تحويل Map إلى Array
    // ==================================================

    attempt.answers =
      Array.from(
        answersMap.values()
      );

    // ==================================================
    // حفظ الوقت
    // ==================================================

    if (
      remainingTime !== undefined
    ) {

      attempt.remainingTime =
        normalizeRemainingTime(
          remainingTime
        );

    }

    // ==================================================
    // حماية إضافية
    // ==================================================

    if (
      attempt.status === "in_progress" &&
      attempt.expiresAt &&
      new Date() >= attempt.expiresAt
    ) {

      attempt.remainingTime = 0;

      attempt.status = "submitted";

      attempt.finishedAt =
        new Date();

      attempt.isAutoSubmitted = true;

      attempt.expiresAt = null;

    }

    // ==================================================
    // Mark Modified
    // ==================================================

    attempt.markModified(
      "answers"
    );

    await attempt.save();

    // ==================================================
    // Response
    // ==================================================

    return res.json({

      success: true,

      message: "Answers saved successfully",

      savedAnswers:
        attempt.answers,

      remainingTime:
        attempt.remainingTime,

      status:
        attempt.status,

    });

  } catch (error) {

    console.log(
      "SAVE ANSWERS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// ======================================================
// Get Exam Result
// ======================================================

export const getExamResult = async (
  req,
  res
) => {

  try {

    const studentId =
      req.user.id;

    const examId =
      req.params.examId;


    const exam =
      await Exam.findById(
        examId
      );


    if (!exam) {

      return res.status(404).json({

        success: false,

        message:
          "Exam not found",

      });

    }


    // ==================================================
    // النتائج لم يتم إعلانها
    // ==================================================

    if (
      !exam.resultsPublished
    ) {

      return res.json({

        success: false,

        resultsPublished: false,

        message:
          "لم يتم إعلان نتيجة الامتحان بعد",

      });

    }


    // ==================================================
    // جلب محاولة الطالب
    // ==================================================

    const attempt =
      await ExamAttempt.findOne({

        studentId,

        examId,

        status: {
          $in: [
            "submitted",
            "reviewed",
          ],
        },

      });


    if (!attempt) {

      return res.json({

        success: false,

        resultsPublished: true,

        message:
          "لا توجد نتيجة",

      });

    }


    // ==================================================
    // الأسئلة
    // ==================================================

    const questions =
      await Question.find({

        examId,

      }).sort({

        order: 1,

      });


    const review =
      questions.map(
        (question) => {

          const studentAnswer =
            attempt.answers.find(
              answer =>
                String(
                  answer.questionId
                ) ===
                String(
                  question._id
                )
            );


          return {

            questionId:
              question._id,

            question:
              question.question,

            image:
              question.image || "",

            type:
              question.type,

            options:
              question.options,

            studentAnswer:
              studentAnswer
                ? studentAnswer.selectedAnswers || []
                : [],

            essayAnswer:
              studentAnswer?.essayAnswer || "",

            marksAwarded:
              studentAnswer?.marksAwarded || 0,

            reviewed:
              studentAnswer?.reviewed || false,

            teacherComment:
              studentAnswer?.teacherComment || "",

            correctAnswers:
              question.correctAnswers,

            explanation:
              question.explanation,

            marks:
              question.marks,

          };

        }
      );


    return res.json({

      success: true,

      resultsPublished: true,

      result: {

        score:
          attempt.score,

        totalMarks:
          exam.totalMarks,

        percentage:
          attempt.percentage,

        status:
          attempt.status,

        questions:
          review,

      },

    });


  } catch (error) {

    console.log(
      "GET EXAM RESULT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Get My Results
// ======================================================

export const getMyResults = async (
  req,
  res
) => {

  try {

    const studentId =
      req.user.id;


    const attempts =
      await ExamAttempt.find({

        studentId,

        status: {
          $in: [
            "submitted",
            "reviewed",
          ],
        },

      })
      .populate({

        path: "examId",

        match: {
          resultsPublished: true,
        },

      })
      .sort({

        finishedAt: -1,

      });


    const publishedAttempts =
      attempts.filter(
        attempt =>
          attempt.examId
      );


    const results =
      publishedAttempts.map(
        attempt => ({

          _id:
            attempt._id,

          examId:
            attempt.examId?._id,

          title:
            attempt.examId?.title,

          score:
            attempt.score,

          totalMarks:
            attempt.examId?.totalMarks,

          percentage:
            attempt.percentage,

          finishedAt:
            attempt.finishedAt,

        })
      );


    const totalExams =
      results.length;


    const averagePercentage =
      totalExams > 0

        ? Math.round(

            results.reduce(
              (sum, r) =>
                sum + r.percentage,
              0
            ) /
            totalExams

          )

        : 0;


    const highestPercentage =
      totalExams > 0

        ? Math.max(
            ...results.map(
              r => r.percentage
            )
          )

        : 0;


    return res.json({

      success: true,

      statistics: {

        totalExams,

        averagePercentage,

        highestPercentage,

      },

      results,

    });


  } catch (error) {

    console.log(
      "GET MY RESULTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Teacher Exam Results
// ======================================================

export const getTeacherExamResults = async (
  req,
  res
) => {

  try {

    const teacherId =
      req.user.id;

    const examId =
      req.params.examId;


    const exam =
      await Exam.findOne({

        _id: examId,

        teacherId,

      });


    if (!exam) {

      return res.status(404).json({

        success: false,

        message:
          "Exam not found",

      });

    }


    const attempts =
      await ExamAttempt.find({

        examId,

        status: {
          $in: [
            "submitted",
            "reviewed",
          ],
        },

      })
      .populate(
        "studentId",
        "fullName grade phone"
      )
      .sort({

        finishedAt: -1,

      });


    const results =
      attempts.map(
        attempt => ({

          attemptId:
            attempt._id,

          student: {

            id:
              attempt.studentId?._id,

            name:
              attempt.studentId?.fullName,

            grade:
              attempt.studentId?.grade,

            phone:
              attempt.studentId?.phone,

          },

          score:
            attempt.score,

          totalMarks:
            exam.totalMarks,

          percentage:
            attempt.percentage,

          status:
            attempt.status,

          finishedAt:
            attempt.finishedAt,

        })
      );


    return res.json({

      success: true,

      exam: {

        title:
          exam.title,

        classId:
          exam.classId,

      },

      results,

    });


  } catch (error) {

    console.log(
      "TEACHER RESULTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Review Essay Answers
// ======================================================

export const reviewEssay = async (
  req,
  res
) => {

  try {

    const {
      answers,
      feedback,
    } = req.body;


    const attempt =
      await ExamAttempt.findById(
        req.params.id
      );


    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    let score =
      attempt.score;


    answers.forEach(
      item => {

        const answer =
          attempt.answers.find(
            a =>
              String(
                a.questionId
              ) ===
              String(
                item.questionId
              )
          );


        if (answer) {

          score -=
            answer.marksAwarded || 0;


          answer.marksAwarded =
            Number(
              item.marksAwarded
            ) || 0;


          answer.teacherComment =
            item.teacherComment || "";


          answer.reviewed =
            true;


          score +=
            answer.marksAwarded;

        }

      }
    );


    attempt.score =
      score;


    const exam =
      await Exam.findById(
        attempt.examId
      );


    if (
      exam &&
      exam.totalMarks > 0
    ) {

      attempt.percentage =
        Math.round(
          (
            score /
            exam.totalMarks
          ) * 100
        );

    }


    attempt.feedback =
      feedback || "";


    attempt.status =
      "reviewed";


    attempt.reviewedAt =
      new Date();


    attempt.reviewedBy =
      req.user.id;


    await attempt.save();


    return res.json({

      success: true,

      message:
        "Reviewed successfully",

      score,

    });


  } catch (error) {

    console.log(
      "REVIEW ESSAY ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Get Essay Reviews
// ======================================================

export const getEssayReviews = async (
  req,
  res
) => {

  try {

    const attempts =
      await ExamAttempt.find({

        status:
          "submitted",

      })
      .populate(
        "studentId"
      )
      .populate(
        "examId"
      );


    const reviews =
      attempts.filter(
        attempt =>

          attempt.answers.some(
            answer =>

              answer.essayAnswer &&
              answer.essayAnswer.trim() !== ""

          )
      );


    return res.json({

      success: true,

      reviews,

    });


  } catch (error) {

    console.log(
      "GET ESSAY REVIEWS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Get Exam Students Results
// ======================================================

export const getExamStudentsResults = async (
  req,
  res
) => {

  try {

    const {
      examId
    } = req.params;


    const attempts =
      await ExamAttempt.find({

        examId,

        status: {
          $in: [
            "submitted",
            "reviewed",
          ],
        },

      })
      .populate(
        "studentId",
        "fullName grade phone"
      )
      .sort({

        finishedAt: -1,

      });


    const students = {};


    attempts.forEach(
      attempt => {

        if (
          !attempt.studentId
        ) {

          return;

        }


        const id =
          String(
            attempt.studentId._id
          );


        if (
          !students[id]
        ) {

          students[id] = {

            studentId:
              attempt.studentId._id,

            name:
              attempt.studentId.fullName,

            grade:
              attempt.studentId.grade,

            phone:
              attempt.studentId.phone,

            score:
              attempt.score,

            percentage:
              attempt.percentage,

            status:
              attempt.status,

            attemptId:
              attempt._id,

            attempts: [],

          };

        }


        students[id].attempts.push({

          attemptId:
            attempt._id,

          score:
            attempt.score,

          percentage:
            attempt.percentage,

          status:
            attempt.status,

          date:
            attempt.finishedAt,

        });

      }
    );


    return res.json({

      success: true,

      results:
        Object.values(
          students
        ),

    });


  } catch (error) {

    console.log(
      "GET EXAM RESULTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Get Teacher Student Result
// ======================================================

export const getTeacherStudentResult = async (
  req,
  res
) => {

  try {

    const {
      attemptId
    } = req.params;


    const attempt =
      await ExamAttempt.findById(
        attemptId
      )
      .populate(
        "studentId",
        "fullName grade phone"
      )
      .populate(
        "examId",
        "title totalMarks"
      );


    if (!attempt) {

      return res.status(404).json({

        success: false,

        message:
          "Attempt not found",

      });

    }


    const questions =
      await Question.find({

        examId:
          attempt.examId._id,

      }).sort({

        order: 1,

      });


    const resultQuestions =
      questions.map(
        question => {

          const answer =
            attempt.answers.find(
              a =>
                String(
                  a.questionId
                ) ===
                String(
                  question._id
                )
            );


          return {

            questionId:
              question._id,

            question:
              question.question,

            image:
              question.image || "",

            type:
              question.type,

            options:
              question.options,

            studentAnswer:
              answer?.selectedAnswers || [],

            essayAnswer:
              answer?.essayAnswer || "",

            isCorrect:
              answer?.isCorrect || false,

            marksAwarded:
              answer?.marksAwarded || 0,

            reviewed:
              answer?.reviewed || false,

            teacherComment:
              answer?.teacherComment || "",

            correctAnswers:
              question.correctAnswers || [],

            explanation:
              question.explanation || "",

            marks:
              question.marks,

          };

        }
      );


    return res.json({

      success: true,

      result: {

        attemptId:
          attempt._id,

        student: {

          name:
            attempt.studentId?.fullName,

          grade:
            attempt.studentId?.grade,

          phone:
            attempt.studentId?.phone,

        },

        exam: {

          title:
            attempt.examId?.title,

          totalMarks:
            attempt.examId?.totalMarks,

        },

        score:
          attempt.score,

        percentage:
          attempt.percentage,

        status:
          attempt.status,

        finishedAt:
          attempt.finishedAt,

        questions:
          resultQuestions,

      },

    });


  } catch (error) {

    console.log(
      "TEACHER STUDENT RESULT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Publish Exam Results
// ======================================================

export const publishExamResults = async (
  req,
  res
) => {

  try {

    const teacherId =
      req.user.id;

    const examId =
      req.params.id;


    const exam =
      await Exam.findOne({

        _id: examId,

        teacherId,

      });


    if (!exam) {

      return res.status(404).json({

        success: false,

        message:
          "Exam not found",

      });

    }


    exam.resultsPublished =
      true;


    await exam.save();


    return res.json({

      success: true,

      message:
        "تم إظهار نتائج الامتحان للطلاب",

      resultsPublished:
        true,

    });


  } catch (error) {

    console.log(
      "PUBLISH EXAM RESULTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};


// ======================================================
// Unpublish Exam Results
// ======================================================

export const unpublishExamResults = async (
  req,
  res
) => {

  try {

    const teacherId =
      req.user.id;

    const examId =
      req.params.id;


    const exam =
      await Exam.findOne({

        _id: examId,

        teacherId,

      });


    if (!exam) {

      return res.status(404).json({

        success: false,

        message:
          "Exam not found",

      });

    }


    exam.resultsPublished =
      false;


    await exam.save();


    return res.json({

      success: true,

      message:
        "تم إخفاء نتائج الامتحان عن الطلاب",

      resultsPublished:
        false,

    });


  } catch (error) {

    console.log(
      "UNPUBLISH EXAM RESULTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};