import { pool } from "../../dbSchema/connect.js";

export const openQuestionService = async (uid: number, qid: number) => {

  // check if progress row exists
  const check = await pool.query(
    `SELECT * FROM userprogress
     WHERE uid = $1 AND qid = $2`,
    [uid, qid]
  );

  // already exists -increase visited
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

  // first time → create entry
  const insert = await pool.query(
    `INSERT INTO userprogress
      (uid, qid, visited, status, last_opened)
     VALUES
      ($1, $2, 1, 'learning', CURRENT_TIMESTAMP)
     RETURNING *`,
    [uid, qid]
  );

  return insert.rows[0];
};



export const updateStatusService = async (
  uid: number,
  qid: number,
  status: string
) => {

  const result = await pool.query(
    `UPDATE userprogress
     SET status = $1
     WHERE uid = $2 AND qid = $3
     RETURNING *`,
    [status, uid, qid]
  );

  return result.rows[0];
};
