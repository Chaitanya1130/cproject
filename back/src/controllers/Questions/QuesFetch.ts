import { pool } from "../../dbSchema/connect.js";
import { type Request,type  Response } from "express";

/* ---------------- FETCH ALL QUESTIONS ---------------- */
export const QuesFetch = async (req: Request, res: Response) => {
  try {
    const fetchQuesQuery = `
      SELECT qid, qname, qpattern, link
      FROM questions
    `;

    const result = await pool.query(fetchQuesQuery);

    res.status(200).json({
      questions: result.rows,
    });
  } catch (error) {
    console.error("QuesFetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- FETCH TODAY'S QUESTION ---------------- */
export const TodayQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const query = `
      SELECT
        q.qid,
        q.qname,
        q.qpattern,
        q.link,
        u.status,
        u.assigned_date
      FROM userprogress u
      JOIN questions q
        ON q.qid = u.qid
      WHERE u.uid = $1
        AND u.revision_cycle = 'none'
        AND u.assigned_date = CURRENT_DATE
      LIMIT 1
    `;

    const result = await pool.query(query, [uid]);

    if (result.rowCount === 0) {
      return res.json({
        question: null,
      });
    }

    res.json({
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching today's question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- START PRACTICE (ASSIGN TODAY QUESTION) ---------------- */
export const OneQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;
    const topic = req.body.topic as string;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const query = `
      SELECT
        q.qid,
        q.qname,
        q.qpattern,
        q.link
      FROM questions q
      LEFT JOIN userprogress u
        ON q.qid = u.qid AND u.uid = $1
      WHERE q.qpattern = $2
        AND (u.status IS NULL OR u.status != 'done')
      ORDER BY q.qid
      LIMIT 1
    `;

    const queryRes = await pool.query(query, [uid, topic]);

    if (queryRes.rowCount === 0) {
      return res.json({
        message: "No questions left in this topic",
        question: null,
      });
    }

    const question = queryRes.rows[0];

    // Insert as Today's Question
    const insertQuery = `
      INSERT INTO userprogress (uid, qid, status, revision_cycle, assigned_date)
      VALUES ($1, $2, 'learning', 'none', CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `;

    await pool.query(insertQuery, [uid, question.qid]);

    res.json({
      question,
    });
  } catch (error) {
    console.error("Error starting practice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- FETCH AVAILABLE TOPICS ---------------- */
export const topic = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const query = `
      SELECT DISTINCT q.qpattern
      FROM questions q
      LEFT JOIN userprogress u
        ON q.qid = u.qid AND u.uid = $1
      WHERE q.qpattern IS NOT NULL
        AND (u.status IS NULL OR u.status != 'done')
      ORDER BY q.qpattern
    `;

    const queryRes = await pool.query(query, [uid]);

    res.json({
      topics: queryRes.rows.map((r) => r.qpattern),
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- FETCH REVISION TODO ---------------- */
export const RevisionQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const query = `
      SELECT
        q.qid,
        q.qname,
        q.qpattern,
        q.link,
        u.status,
        u.revision_cycle,
        u.assigned_date
      FROM questions q
      JOIN userprogress u
        ON q.qid = u.qid
      WHERE u.uid = $1
        AND u.revision_cycle != 'none'
        AND u.status IN ('learning', 'revise')
      ORDER BY u.assigned_date DESC, q.qname
    `;

    const queryRes = await pool.query(query, [uid]);

    res.json({
      revisionQues: queryRes.rows,
    });
  } catch (error) {
    console.error("Error fetching revision questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
