import express from 'express';
import { Router } from 'express';
import {createUser} from '../../controllers/user/UserController.js';
const router=Router();
import { auth } from '../../middlewares/auth.js';
import {UserDashBoard} from '../../controllers/user/UserDashBoard.js'
import { UserLogin } from '../../controllers/user/UserLogin.js';
import { UserInprogress } from '../../controllers/user/UserInprogress.js';
router.post('/register',createUser);
router.get("/userhome", auth, UserDashBoard);
router.post("/login", UserLogin);
router.get("/userinprogress",auth,UserInprogress);
export default router;