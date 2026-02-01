import { type Request,type Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../dbSchema/connect.js";

export const login = async (req: Request, res: Response) => {
  const { username,email, password } = req.body;

  const result = await pool.query(
    "SELECT id, password FROM users WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.userId },               // 👈 ONLY put what you NEED
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  res.json({ token });
};
