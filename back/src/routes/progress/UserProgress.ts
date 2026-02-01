import express from "express";
import { openQuestion, updateStatus } from "../../controllers/progress/UserProgress.js";
import { auth } from "../../middlewares/auth.js";
import { getUserProgress } from "../../controllers/progress/UserProgress.js";
const router = express.Router();


router.post("/open/:qid",auth ,openQuestion);
router.patch("/status/:qid",auth, updateStatus);
router.get("/", auth, getUserProgress);

export default router;
