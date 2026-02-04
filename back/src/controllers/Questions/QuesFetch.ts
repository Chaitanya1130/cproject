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

export const OneQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;
    const topic = req.body.topic as string;
    console.log("query:", req.query);
    console.log("body:", req.body);

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const query = `
       SELECT 
  q.qid,      
  q.qname,
  q.qpattern,
  q.link,
  u.status
      FROM questions q
      LEFT JOIN userprogress u
        ON q.qid = u.qid AND u.uid = $1
      WHERE q.qpattern = $2
        AND (u.status IS NULL OR u.status != 'done')
      ORDER BY q.qid
      LIMIT 1
    `;

    const queryRes = await pool.query(query, [uid, topic]);

    if (queryRes.rowCount === 0) {
      return res.json({
        message: "No questions left in this topic",
        question: null,
      });
    }

    res.json({
      question: queryRes.rows[0],
    });
  } catch (error) {
    console.error("Error fetching one question:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const topic=async(req:Request,res:Response)=>{
    try{
        const uid=(req as any).user.userId;
        const query=
        `select distinct q.qpattern from questions q left join userprogress u on q.qid=u.qid and u.uid=$1
        where q.qpattern is not null AND (u.status IS NULL OR u.status != 'done') order by q.qpattern`;
        const queryRes=await pool.query(query,[uid]);
        res.json({
      topics: queryRes.rows.map((r) => r.qpattern),
    });
    }
    catch(error){
        console.error("Error fetching topics:", error);
        res.status(500).json({ message: "Server error" });
    }
    
}

export const RevisionQues=async(req:Request,res:Response)=>{
    try{
        const uid=(req as any).user.userId;
        const query=
        `select * from questions q join userprogress u on q.qid=u.qid where uid=$1
            and q.qname is not null and ( u.status ='learning' or u.status='revise') order by q.qname
        `;
        const queryRes=await pool.query(query,[uid]);
        res.json({
            revisionQues:queryRes.rows
        })
    }
    catch(error){
        console.error("Error fetching topics:", error);
        res.status(500).json({ message: "Server error" });

    }
}