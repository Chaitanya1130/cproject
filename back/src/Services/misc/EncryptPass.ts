import bcrypt from 'bcrypt';

// import {password} from '../controllers/UserController.js';


export const hashedPassword = async (plainPassword: string ) => {
  return await bcrypt.hash(plainPassword, 10);
};
