import cron from "node-cron";
import { runDailyRollover } from "./dailyRollover.js";

export const startCronJobs = () => {
  console.log("[CRON] Initializing cron jobs...");
  cron.schedule("* * * * *", async () => {
    console.log("[CRON] Job triggered at", new Date().toISOString());

    try {
      await runDailyRollover();
      console.log("[CRON] Daily rollover completed");
    } catch (err) {
      console.error("[CRON] Error during rollover:", err);
    }
  });
};
