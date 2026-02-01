  import { type Request,type Response } from "express";
  import {
    openQuestionService,
    updateStatusService,
  } from "../../Services/progress/UserProgress.js";
import { pool } from "../../dbSchema/connect.js";
  /**
   * When user opens a question
   * Increments visited + updates last_opened
   */
  export const openQuestion = async (req: Request, res: Response) => {
    try {
      const qid = Number(req.params.qid);

      if (isNaN(qid)) {
        return res.status(400).json({ message: "Invalid qid" });
      }
    const uid = (req as any).user.userId;

if (!uid) {
  return res.status(401).json({ message: "Unauthorized" });
}

      const result = await openQuestionService(uid, qid);

      res.json({
        message: "visited updated",
        data: result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * When user marks question as done / learning / revise
   */
  export const updateStatus = async (req: Request, res: Response) => {
    try {
      const qid = Number(req.params.qid);
      const { status } = req.body;

      if (isNaN(qid)) {
        return res.status(400).json({ message: "Invalid qid" });
      }

      // 💡 Added "not_started" to the allowed list if you want users to be able to reset progress
      if (!["done", "learning", "revise", "not_started"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Ensure this matches your auth middleware (e.g., .id or .userId)
const uid = (req as any).user.userId;

if (!uid) {
  return res.status(401).json({ message: "Unauthorized" });
}

      const result = await updateStatusService(uid, qid, status);

      res.json({
        message: "status updated",
        data: result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId; 

    // Make sure the query and the [uid] array are inside the same parentheses
    const result = await pool.query(
      "SELECT qid, status FROM userprogress WHERE uid = $1", 
      [uid] 
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error("DB Fetch Error:", error);
    res.status(500).json({ message: "Error fetching progress" });
  }
};
