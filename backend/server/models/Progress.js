import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    itemType: {
      type: String,
      enum: ["course", "homework", "exam"],
      required: true,
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    score: {
      type: Number,
      default: null,
    },

    totalScore: {
      type: Number,
      default: null,
    },

    watchPercentage: {
      type: Number,
      default: 0,
    },

    watchTime: {
      type: Number,
      default: 0,
    },
    
  },
  {
    timestamps: true,
  }
);

// منع تكرار نفس العنصر لنفس الطالب
progressSchema.index(
  {
    studentId: 1,
    itemId: 1,
    itemType: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Progress", progressSchema);