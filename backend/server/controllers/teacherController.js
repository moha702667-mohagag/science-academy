import User from "../models/User.js";
import Course from "../models/Course.js";
import Homework from "../models/Homework.js";
import Exam from "../models/Exam.js";
import Progress from "../models/Progress.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Class from "../models/Class.js";

export const getTeacherDashboardStats = async (req, res) => {
  try {

    const teacherId = req.user.id;

    console.log("TEACHER ID:", teacherId);

    const studentsCount = await User.countDocuments({
      role: "student",
      accountStatus: "approved",

    });

    const coursesCount = await Course.countDocuments({
      teacherId
    });

    const homeworksCount = await Homework.countDocuments({
      teacherId
    });

    const examsCount = await Exam.countDocuments({
      teacherId
    });

    console.log("STUDENTS:", studentsCount);
    console.log("COURSES:", coursesCount);
    console.log("HOMEWORKS:", homeworksCount);
    console.log("EXAMS:", examsCount);

    res.json({
      success: true,

      statistics: {
        students: studentsCount,
        courses: coursesCount,
        homeworks: homeworksCount,
        exams: examsCount
      }
    });

  } catch (error) {

    console.log(
      "TEACHER DASHBOARD STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};



// ======================================
// Dashboard طالب للمدرس
// ======================================

export const getTeacherStudentDashboard = async (req, res) => {

  try {

    const { studentId } = req.params;


    // ======================================
    // الطالب
    // ======================================

    const student = await User.findOne({

      _id: studentId,
      role: "student",
      accountStatus: "approved",


    }).select(
      "fullName phone parentPhone address grade"
    );


    if (!student) {

      return res.status(404).json({

        success: false,
        message: "Student not found"

      });

    }


    // ======================================
    // الصف
    // نفس طريقة Dashboard الطالب
    // ======================================

    const gradeName = student.grade;


    const gradeMap = {

  "الرابع الابتدائي": 4,
  "الخامس الابتدائي": 5,
  "السادس الابتدائي": 6,

  "الأول الإعدادي": 7,
  "الثاني الإعدادي": 8,
  "الثالث الإعدادي": 9,

  "الأول الثانوي": 10,

};


    const gradeNumber = gradeMap[gradeName];


    // ======================================
    // Class
    // ======================================

    const classData = await Class.findOne({

      name: gradeName

    });


    console.log(
      "TEACHER VIEW GRADE:",
      gradeName
    );


    console.log(
      "TEACHER VIEW CLASS:",
      classData
    );


    // ======================================
    // لو الصف مش موجود
    // ======================================

    if (!classData) {

      return res.json({

        success: true,

        student,

        progress: {

          attendance: 100,
          homework: 100,
          exam: 100

        },

        stats: {

          courses: {

            completed: 0,
            total: 0

          },

          homeworks: {

            completed: 0,
            total: 0

          },

          exams: {

            completed: 0,
            total: 0

          }

        }

      });

    }


    // ======================================
    // Courses
    // نفس Dashboard الطالب
    // ======================================

    const courses = await Course.find({

      classId: classData._id

    }).select("_id");


    const courseIds = courses.map(
      course => course._id
    );


    const totalCourses =
      courseIds.length;


    const completedCourses =
      await Progress.countDocuments({

        studentId,

        itemType: "course",

        status: "completed",

        itemId: {
          $in: courseIds
        }

      });


    // ======================================
    // Homeworks
    // ======================================

    const homeworks = await Homework.find({

      classId: classData._id

    }).select("_id");


    const homeworkIds = homeworks.map(
      homework => homework._id
    );


    const totalHomeworks =
      homeworkIds.length;


    const completedHomeworks =
      await Progress.countDocuments({

        studentId,

        itemType: "homework",

        status: "completed",

        itemId: {
          $in: homeworkIds
        }

      });


    // ======================================
    // Exams
    // ======================================

    const exams = await Exam.find({

      classId: classData._id

    }).select("_id");


    const examIds = exams.map(
      exam => exam._id
    );


    const totalExams =
      examIds.length;


    // ======================================
    // Exam Attempts
    // ======================================

    const examAttempts =
      await ExamAttempt.find({

        studentId,

        examId: {
          $in: examIds
        },

        status: {
          $in: [
            "submitted",
            "reviewed"
          ]
        }

      }).sort({

        finishedAt: -1

      });


    // ======================================
    // آخر محاولة لكل امتحان
    // ======================================

    const latestExamAttempts =
      new Map();


    examAttempts.forEach(
      attempt => {

        const examId =
          String(attempt.examId);


        if (
          !latestExamAttempts.has(
            examId
          )
        ) {

          latestExamAttempts.set(
            examId,
            attempt
          );

        }

      }
    );


    const completedExams =
      latestExamAttempts.size;


    // ======================================
    // النسب
    // نفس Dashboard الطالب
    // ======================================

    const attendance =

      totalCourses === 0

        ? 100

        : Math.round(

            (
              completedCourses /
              totalCourses
            ) * 100

          );


    const homework =

      totalHomeworks === 0

        ? 100

        : Math.round(

            (
              completedHomeworks /
              totalHomeworks
            ) * 100

          );


    const exam =

      totalExams === 0

        ? 100

        : Math.round(

            (
              completedExams /
              totalExams
            ) * 100

          );


    // ======================================
    // Debug
    // ======================================

    console.log({

      studentId,

      gradeName,

      totalCourses,
      completedCourses,

      totalHomeworks,
      completedHomeworks,

      totalExams,
      completedExams,

      attendance,
      homework,
      exam

    });


    // ======================================
    // Response
    // ======================================

    res.json({

      success: true,

      student,


      progress: {

        attendance,
        homework,
        exam

      },


      stats: {

        courses: {

          completed:
            completedCourses,

          total:
            totalCourses

        },


        homeworks: {

          completed:
            completedHomeworks,

          total:
            totalHomeworks

        },


        exams: {

          completed:
            completedExams,

          total:
            totalExams

        }

      }

    });


  } catch (error) {

    console.log(
      "TEACHER STUDENT DASHBOARD ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

export const getTeacherStudents = async (req, res) => {
  try {
    // ======================================
    // Teacher Only
    // ======================================

    if (req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "غير مسموح لك",
      });
    }

    // ======================================
    // Get ONLY approved students
    // ======================================

    const students = await User.find({
      role: "student",
      accountStatus: "approved",
    })
      .select("-password")
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      students,
    });

  } catch (error) {

    console.log(
      "GET TEACHER STUDENTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلاب",
    });

  }
};