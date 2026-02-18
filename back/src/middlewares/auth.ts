import {type Request,type Response,type NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  //
  // console.log("--- Auth Debug ---");
  // console.log("Token Received:", token ? "YES" : "NO");
  
  if (!token) {
    console.log("Reason: Missing Token");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    // console.log(decoded);
    console.log("Decoded User ID:", decoded.userId);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.log("JWT Verify Error:", err.message); // This will tell us if it's 'expired' or 'invalid signature'
    return res.status(403).json({ message: "Invalid token" });
  }
};