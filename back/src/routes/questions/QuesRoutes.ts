import express from 'express';
import { Router } from 'express';
import { QuesFetch,OneQues,topic } from '../../controllers/Questions/QuesFetch.js';
import { auth } from '../../middlewares/auth.js';
const router=Router();

router.get('/getallques',auth,QuesFetch);
router.post('/start',auth,OneQues);
router.get('/topics',auth,topic);
export default router;