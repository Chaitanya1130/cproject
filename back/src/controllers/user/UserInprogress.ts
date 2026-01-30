import { pool } from "../../dbSchema/connect.js"
import {type Request,type Response } from 'express';


export const UserInprogress=async(req:Request,res:Response)=>{
    try{
        const userid=(req as any).user.userId;
        const getInprogressQuestionsQuery = `
            select q.qid,q.qname,q.qpattern,q.link,q.created_at,u.status from questions q join userprogress u on q.qid = u.qid where u.uid = $1 AND u.status = $2;
`;
        const queryRes=await pool.query(getInprogressQuestionsQuery,[userid,'learning']);
        if (queryRes.rows.length === 0) {
            res.status(200).json({
                message: "No in-progress questions",
                questions: []
            });
        }
        else{res.status(200).json({
        questions: queryRes.rows
        })};
    }
        catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch in-progress questions"
        });
}

}