import express from "express";

import {
addHomework,
getHomeworks,
deleteHomework,
updateHomework,
getStudentHomeworks
}
from "../controllers/homeworkController.js";

import {verifyToken} from "../middleware/auth.js";


const router = express.Router();

router.post(
"/",
verifyToken,
addHomework
);

router.delete(
"/:id",
verifyToken,
deleteHomework
);

router.get(
"/teacher",
verifyToken,
getHomeworks
);

router.put(
"/:id",
verifyToken,
updateHomework
);

router.get(
"/student",
verifyToken,
getStudentHomeworks
);

export default router;