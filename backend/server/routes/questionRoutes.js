import express from "express";

import upload from "../middleware/upload.js";

import {

createQuestion,
getQuestions,
updateQuestion,
deleteQuestion

} from "../controllers/questionController.js";


const router = express.Router();



router.post(
"/",
upload.single("image"),
createQuestion
);



router.get(
"/exam/:examId",
getQuestions
);



router.put(
"/:id",
updateQuestion
);



router.delete(
"/:id",
deleteQuestion
);



export default router;