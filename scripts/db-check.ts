import { client, databaseUrl } from "../src/db";

console.log("connected to:", databaseUrl);
for (const t of ["profile", "experience", "projects", "skills", "education", "links", "login_attempts"]) {
  const r = await client.execute("select count(*) c from " + t);
  console.log("  " + t.padEnd(16), r.rows[0].c);
}
const p = await client.execute("select name, headline, location, resume_url from profile");
console.log("  profile:", JSON.stringify(p.rows[0]));
const e = await client.execute("select role, company from experience order by sort_order");
console.log("  experience:", e.rows.map((r) => r.role + " @ " + r.company).join(" | "));
const s = await client.execute("select count(*) c from skills where category = 'Programming Languages'");
console.log("  language skills:", s.rows[0].c);
client.close();
