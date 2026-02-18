import { pool } from "../../dbSchema/connect.js";
import { type Request, type Response } from "express";

/* ---------------- FETCH ALL QUESTIONS ---------------- */
export const QuesFetch = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT qid, qname, qpattern, link
      FROM questions
    `);
    res.status(200).json({ questions: result.rows });
  } catch (error) {
    console.error("QuesFetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- FETCH TODAY'S QUESTION ---------------- */
export const TodayQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const result = await pool.query(`
      SELECT
        q.qid,
        q.qname,
        q.qpattern,
        q.link,
        u.status,
        u.success_streak,
        u.next_review_date
      FROM userprogress u
             JOIN questions q ON q.qid = u.qid
      WHERE u.uid = $1
        AND u.next_review_date <= CURRENT_DATE
        AND u.status != 'completed_forever'
      ORDER BY u.next_review_date ASC
        LIMIT 1
    `, [uid]);

    res.json({ question: result.rowCount === 0 ? null : result.rows[0] });
  } catch (error) {
    console.error("TodayQues error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- START PRACTICE (ASSIGN TODAY'S QUESTION) ---------------- */
export const OneQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;
    const topic = req.body.topic as string;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    // Step 1: Find a question in this topic the user hasn't started yet
    const pickResult = await pool.query(`
      SELECT q.qid, q.qname, q.qpattern, q.link
      FROM questions q
      WHERE q.qpattern = $1
        AND q.qid NOT IN (
        SELECT qid FROM userprogress WHERE uid = $2
      )
      ORDER BY RANDOM()
        LIMIT 1
    `, [topic, uid]);

    if (pickResult.rowCount === 0) {
      return res.status(200).json({
        message: "No new questions left in this topic",
        question: null,
      });
    }

    const question = pickResult.rows[0];

    // Step 2: Insert into userprogress so it shows up as today's question
    await pool.query(`
      INSERT INTO userprogress (uid, qid, status, next_review_date, rev_interval, success_streak)
      VALUES ($1, $2, 'learning', CURRENT_DATE, 0, 0)
        ON CONFLICT (uid, qid) DO NOTHING
    `, [uid, question.qid]);

    res.status(200).json({ question });
  } catch (error) {
    console.error("OneQues error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- FETCH AVAILABLE TOPICS ---------------- */
export const topic = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const queryRes = await pool.query(`
      SELECT DISTINCT q.qpattern
      FROM questions q
             LEFT JOIN userprogress u ON q.qid = u.qid AND u.uid = $1
      WHERE q.qpattern IS NOT NULL
        AND (u.status IS NULL OR u.status != 'done')
      ORDER BY q.qpattern
    `, [uid]);

    res.json({ topics: queryRes.rows.map((r) => r.qpattern) });
  } catch (error) {
    console.error("topic error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- FETCH REVISION TODO ---------------- */
export const RevisionQues = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.userId;

    const result = await pool.query(`
      SELECT q.qid, q.qname, q.qpattern, q.link, u.status, u.next_review_date
      FROM questions q
             JOIN userprogress u ON q.qid = u.qid
      WHERE u.uid = $1
        AND u.status IN ('learning', 'revise')
      ORDER BY u.status DESC, u.next_review_date ASC
    `, [uid]);

    res.json({ revisionQues: result.rows });
  } catch (error) {
    console.error("RevisionQues error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- UPDATE STATUS (SPACED REPETITION) ---------------- */
export const updateStatus = async (req: Request, res: Response) => {
  const { qid, status, solvedIndependently } = req.body;
  const uid = (req as any).user.userId;

  try {
    const currentProgress = await pool.query(`
      SELECT rev_interval, success_streak, points
      FROM userprogress
      WHERE uid = $1 AND qid = $2
    `, [uid, qid]);

    let { rev_interval, success_streak, points } = currentProgress.rows[0] || {
      rev_interval: 0,
      success_streak: 0,
      points: 0,
    };

    let nextDays = 0;

    if (status === "learning") {
      nextDays = 1;
      rev_interval = 0;
      success_streak = 0;
    } else if (status === "revise") {
      nextDays = 3;
      if (rev_interval === 0) rev_interval = 1;
      success_streak += 1;
    } else if (status === "done") {
      const intervalMap: Record<number, number> = { 0: 8, 1: 8, 2: 16, 3: 60 };
      nextDays = intervalMap[rev_interval] ?? 60;
      rev_interval += 1;
      success_streak += 1;
    }

    if (success_streak >= 3 && solvedIndependently) {
      points += 10;
    }

    const result = await pool.query(`
      INSERT INTO userprogress (uid, qid, status, rev_interval, next_review_date, success_streak, points, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_DATE + CAST($5 AS INTEGER), $6, $7, NOW())
        ON CONFLICT (uid, qid)
      DO UPDATE SET
        status           = EXCLUDED.status,
                   rev_interval     = EXCLUDED.rev_interval,
                   next_review_date = CURRENT_DATE + CAST($5 AS INTEGER),
                   success_streak   = EXCLUDED.success_streak,
                   points           = EXCLUDED.points,
                   updated_at       = NOW()
                   RETURNING *
    `, [uid, qid, status, rev_interval, nextDays, success_streak, points]);

    res.status(200).json({
      message: "Planner updated",
      nextReview: result.rows[0].next_review_date,
      award: success_streak >= 3 ? "🏆 Consistent Achiever" : null,
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).json({ error: "Logic Engine Error" });
  }
};