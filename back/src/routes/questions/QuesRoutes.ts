import express from 'express';
import { Router } from 'express';
import { QuesFetch,OneQues,topic,RevisionQues,TodayQues } from '../../controllers/Questions/QuesFetch.js';
import { auth } from '../../middlewares/auth.js';
const router=Router();

router.get('/getallques',auth,QuesFetch);
router.post('/start',auth,OneQues);
router.get('/topics',auth,topic);
router.get('/revision',auth,RevisionQues);
router.get('/today',auth,TodayQues);
export default router;