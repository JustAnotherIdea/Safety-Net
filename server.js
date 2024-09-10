const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'resourcefinder',
  password: 'password',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Search endpoint
app.get('/api/resources', async (req, res) => {
  const { query } = req.query;
  console.log('Received query:', query);
  try {
    const results = await pool.query(
      `SELECT * FROM resources WHERE name ILIKE $1 OR description ILIKE $1`,
      [`%${query}%`]
    );
    console.log('Results:', results.rows);
    res.json(results.rows);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
