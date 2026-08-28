import express from "express";

import {
addCourse,
getCourses,
updateCourse,
deleteCourse,
getCoursesByClass,
getStudentCourses,
getCourseById

} from "../controllers/courseController.js";

import {verifyToken} from "../middleware/auth.js";


const router = express.Router();

router.get(
"/student",
verifyToken,
getStudentCourses
);

router.get(
"/:id",
verifyToken,
getCourseById
);

router.get(
"/",
verifyToken,
getCourses
);



router.post(
"/",
verifyToken,
addCourse
);



router.put(
"/:id",
verifyToken,
updateCourse
);



router.delete(
"/:id",
verifyToken,
deleteCourse
);


export default router;