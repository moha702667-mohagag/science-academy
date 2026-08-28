import express from "express";
import Class from "../models/Class.js";

const router = express.Router();

// ======================================
// إضافة الصفوف الأساسية — لا تشغله مرة أخرى
// ======================================

router.post("/seed", async (req, res) => {
  try {
    await Class.insertMany([
      {
        name: "الرابع الابتدائي",
        title: "علوم رابعة ابتدائي",
        gradeLevel: "4",
      },
      {
        name: "الخامس الابتدائي",
        title: "علوم خامسة ابتدائي",
        gradeLevel: "5",
      },
      {
        name: "السادس الابتدائي",
        title: "علوم سادسة ابتدائي",
        gradeLevel: "6",
      },
      {
        name: "الأول الإعدادي",
        title: "علوم أولى إعدادي",
        gradeLevel: "7",
      },
      {
        name: "الثاني الإعدادي",
        title: "علوم ثانية إعدادي",
        gradeLevel: "8",
      },
      {
        name: "الثالث الإعدادي",
        title: "علوم ثالثة إعدادي",
        gradeLevel: "9",
      },
      {
        name: "الأول الثانوي",
        title: "علوم متكاملة أولى ثانوي",
        gradeLevel: "10",
      },
    ]);

    res.json({
      success: true,
      message: "Classes added successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


// ======================================
// إضافة الأول الثانوي فقط
// ======================================
router.post("/add-secondary", async (req, res) => {
  try {
    const newClass = await Class.findOneAndUpdate(
      { name: "الأول الثانوي" },
      {
        name: "الأول الثانوي",
        title: "علوم متكاملة أولى ثانوي",
        description: "",
        gradeLevel: "10"
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: "تم إضافة الأول الثانوي بنجاح",
      class: newClass
    });

  } catch (error) {
    console.log("ADD SECONDARY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});

// ======================================
// جلب كل الصفوف
// ======================================

router.get("/", async (req, res) => {
  try {

    const classes = await Class.find();

    res.json(classes);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


export default router;