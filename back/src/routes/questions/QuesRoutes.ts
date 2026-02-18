import express from 'express';
import { Router } from 'express';
import { QuesFetch,OneQues,topic,RevisionQues,TodayQues,updateStatus } from '../../controllers/Questions/QuesFetch.js';
import { auth } from '../../middlewares/auth.js';
const router=Router();

router.get('/getallques',auth,QuesFetch);
router.post('/start',auth,OneQues);
router.get('/topics',auth,topic);
router.get('/revision',auth,RevisionQues);
router.get('/today',auth,TodayQues);
router.post('/update-status',auth,updateStatus);
export default router;