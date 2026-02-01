import express from 'express';
import { Router } from 'express';
import { QuesFetch } from '../../controllers/Questions/QuesFetch.js';
import { auth } from '../../middlewares/auth.js';
const router=Router();

router.get('/getallques',auth,QuesFetch);

export default router;