import "dotenv/config";
import { DATABASE_PATH, migrateDatabase, DB_CLIENT } from "./db.js";

try {
  const db = await migrateDatabase();
  // MySQL pool doesn't have a close() method in this setup
  if (typeof db.close === "function") {
    await db.close();
  }
  const location = DB_CLIENT === "mysql" ? "MySQL database" : DATABASE_PATH;
  console.log(`Database is ready at ${location}`);
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
}
