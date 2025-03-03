
const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect to the default database
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
});

client.connect().then(() => {
  return client.query('CREATE DATABASE resourcefinder');
}).catch((err) => {
  if (err.code !== '42P04') {  // '42P04' is the error code for 'database already exists'
    console.error('Error creating database', err.stack);
  }
}).finally(() => {
  client.end();

  // Connect to the new database directly and create the schema
  const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'resourcefinder',
    password: 'password',
    port: 5432,
  });

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  const modifiedSchema = `
  -- Drop existing tables if they exist
  DROP TABLE IF EXISTS resources CASCADE;
  DROP TABLE IF EXISTS moderated_resources CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS favorites CASCADE;
  DROP SEQUENCE IF EXISTS resource_id_seq;
  DROP EXTENSION IF EXISTS earthdistance;
  DROP EXTENSION IF EXISTS cube;
  
  ${schema}
  `;
  
  pool.query(modifiedSchema, (err, res) => {
    if (err) {
      console.error('Error executing schema', err.stack);
    } else {
      console.log('Database schema created successfully');
      hashPasswords();
    }
    pool.end();
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
});
