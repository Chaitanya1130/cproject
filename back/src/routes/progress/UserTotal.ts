import { Router } from "express";
import { TotalCount } from "../../controllers/progress/UserTotal.js";

const router = Router();


router.get("/totalSummary/:uid", TotalCount);
router.get("/test", (req,res)=>{
  res.send("progress router alive");
});

export default router;
