import express from 'express';
import { Router } from 'express';
import {createUser} from '../../controllers/user/UserController.js';
const router=Router();

router.post('/register',createUser);

export default router;