import fs from "fs";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "projectDB",
  password: "Chaitanya@1130",
  port: 5432
});

const questions = JSON.parse(
  fs.readFileSync("questions.json", "utf-8")
);

async function seed() {
  for (const q of questions) {
  if (!q.qname || !q.link) continue;

  await pool.query(
    `INSERT INTO QUESTIONS (qname, qpattern, link)
     VALUES ($1, $2, $3)
     ON CONFLICT (qname) DO NOTHING`,
    [q.qname.trim(), q.qpattern, q.link]
  );
}


  console.log("Questions seeded successfully");
  pool.end();
}

seed();
