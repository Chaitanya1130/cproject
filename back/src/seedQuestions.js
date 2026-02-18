import fs from "fs";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // This loads your DATABASE_URL from the .env file
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // This is MANDATORY for Neon/Supabase
  }
});

const questions = JSON.parse(
  fs.readFileSync("questions.json", "utf-8")
);

async function seed() {
  try {
    for (const q of questions) {
      if (!q.qname || !q.link) continue;

      await pool.query(
        `INSERT INTO QUESTIONS (qname, qpattern, link)
         VALUES ($1, $2, $3)
         ON CONFLICT (qname) DO NOTHING`,
        [q.qname.trim(), q.qpattern, q.link]
      );
    }
    console.log("Questions seeded successfully to Neon! 🎉");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seed();