import { pool } from "../../dbSchema/connect.js";
import bcrypt from 'bcrypt';
import { type Request, type Response } from "express";
import jwt from 'jsonwebtoken';

export const UserLogin = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const result = await pool.query(
            `SELECT * FROM users WHERE name = $1`,
            [username]
        );

        const user = result.rows[0];

        // ← guard BEFORE accessing any property on user
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user.uid },
            process.env.JWT_SECRET as string,
        );

        res.json({
            message: "Login Successful",
            token,
            user: { name: user.name, email: user.email },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};