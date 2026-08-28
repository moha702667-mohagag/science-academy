import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import Homework from "../models/Homework.js";
import Exam from "../models/Exam.js";
import Class from "../models/Class.js";
import ExamAttempt from "../models/ExamAttempt.js";

// ================================
// بدء العنصر
// ================================

export const startProgress = async (req, res) => {
  try {

    const { itemId, itemType } = req.body;

    const studentId = req.user.id;

    let progress = await Progress.findOne({
      studentId,
      itemId,
      itemType,
    });

    // لو أول مرة
    if (!progress) {

      progress = await Progress.create({
        studentId,
        itemId,
        itemType,
        status: "started",
        startedAt: new Date(),
      });

    }

    res.status(200).json({
      success: true,
      progress,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};




// ================================
// إنهاء العنصر
// ================================

export const completeProgress = async (req, res) => {
  try {

    const {
      itemId,
      itemType,
      score,
      totalScore,
    } = req.body;

    const studentId = req.user.id;

    let progress = await Progress.findOne({
      studentId,
      itemId,
      itemType,
    });

    // لو مفيش سجل نعمله مباشرة Completed
    if (!progress) {

      progress = await Progress.create({
        studentId,
        itemId,
        itemType,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        score: score ?? null,
        totalScore: totalScore ?? null,
      });

    } else {

      progress.status = "completed";
      progress.completedAt = new Date();

      // نحفظ الدرجة لو موجودة
      if (score !== undefined) {
        progress.score = score;
      }

      if (totalScore !== undefined) {
        progress.totalScore = totalScore;
      }

      await progress.save();

    }

    res.status(200).json({
      success: true,
      progress,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};



// ================================
// جلب تقدم الطالب
// ================================

export const getStudentProgress = async (req, res) => {

  try {

    const progress = await Progress.find({

      studentId: req.user.id,

    });

    res.status(200).json({

      success: true,

      progress,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// //////////////////////////////////////////
export const updateWatchProgress = async(req,res)=>{

try{


const {
itemId,
watchPercentage,
watchTime
}=req.body;



const studentId = req.user.id;



let progress = await Progress.findOne({

studentId,

itemId,

itemType:"course"

});



if(!progress){

progress = await Progress.create({

studentId,

itemId,

itemType:"course",

status:"started",

watchPercentage,

watchTime

});


}else{


progress.watchPercentage = watchPercentage;

progress.watchTime = watchTime;

progress.status = "started";


await progress.save();


}



res.json({

success:true,

progress

});



}catch(error){

console.log(error);


res.status(500).json({

success:false,

message:"Server Error"

});


}

};


///////////////////////////////////////////////
export const getWatchProgress = async(req,res)=>{

try{


const studentId = req.user.id;


const progress = await Progress.findOne({

studentId,

itemId:req.params.itemId,

itemType:"course"

});



res.json({

success:true,

progress

});


}catch(error){

console.log(error);


res.status(500).json({

success:false,

message:"Server Error"

});


}

};



////////////////////////////////
export const getDashboardProgress = async (req, res) => {
  console.log("DASHBOARD PROGRESS API WORKING");
  try {
    const studentId = req.user.id;
    const gradeName = req.user.grade;

    const gradeMap = {
      "الرابع الابتدائي": 4,
      "الخامس الابتدائي": 5,
      "السادس الابتدائي": 6,
      "الأول الإعدادي": 7,
      "الثاني الإعدادي": 8,
      "الثالث الإعدادي": 9,
    };

    const gradeNumber = gradeMap[gradeName];

    const allClasses = await Class.find();

    console.log("ALL CLASSES FROM DB:", allClasses);

    const classData = await Class.findOne({
      name: gradeName
    });

    console.log("GRADE NAME:", gradeName);
    console.log("FOUND CLASS:", classData);

    if (!classData) {
      return res.json({
        success: true,
        attendance: 100,
        homework: 100,
        exam: 100,
        stats: {
          courses: {
            completed: 0,
            total: 0,
          },
          homeworks: {
            completed: 0,
            total: 0,
          },
          exams: {
            completed: 0,
            total: 0,
          },
        },
      });
    }

    /// ===========================
// Courses
// ===========================

const courses = await Course.find({
  classId: classData._id,
}).select("_id");

const courseIds = courses.map((c) => c._id);

const totalCourses = courseIds.length;

const completedCourses = await Progress.countDocuments({
  studentId,
  itemType: "course",
  status: "completed",
  itemId: { $in: courseIds },
});


// ===========================
// Homeworks
// ===========================

const homeworks = await Homework.find({
  classId: classData._id,
}).select("_id");

const homeworkIds = homeworks.map((h) => h._id);

const totalHomeworks = homeworkIds.length;

const completedHomeworks = await Progress.countDocuments({
  studentId,
  itemType: "homework",
  status: "completed",
  itemId: { $in: homeworkIds },
});


/// ===========================
// Exams
// ===========================

const exams = await Exam.find({
  classId: classData._id,
}).select("_id");

const examIds = exams.map((e) => e._id);

const totalExams = examIds.length;

// جلب كل المحاولات المكتملة للطالب
const examAttempts = await ExamAttempt.find({
  studentId,
  examId: { $in: examIds },
  status: {
    $in: ["submitted", "reviewed"],
  },
}).sort({
  finishedAt: -1,
});

// آخر محاولة مكتملة لكل امتحان فقط
const latestExamAttempts = new Map();

examAttempts.forEach((attempt) => {

  const examId = String(attempt.examId);

  if (!latestExamAttempts.has(examId)) {
    latestExamAttempts.set(examId, attempt);
  }

});

const completedExams = latestExamAttempts.size;

    console.log({
      totalCourses,
      completedCourses,
      totalHomeworks,
      completedHomeworks,
      totalExams,
      completedExams
    });

    const attendance =
  totalCourses === 0
    ? 100
    : Math.round(
        (completedCourses / totalCourses) * 100
      );

const homework =
  totalHomeworks === 0
    ? 100
    : Math.round(
        (completedHomeworks / totalHomeworks) * 100
      );

const exam =
  totalExams === 0
    ? 100
    : Math.round(
        (completedExams / totalExams) * 100
      );
    res.json({
  success: true,

  attendance,
  homework,
  exam,

  stats: {
    courses: {
      completed: completedCourses,
      total: totalCourses,
    },

    homeworks: {
      completed: completedHomeworks,
      total: totalHomeworks,
    },

    exams: {
      completed: completedExams,
      total: totalExams,
    },
  },
});
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};