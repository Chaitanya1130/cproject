    import {pool} from "../../dbSchema/connect.js";

    export async function getUserSummary(uid: number) {



    const totalResult = await pool.query(
        `SELECT COUNT(*) as total
        FROM userprogress
        WHERE uid = $1`,
        [uid]
    );

    
    const solvedResult = await pool.query(
        `SELECT COUNT(*) as solved
        FROM userprogress
        WHERE uid = $1 AND status = 'done'`,
        [uid]
    );
    const total = Number(totalResult.rows[0].total);
    const solved = Number(solvedResult.rows[0].solved);

    return {
        total,
        solved,
        notDone: total - solved
    };
    }