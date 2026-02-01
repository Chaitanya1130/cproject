import { pool } from "../../dbSchema/connect.js"
import {type Request,type Response } from 'express';
export const QuesFetch=async(req:Request,res:Response)=>{
    try{
        const userid=(req as any).user.userId;
        const fetchQuesQuery=
        `
            select qid,qname,qpattern,link from questions;      
        ` 
        const ress=await pool.query(fetchQuesQuery);
        if(ress.rowCount===0){
            res.status(200).json({
                message:"Questions will be added soon",
                questions: []
            })
        }
        else{
            res.status(200).json({
                questions: ress.rows
            })
        }
    }
    catch (error) {
  console.error("QuesFetch error:", error);
  return res.status(500).json({ message: "Internal server error" });
}

}