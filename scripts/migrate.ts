import { migrate } from "drizzle-orm/libsql/migrator";
import { client, databaseUrl, db } from "../src/db";

await migrate(db, { migrationsFolder: "./drizzle" });
client.close();
console.log(`Database is up to date (${databaseUrl.startsWith("file:") ? databaseUrl : "remote"}).`);
