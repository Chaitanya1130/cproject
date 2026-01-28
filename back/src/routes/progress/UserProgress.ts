import express from "express";
import { openQuestion, updateStatus } from "../../controllers/progress/UserProgress.js";

const router = express.Router();


router.post("/open/:qid", openQuestion);
router.post("/status/:qid", updateStatus);

export default router;
