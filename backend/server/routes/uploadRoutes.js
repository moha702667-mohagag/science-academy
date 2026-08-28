import express from "express";

import multer from "multer";

import {verifyToken} from "../middleware/auth.js";

import {uploadImage} from "../controllers/uploadController.js";

const router=express.Router();

const storage = multer.memoryStorage();

const upload = multer({

storage

});

router.post(

"/",

verifyToken,

upload.single("image"),

uploadImage

);

export default router;