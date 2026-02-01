import { pool } from "../../dbSchema/connect.js";
import bcrypt from 'bcrypt';
import express from "express";
import {type Request,type Response } from "express";
import jwt from 'jsonwebtoken';
// const app=express();
// app.use(express.json());
export const UserLogin=async(req:Request,res:Response)=>{
    try{
        const {username,password}=req.body;
        const query=`
            select * from users where name=$1`;
        const ress=await pool.query(query,[username]);
        const user = ress.rows[0];
        console.log("Full user object:", user);        
    console.log("user.id:", user.id);              
    console.log("All keys:", Object.keys(user));
        if(!user){
            return res.status(400).json({ message: "Invalid Email or Password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }
        const token = jwt.sign(
            { userId: user.uid }, 
            process.env.JWT_SECRET as string,
        );
        res.json({
            message: "Login Successful",
            token,
            user: { name: user.name, email: user.email }
        });
    }
    catch (error) {
        console.error("Login error:", error); 
        res.status(500).json({ message: "Server Error" });
    }
}