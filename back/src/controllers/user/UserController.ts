import { pool } from '../../dbSchema/connect.js';
import {type Request,type Response } from 'express';
import jwt from 'jsonwebtoken';
import {hashedPassword} from '../../Services/misc/EncryptPass.js';
export const createUser=async(req:Request,res:Response)=>{
    try {
        const {username,email,password}=req.body;
        const hashed=await hashedPassword(password);
         const QueryFornewUser = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            returning *
        `;
        const result=await pool.query(QueryFornewUser,[username,email,hashed]);
        const newUser = result.rows[0];
        const token=jwt.sign(
            {userId:newUser.uid},
            process.env.JWT_SECRET as string,
        );
        res.status(201).json({
            message: 'New user has been created',
            user: {
                username: newUser.name,
                email: newUser.email
            },
            token: token

        })       
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error while inserting new users"
        });
    }
}