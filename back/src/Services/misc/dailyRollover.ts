import { pool } from "../../dbSchema/connect.js";

/**
 * DAILY ROLLOVER LOGIC
 *
 * 1. Yesterday's "today question" → DAILY revision
 * 2. Assign ONE new today question per user (same topic)
 *
 * Uses `assigned_date` as the source of truth
 */
export const runDailyRollover = async () => {
  const client = await pool.connect();

  try {
    console.log("[ROLLOVER] Starting daily rollover");

    await client.query("BEGIN");

    /**
     * STEP 1: Move yesterday's Today Question → Daily Revision
     */
    const moveToDailyRevision = `
      UPDATE userprogress
      SET revision_cycle = 'daily'
      WHERE assigned_date <= CURRENT_DATE
        AND revision_cycle = 'none'
    `;
    await client.query(moveToDailyRevision);

    /**
     * STEP 2: Assign NEW Today Question
     *
     * For each user who had a question yesterday,
     * assign ONE new question from the same pattern
     */
    const assignNewTodayQuestion = `
      INSERT INTO userprogress (uid, qid, status, revision_cycle, assigned_date)
      SELECT
        up.uid,
        q.qid,
        'learning',
        'none',
        CURRENT_DATE
      FROM userprogress up
      JOIN questions prev_q ON prev_q.qid = up.qid
      JOIN questions q ON q.qpattern = prev_q.qpattern
      WHERE up.assigned_date = CURRENT_DATE - INTERVAL '1 day'
        AND up.revision_cycle = 'daily'
        AND NOT EXISTS (
          SELECT 1
          FROM userprogress u2
          WHERE u2.uid = up.uid
            AND u2.assigned_date = CURRENT_DATE
        )
        AND NOT EXISTS (
          SELECT 1
          FROM userprogress u3
          WHERE u3.uid = up.uid
            AND u3.qid = q.qid
            AND u3.status = 'done'
        )
      ORDER BY q.qid
      LIMIT 1
    `;
    await client.query(assignNewTodayQuestion);

    await client.query("COMMIT");

    console.log("[ROLLOVER] Daily rollover completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[ROLLOVER] Failed:", err);
  } finally {
    client.release();
  }
};
