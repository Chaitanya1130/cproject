import fs from "fs/promises";
import path from "path";
import { pool } from "../../dbSchema/connect.js"

const seedDatabase = async () => {
  try {

    const filePath = path.join(process.cwd(), "QuestionLinks.json");

    const data = await fs.readFile(filePath, "utf-8");
    const questions = JSON.parse(data);

    console.log(`Found ${questions.length} questions. Starting seed...`);

    for (const q of questions) {

      if (!q.qname || !q.qpattern || !q.link) {
        console.log("Skipping invalid question:", q);
        continue;
      }

      await pool.query(
        `
        INSERT INTO QUESTIONS 
          (qname, qpattern, link)
        VALUES 
          ($1, $2, $3)
        ON CONFLICT (qname) DO NOTHING
        `,
        [q.qname, q.qpattern, q.link]
      );
    }

    console.log("Seeding completed successfully.");
    process.exit(0);

  } catch (err) {
    console.error(" Seeding failed:", err);
    process.exit(1);
  }
};

seedDatabase();
