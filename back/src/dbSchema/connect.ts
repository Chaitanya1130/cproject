// back/src/dbSchema/connect.ts
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // It MUST look for this key
  ssl: {
    rejectUnauthorized: false // This is required for Neon
  }
});