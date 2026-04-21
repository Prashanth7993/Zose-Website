import "dotenv/config";
import { DATABASE_PATH, migrateDatabase } from "./db.js";

try {
  const db = await migrateDatabase();
  await db.close();
  console.log(`Database is ready at ${DATABASE_PATH}`);
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
}
