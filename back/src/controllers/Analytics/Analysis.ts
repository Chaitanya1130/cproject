import { pool } from "../../dbSchema/connect.js";
import { type Request, type Response } from "express";

export const getAnalytics = async (req: Request, res: Response) => {
    const uid = (req as any).user.userId;

    try {
        const [summaryRes, activityRes, timelineRes, topicsRes] = await Promise.all([

            /* ---- SUMMARY ---- */
            pool.query(`
                SELECT
                    COUNT(*) FILTER (WHERE status = 'done')                       AS "totalSolved",
                    COUNT(*) FILTER (WHERE status IN ('learning','revise','done')) AS "totalReviews",

          /* current streak */
                    (
                        WITH daily AS (
                            SELECT DISTINCT DATE(updated_at) AS day
                FROM userprogress
                WHERE uid = $1
                    ),
                    numbered AS (
                SELECT day,
                    day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
                FROM daily
                    )
                SELECT COALESCE(MAX(cnt), 0) FROM (
                                                      SELECT COUNT(*) AS cnt, grp
                                                      FROM numbered
                                                      WHERE grp >= (
                                                                       SELECT day - (ROW_NUMBER() OVER (ORDER BY day))::int
                                                      FROM numbered
                                                      WHERE day <= CURRENT_DATE
                                                      ORDER BY day DESC
                                                          LIMIT 1
                                                  )
                GROUP BY grp
                HAVING MAX(day) >= CURRENT_DATE - 1
                    ) t
          ) AS "currentStreak",

          /* longest streak */
          (
                WITH daily AS (
                    SELECT DISTINCT DATE(updated_at) AS day
                    FROM userprogress
                    WHERE uid = $1
                    ),
                    numbered AS (
                    SELECT day,
                    day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
                    FROM daily
                    )
                SELECT COALESCE(MAX(cnt), 0) FROM (
                    SELECT COUNT(*) AS cnt FROM numbered GROUP BY grp
                    ) t
                    ) AS "longestStreak"

                FROM userprogress
                WHERE uid = $1
            `, [uid]),

            /* ---- ACTIVITY: last 365 days ---- */
            pool.query(`
                WITH date_series AS (
                    SELECT generate_series(
                                           CURRENT_DATE - INTERVAL '364 days',
                                           CURRENT_DATE,
                                           INTERVAL '1 day'
                           )::date AS day
                    ),
                    daily_counts AS (
                SELECT DATE(updated_at) AS day, COUNT(*) AS count
                FROM userprogress
                WHERE uid = $1
                  AND updated_at >= CURRENT_DATE - INTERVAL '364 days'
                GROUP BY DATE(updated_at)
                    )
                SELECT
                    ds.day::text            AS date,
          COALESCE(dc.count, 0)::int AS count
                FROM date_series ds
                    LEFT JOIN daily_counts dc ON ds.day = dc.day
                ORDER BY ds.day ASC
            `, [uid]),

            /* ---- TIMELINE: last 7 months ---- */
            pool.query(`
                WITH months AS (
                    SELECT generate_series(
                                   DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months'),
                                   DATE_TRUNC('month', CURRENT_DATE),
                                   INTERVAL '1 month'
                           )::date AS month_start
                )
                SELECT
                    TO_CHAR(m.month_start, 'Mon') AS date,
          COUNT(*) FILTER (
            WHERE u.status = 'done'
              AND DATE_TRUNC('month', u.updated_at) = m.month_start
          )::int AS completed,
          COUNT(*) FILTER (
            WHERE u.status IN ('learning','revise','done')
              AND DATE_TRUNC('month', u.updated_at) = m.month_start
          )::int AS reviewed
                FROM months m
                    LEFT JOIN userprogress u
                ON u.uid = $1
                GROUP BY m.month_start
                ORDER BY m.month_start ASC
            `, [uid]),

            /* ---- TOPICS ---- */
            pool.query(`
                SELECT
                    q.qpattern AS topic,
                    COUNT(*) FILTER (WHERE u.status = 'done')::int     AS done,
                    COUNT(*) FILTER (WHERE u.status = 'revise')::int   AS revise,
                    COUNT(*) FILTER (WHERE u.status = 'learning')::int AS learning
                FROM userprogress u
                         JOIN questions q ON q.qid = u.qid
                WHERE u.uid = $1
                  AND q.qpattern IS NOT NULL
                GROUP BY q.qpattern
                ORDER BY
                    COUNT(*) FILTER (WHERE u.status = 'done') +
          COUNT(*) FILTER (WHERE u.status = 'revise') +
          COUNT(*) FILTER (WHERE u.status = 'learning') DESC
            `, [uid]),

        ]);

        const s = summaryRes.rows[0];

        res.json({
            summary: {
                totalSolved:   parseInt(s.totalSolved)   || 0,
                currentStreak: parseInt(s.currentStreak) || 0,
                longestStreak: parseInt(s.longestStreak) || 0,
                totalReviews:  parseInt(s.totalReviews)  || 0,
            },
            activity: activityRes.rows,
            timeline: timelineRes.rows,
            topics:   topicsRes.rows,
        });

    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Server error" });
    }
};