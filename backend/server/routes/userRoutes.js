import express from "express";

import {
  getProfile,
  updateProfile
} from "../controllers/userController.js";

import { verifyToken } from "../middleware/auth.js";


const router = express.Router();


// ======================================
// جلب بيانات المستخدم
// ======================================

router.get(
  "/profile",
  verifyToken,
  getProfile
);


// ======================================
// تعديل بيانات المستخدم
// ======================================

router.put(
  "/profile",
  verifyToken,
  updateProfile
);


export default router;