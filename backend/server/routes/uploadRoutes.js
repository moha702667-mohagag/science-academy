import express from "express";
import multer from "multer";

import { verifyToken } from "../middleware/auth.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log("UPLOAD FILE INFO:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

router.post(
  "/",
  verifyToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("MULTER ERROR:", err);

        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      if (err) {
        console.error("UPLOAD MIDDLEWARE ERROR:", err);

        return res.status(400).json({
          success: false,
          message: err.message || "Invalid image upload",
        });
      }

      console.log("REQ.FILE:", req.file);

      next();
    });
  },
  uploadImage
);

export default router;