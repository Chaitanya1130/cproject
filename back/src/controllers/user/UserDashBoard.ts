import { pool } from '../../dbSchema/connect.js';
import {type Request,type Response } from 'express';

export const UserDashBoard=async(req:Request,res:Response)=>{
    try{
        const userid=(req as any).user.userId;
        const userQuery = 'SELECT uid, name, email FROM users WHERE uid = $1';
        const userResult = await pool.query(userQuery, [userid]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        const user = userResult.rows[0];
        const progressQuery = 'SELECT COUNT(*) FROM userprogress WHERE uid = $1 AND status = $2';
        const progressResult = await pool.query(progressQuery, [userid, 'done']);

        res.status(200).json({
            user: {
                id: user.uid,
                name: user.name,
                email: user.email
            },
            stats: {
                completedQuestions: progressResult.rows[0].count
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data" });
    
    }
}

