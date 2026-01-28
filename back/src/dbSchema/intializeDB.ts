import {connectDB} from './connect.js';
import {tableCreation} from './userTable.js';
import { GlobalQues } from './QuestionTable.js';
import {refUsertoQues} from "./UserQuestion.js"

export const initDB=async()=>{
    await connectDB();
    await tableCreation();
    await GlobalQues();
    await refUsertoQues()
};