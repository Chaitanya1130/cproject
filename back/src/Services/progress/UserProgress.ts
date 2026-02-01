import { pool } from "../../dbSchema/connect.js";

export const openQuestionService = async (uid: number, qid: number) => {
  try {
    console.log("openQuestionService called with:", { uid, qid });

    const check = await pool.query(
      `SELECT 1 FROM userprogress WHERE uid = $1 AND qid = $2`,
      [uid, qid]
    );

    if (check.rows.length > 0) {
      const update = await pool.query(
        `UPDATE userprogress
         SET visited = visited + 1,
             last_opened = CURRENT_TIMESTAMP
         WHERE uid = $1 AND qid = $2
         RETURNING *`,
        [uid, qid]
      );
      return update.rows[0];
    }

    const insert = await pool.query(
      `INSERT INTO userprogress (uid, qid, visited, status, last_opened)
       VALUES ($1, $2, 1, 'learning', CURRENT_TIMESTAMP)
       RETURNING *`,
      [uid, qid]
    );

    return insert.rows[0];
  } catch (err) {
    console.error("❌ openQuestionService DB ERROR:", err);
    throw err;
  };

};


// Inside your UserProgress service file
export const updateStatusService = async (
  uid: number,
  qid: number,
  status: string
) => {
  const query = `
    INSERT INTO userprogress (uid, qid, status, visited, last_opened)
    VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
    ON CONFLICT (uid, qid)
    DO UPDATE SET
      status = EXCLUDED.status,
      last_opened = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const result = await pool.query(query, [uid, qid, status]);
  return result.rows[0];
};

