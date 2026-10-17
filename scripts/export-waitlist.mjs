// Usage: cd deployment/vercel-site && npx vercel env pull .env.local && node --env-file=.env.local scripts/export-waitlist.mjs > waitlist.csv
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT email, role, age_group, email_owner, created_at FROM waitlist ORDER BY created_at`;
const esc = v => v == null ? '' : /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
console.log('email,role,age_group,email_owner,created_at');
for (const r of rows) console.log([r.email, r.role, r.age_group, r.email_owner, new Date(r.created_at).toISOString()].map(esc).join(','));
console.error(`${rows.length} signups`);
