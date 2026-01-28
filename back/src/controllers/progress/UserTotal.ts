import { type Request,type  Response } from "express";
import { getUserSummary } from "../../Services/progress/UserTotal.js";
import console from "node:console";



export const TotalCount=async(req: Request, res: Response)=>{
    try{
        const uid = Number(req.params.uid);
        if(!uid){
            return res.status(400).json({"message":"Invalid uid"});
        }
        const result = await getUserSummary(uid);
        return res.status(200).json({
            result
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
        message: "error fetching summary"
    });
    }
}