import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "mcq",
        "trueFalse",
        "essay",
        "checkbox",
      ],
      default: "mcq",
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    // صورة السؤال
    image: {
      type: String,
      default: "",
    },

    // صورة للإجابة (اختياري)
    answerImage: {
      type: String,
      default: "",
    },

    // الاختيارات
    options:[
  {
    optionId:{
      type:Number,
      required:true
    },

    text:{
      type:String,
      required:true
    }
  }
],

    // أرقام الاختيارات الصحيحة
    correctAnswers: [
      {
        type: Number,
      },
    ],

    // درجة السؤال
    marks: {
      type: Number,
      default: 1,
    },

    // شرح يظهر بعد الامتحان
    explanation: {
      type: String,
      default: "",
    },

    // ترتيب السؤال
    order: {
      type: Number,
      default: 0,
    },

    // هل السؤال مطلوب؟
    required: {
      type: Boolean,
      default: true,
    },

    // إخفاء السؤال بدون حذفه
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", questionSchema);