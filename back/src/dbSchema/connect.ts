import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DATABASE_URL ? {
        ssl: { rejectUnauthorized: false }
    } : {}),
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
});

export const connectDB = async () => {
    return await pool.connect();
};