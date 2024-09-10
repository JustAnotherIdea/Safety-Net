
const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create the database if it doesn't exist
const client = new Client({
  user: 'Noah',
  host: 'localhost',
  password: 'cxyzCepTshQDGkLZWYwsPExCjQ7nQuRx',
  port: 5432,
});

client.connect();
client.query('CREATE DATABASE resourcefinder', (err, res) => {
  if (err) {
    if (err.code !== '42P04') {  // '42P04' is the error code for 'database already exists'
      console.error('Error creating database', err.stack);
    }
  } else {
    console.log('Database created successfully');
  }
  client.end();
  
  // Connect to the new database and create the schema
  const pool = new Pool({
    user: 'Noah',
    host: 'localhost',
    database: 'resourcefinder',
    password: 'cxyzCepTshQDGkLZWYwsPExCjQ7nQuRx',
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
