import { Router } from "express";
import { getAnalytics } from "../../controllers/Analytics/Analysis.js"
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get("/data", auth, getAnalytics);

export default router;