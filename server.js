const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';
const REFRESH_SECRET_KEY = 'your_refresh_secret_key'; // Use a separate secret for refresh tokens

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(cookieParser());

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

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Server error');
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
    res.cookie('refresh_token', refreshToken, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).send('Server error');
  }
});

// Refresh Token endpoint
app.post('/api/refresh-token', (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.sendStatus(401); // No token found, unauthorized
  jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token: newAccessToken });
  });
});

// Add resource endpoint
app.post('/api/resources', async (req, res) => {
  const { name, category, location, description, user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO resources (name, category, location, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, location, description, user_id]
    );
    res.json(result.rows[0]); // Return the added resource
  } catch (err) {
    console.error('Error adding resource:', err);
    res.status(500).send('Server error');
  }
});

// Get resource by ID
app.get('/api/resources/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Resource not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).send('Server error');
  }
});

// Get resources for the logged-in user
app.get('/api/user/resources', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;
    const results = await pool.query('SELECT * FROM resources WHERE user_id = $1', [userId]);
    res.json(results.rows);
  } catch (err) {
    console.error('Error fetching user resources:', err);
    res.status(400).send('Invalid token');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
