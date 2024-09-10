const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'resourcefinder',
  password: 'password',
  port: 5432,
});

async function hashPasswords() {
  try {
    const res = await pool.query('SELECT * FROM users');
    for (const user of res.rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      console.log(`Updated password for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Error updating passwords:', err);
  } finally {
    pool.end();
  }
}

hashPasswords();
