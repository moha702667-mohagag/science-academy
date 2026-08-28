import express from "express";

import { verifyToken } from "../middleware/auth.js";

import {

startProgress,

completeProgress,

getStudentProgress,

updateWatchProgress,

getDashboardProgress,

getWatchProgress

} from "../controllers/progressController.js";

const router = express.Router();

router.post(
"/start",
verifyToken,
startProgress
);

router.post(
"/complete",
verifyToken,
completeProgress
);

router.get(
"/student",
verifyToken,
getStudentProgress
);

router.post(
"/watch",
verifyToken,
updateWatchProgress
);

router.get(
"/watch/:itemId",
verifyToken,
getWatchProgress
);  

router.get(
  "/dashboard",
  verifyToken,
  getDashboardProgress
);

export default router;