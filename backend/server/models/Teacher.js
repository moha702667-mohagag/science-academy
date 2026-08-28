import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    // =====================================
    // RELATION WITH USER
    // =====================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // =====================================
    // BASIC INFORMATION
    // =====================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    age: {
      type: Number,
      default: null,
    },

    governorate: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================
    // TEACHER INFORMATION
    // =====================================

    subject: {
      type: String,
      default: "Science",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================
    // PROFILE IMAGE
    // =====================================

    image: {
      type: String,
      default: "",
    },

    // =====================================
    // SOCIAL MEDIA
    // =====================================

    facebook: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    youtube: {
      type: String,
      default: "",
    },

    telegram: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model(
  "Teacher",
  teacherSchema
);

export default Teacher;