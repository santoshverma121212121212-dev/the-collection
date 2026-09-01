import { db, initDatabase } from '../src/server/db';
import { hashPassword } from '../src/server/auth';

async function runSeed() {
  await initDatabase();

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@luxora.in';
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || 'LuxoraAdmin@2026!';
  const role = process.env.ADMIN_ROLE || 'super_admin';

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);

  console.log(`[LUXORA ADMIN SEED] Creating or updating administrator: ${username} (${email}) ...`);

  const existing = await db.queryOne<{ id: number }>(
    'SELECT id FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?',
    [username.toLowerCase(), email.toLowerCase()]
  );

  if (existing) {
    await db.execute(
      `UPDATE admins 
       SET password_hash = ?, role = ?, is_active = 1, updated_at = ?
       WHERE id = ?`,
      [passwordHash, role, now, existing.id]
    );
    console.log(`[LUXORA ADMIN SEED] Successfully updated password and role for administrator ID ${existing.id}.`);
  } else {
    await db.execute(
      `INSERT INTO admins (username, email, password_hash, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash, role, now, now]
    );
    console.log(`[LUXORA ADMIN SEED] Successfully created new administrator "${username}".`);
  }

  console.log('[LUXORA ADMIN SEED] Setup completed.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[LUXORA ADMIN SEED ERROR]:', err);
  process.exit(1);
});
