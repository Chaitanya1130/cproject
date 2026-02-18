import { pool } from "../../dbSchema/connect.js";




export const QuestionConfidence=async(uid:number,qid:number)=>{
    try{
        const query=
            `   select status from userprogress where uid=$1 and qid=$2 ;
            `
        const res=await pool.query(query,[uid,qid]);
        return res.rows.length > 0 ? res.rows[0] : null;
    }
    catch(error){
        throw new Error("Could not retrieve question status.");
    }
}