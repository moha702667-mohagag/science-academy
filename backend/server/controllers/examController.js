import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Class from "../models/Class.js";

// ======================================
// إضافة امتحان
// ======================================

export const createExam = async (req, res) => {
  try {

    const {
      title,
      description,
      classId,
      duration,
      passingMarks,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showResultImmediately,
      allowBackNavigation,
      autoSave,
      showCorrectAnswers,
      startDate,
      endDate,
    } = req.body;

    const teacherId = req.user.id;

    const exam = await Exam.create({

      title,
      description,
      classId,
      teacherId,
      duration,
      passingMarks,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showResultImmediately,
      allowBackNavigation,
      autoSave,
      showCorrectAnswers,
      startDate,
      endDate,
      totalMarks: 0

    });

    res.status(201).json({
      success: true,
      exam,
    });

  } catch (error) {

    console.log("CREATE EXAM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};


// ======================================
// جلب امتحانات المدرس
// ======================================

export const getExams = async (req, res) => {

  try {

    const exams = await Exam.find()
      .populate("classId", "name")
      .sort({
        createdAt: -1
      });

    res.json({
      success: true,
      exams
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// جلب امتحان
// ======================================

export const getExam = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id)
      .populate("classId", "name");

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    res.json({
      success: true,
      exam
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// حذف امتحان
// ======================================

export const deleteExam = async (req, res) => {

  try {

    const { id } = req.params;

    const exam = await Exam.findById(id);

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    // حذف الأسئلة
    await Question.deleteMany({
      examId: id
    });

    // حذف محاولات الطلاب
    await ExamAttempt.deleteMany({
      examId: id
    });

    // حذف الامتحان
    await Exam.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Exam and all related data deleted successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// تعديل امتحان
// ======================================

export const updateExam = async (req, res) => {

  try {

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    res.json({
      success: true,
      exam
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// نشر الامتحان
// ======================================

export const publishExam = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id);

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    exam.status = "published";

    await exam.save();

    res.json({
      success: true,
      exam
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// جلب أسئلة الامتحان
// ======================================

export const getExamQuestions = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id);

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    const questions = await Question.find({
      examId: exam._id
    }).sort({
      order: 1
    });

    res.json({
      success: true,
      exam,
      questions
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// معلومات الامتحان
// ======================================

export const getExamInfo = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id);

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    const questionsCount =
      await Question.countDocuments({
        examId: exam._id
      });

    res.json({

      success: true,

      exam: {

        _id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        maxAttempts: exam.maxAttempts,
        questionsCount

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// هل يستطيع الطالب بدء محاولة؟
// ======================================

export const canStartExam = async (req, res) => {

  try {

    const examId = req.params.id;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId);

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    const attempts = await ExamAttempt.countDocuments({
      studentId,
      examId
    });

    const maxAttempts =
      exam.maxAttempts || 1;

    const canStart =
      attempts < maxAttempts;

    res.json({

      success: true,

      attempts,

      maxAttempts,

      remainingAttempts:
        Math.max(
          0,
          maxAttempts - attempts
        ),

      canStart

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


// ======================================
// جلب امتحانات الطالب حسب الصف الدراسي
// ======================================

export const getStudentExams = async (req, res) => {

  try {

    const studentId = req.user.id;
    const gradeName = req.user.grade;

    // ======================================
    // خريطة الصفوف
    // ======================================

    const gradeMap = {

      "الرابع الابتدائي": 4,
      "الخامس الابتدائي": 5,
      "السادس الابتدائي": 6,

      "الأول الإعدادي": 7,
      "الثاني الإعدادي": 8,
      "الثالث الإعدادي": 9,

      "الأول الثانوي": 10

    };

    const gradeNumber =
      gradeMap[gradeName];


    // ======================================
    // جلب الصف
    // ======================================

    const allClasses =
      await Class.find();

    const classData =
      allClasses.find(
        item =>
          String(item.gradeLevel) ===
          String(gradeNumber)
      );


    if (!classData) {

      return res.json({

        success: true,

        exams: []

      });

    }


    // ======================================
    // الامتحانات المنشورة
    // ======================================

    const exams =
      await Exam.find({

        classId: classData._id,

        status: "published"

      })
      .populate("classId")
      .sort({
        createdAt: -1
      });


    // ======================================
    // بيانات الطالب لكل امتحان
    // ======================================

    const examsWithData =
      await Promise.all(

        exams.map(async (exam) => {

          // ======================================
          // عدد الأسئلة
          // ======================================

          const questionsCount =
            await Question.countDocuments({

              examId: exam._id

            });


          // ======================================
          // جميع محاولات الطالب
          // ======================================

          const attempts =
            await ExamAttempt.find({

              studentId,

              examId: exam._id

            })
            .sort({
              attemptNumber: -1
            });


          // ======================================
          // عدد المحاولات المستخدمة
          // ======================================

          const attemptsCount =
            attempts.length;


          // ======================================
          // الحد الأقصى للمحاولات
          // ======================================

          const maxAttempts =
            exam.maxAttempts || 1;


          // ======================================
          // المحاولة الحالية قيد الحل
          // ======================================

          const inProgressAttempt =
            attempts.find(
              attempt =>
                attempt.status ===
                "in_progress"
            );


          // ======================================
          // آخر محاولة مكتملة
          // ======================================

          const completedAttempts =
            attempts.filter(
              attempt =>
                attempt.status === "submitted" ||
                attempt.status === "reviewed"
            );


          const lastCompletedAttempt =
            completedAttempts[0] || null;


          // ======================================
          // هل يستطيع عمل محاولة جديدة؟
          // ======================================

          const canStart =
            !inProgressAttempt &&
            completedAttempts.length < maxAttempts;


          // ======================================
          // تحديد حالة الامتحان
          // ======================================

          let attemptStatus =
            "not_started";


          // عند وجود محاولة قيد الحل
          if (inProgressAttempt) {

            attemptStatus =
              "in_progress";

          }

          // عند وجود محاولات مكتملة
          else if (
            completedAttempts.length > 0
          ) {

            // ما زالت هناك محاولات
            if (
              completedAttempts.length <
              maxAttempts
            ) {

              attemptStatus =
                "can_retry";

            }

            // انتهت كل المحاولات
            else {

              attemptStatus =
                "completed";

            }

          }


          // ======================================
          // النتيجة
          // ======================================

          let result = null;


          if (lastCompletedAttempt) {

            result = {

              score:
                lastCompletedAttempt.score,

              percentage:
                lastCompletedAttempt.percentage

            };

          }


          // ======================================
          // المحاولة المستخدمة للعرض
          // ======================================

          const displayAttempt =
            inProgressAttempt ||
            lastCompletedAttempt ||
            null;


          // ======================================
          // البيانات النهائية
          // ======================================

          return {

            ...exam.toObject(),

            questionsCount,

            attemptStatus,

            attemptId:
              displayAttempt?._id ||
              null,

            attemptsCount,

            completedAttempts:
              completedAttempts.length,

            maxAttempts,

            remainingAttempts:
              Math.max(
                0,
                maxAttempts -
                completedAttempts.length
              ),

            canStart,

            result

          };

        })

      );


    // ======================================
    // Response
    // ======================================

    res.status(200).json({

      success: true,

      exams: examsWithData

    });


  } catch (error) {

    console.log(
      "GET STUDENT EXAMS ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};


// ======================================
// إلغاء نشر الامتحان
// ======================================

export const unpublishExam = async (req, res) => {

  try {

    const exam =
      await Exam.findById(
        req.params.id
      );

    if (!exam) {

      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });

    }

    exam.status = "draft";

    await exam.save();

    res.json({
      success: true,
      exam
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};