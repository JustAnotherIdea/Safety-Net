
const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create the database if it doesn't exist
const client = new Client({
  user: 'Noah',
  host: 'localhost',
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

  // Connect to the new database and create the schema
  const pool = new Pool({
    user: 'Noah',
    host: 'localhost',
    database: 'resourcefinder',
    password: 'password',
    port: 5432,
  });

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  pool.query(schema, (err, res) => {
    if (err) {
      console.error('Error executing schema', err.stack);
    } else {
      console.log('Database schema created successfully');
    }
    pool.end();
  });
});
