import {type Request,type Response,type NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const auth=(req: Request, res: Response, next: NextFunction)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }
    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user=verified;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
}