import { pool } from '../../dbSchema/connect.js';
import {type Request,type Response } from 'express';

import {hashedPassword} from '../../Services/misc/EncryptPass.js';
export const createUser=async(req:Request,res:Response)=>{
    try {
        const {username,email,password}=req.body;
        const hashed=await hashedPassword(password);
         const QueryFornewUser = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
        `;
        await pool.query(QueryFornewUser,[username,email,hashed]);
        res.status(201).json({
            message:`New user has been created`

        })       
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error while inserting new users"
        });
    }
}