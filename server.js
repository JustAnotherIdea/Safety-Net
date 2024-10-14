const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { Pool } = require('pg');
const { Client } = require('@googlemaps/google-maps-services-js');
const multer = require('multer');
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Configure the AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, // Replace with your actual access ke
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Replace with your actual secretkey
  region: 'us-east-1' // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

const googleClient = new Client();

const googleAPIKey = process.env.GOOGLE_MAPS_API_KEY;

const app = express();
const port = process.env.PORT;
const SECRET_KEY = 'your_secret_key';
const REFRESH_SECRET_KEY = 'your_refresh_secret_key';

app.use(bodyParser.json());

const allowList = ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.0.100:3001', 'http://192.168.0.100:3000', 'http://100.96.60.109:3000', 'http://100.96.60.109:3001'];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (allowList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: req.header('Origin'), credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
}
//app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
//app.use(cors({ origin: 'http://192.168.0.100:3001', credentials: true }));
app.use(cors(corsOptionsDelegate));
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

// Search endpoint
app.get('/api/resources', cors(corsOptionsDelegate), async (req, res) => {
  const { query, category, subcategory, page = 1, limit = 10, latitude, longitude, maxDistance } = req.query;

  const radius = Number(maxDistance) || 50;  // Default max distance is 50 miles
  const searchQuery = query ? `%%${query}%%` : '%%';  // Escape the query for SQL injection
  const queryParams = [];
  let paramIndex = 1;  // Initialize parameter index

  // console.log(latitude, longitude, maxDistance);

  const latitudeNum = Number(latitude);  // Cast latitude to a number
  const longitudeNum = Number(longitude);  // Cast longitude to a number

  if (query && typeof query !== 'string') {
    return res.status(401).send('Query must be a string');
  }
  
  if (category && typeof category !== 'string') {
    return res.status(401).send('Category must be a string');
  }
  
  if (isNaN(latitudeNum) || isNaN(longitudeNum)) {
    return res.status(401).send('Latitude and longitude must be valid numbers');
  }
  
  if (isNaN(radius)) {
    return res.status(401).send('Max distance must be a valid number');
  }
  
  console.log('Received Query Params:', req.query);
  console.log('Parsed Values - Lat:', latitudeNum, 'Lng:', longitudeNum, 'MaxDistance:', radius);


  let sqlQuery = `SELECT *`;

  // If latitude and longitude are provided, calculate distance in miles
  if (latitudeNum && longitudeNum) {
    sqlQuery += `, (earth_distance(ll_to_earth($${paramIndex}, $${paramIndex + 1}), ll_to_earth(latitude, longitude)) / 1609.34) AS distance_miles`;
    queryParams.push(latitudeNum, longitudeNum);  // Push as numbers
    paramIndex += 2;  // Increment the index by 2 for latitude and longitude
  }

  sqlQuery += ` FROM resources WHERE (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
  queryParams.push(searchQuery);
  paramIndex++;  // Increment after adding search query

  // If latitude and longitude are provided, add distance filtering
  if (latitudeNum && longitudeNum) {
    sqlQuery += ` AND earth_box(ll_to_earth($${paramIndex - 3}, $${paramIndex - 2}), $${paramIndex} * 1609.34) @> ll_to_earth(latitude, longitude)
                  AND earth_distance(ll_to_earth($${paramIndex - 3}, $${paramIndex - 2}), ll_to_earth(latitude, longitude)) <= $${paramIndex} * 1609.34`;
    queryParams.push(radius);
    paramIndex++;  // Increment after adding radius
  }

  // If category is provided, add it as a filter
  if (category && category !== '') {
    sqlQuery += ` AND category = $${paramIndex}`;
    queryParams.push(category);
    paramIndex++;  // Increment after adding category
  }

  // Filter by subcategory
  if (subcategory && subcategory !== '') {
    console.log("subcategory", subcategory);
    sqlQuery += ` AND subcategory = $${paramIndex}`;
    queryParams.push(subcategory);
    paramIndex++;
  }

  if (latitudeNum && longitudeNum) {
    sqlQuery += ` ORDER BY distance_miles`;
  }

  // Add pagination and ordering by distance
  const offset = (page - 1) * limit;
  sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  // Debugging: Log SQL query and parameters
  console.log('SQL Query:', sqlQuery);
  console.log('Query Parameters:', queryParams);

  try {
    const results = await pool.query(sqlQuery, queryParams);
    console.log('Query Results:', results.rows);
    res.json(results.rows); // Return the results
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).send('Server error');
  }
});

// Get resource by ID
app.get('/api/resources/:id', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;
  try {
    let result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM moderated_resources WHERE id = $1', [id]);
    }
    if (result.rows.length === 0) {
      return res.status(404).send('Resource not found');
    }
    res.json(result.rows[0]);
    //console.log(result.rows[0]);
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).send('Server error');
  }
});

// Get resources for the logged-in user
app.get('/api/user/resources', cors(corsOptionsDelegate), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;
    const results = await pool.query(`SELECT id FROM moderated_resources WHERE user_id = $1 AND status != 'approved'
      UNION SELECT id FROM resources WHERE user_id = $1`, [userId]);
    res.json(results.rows);
    //console.log(results.rows);
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.sendStatus(401); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error fetching user resources:', err);
    res.status(400).send('Invalid token');
  }
});

// Place autocomplete endpoint
app.get('/api/places/autocomplete', cors(corsOptionsDelegate), async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.status(400).send('Input is required');
  }
  const args = {
    params: {
      key: googleAPIKey,
      input: input,
    }
  };

  googleClient.placeQueryAutocomplete(args).then(APIres => {
    res.json(APIres.data.predictions);
  }).catch(error => {
    console.error('Error fetching places autocomplete:', error);
    res.status(500).send('Server error');
  });
});

// Place details endpoint
app.get('/api/places/location', cors(corsOptionsDelegate), async (req, res) => {
  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).send('Place ID is required');
  }

  const args = {
    params: {
      key: googleAPIKey,
      place_id: place_id,
    }
  };

  googleClient.placeDetails(args).then(async APIres => {
    //console.log("place details", APIres.data.result);
    const locationDetails = {
      address: APIres.data.result.formatted_address,
      lat: APIres.data.result.geometry.location.lat,
      lng: APIres.data.result.geometry.location.lng
    }

    if (APIres.data.result.opening_hours) {
      locationDetails.opening_hours = APIres.data.result.opening_hours;
    }

    if (APIres.data.result.website) {
      locationDetails.website = APIres.data.result.website;
    }

    if (APIres.data.result.international_phone_number) {
      locationDetails.international_phone_number = APIres.data.result.international_phone_number;
    }

    if (APIres.data.result.name) {
      locationDetails.name = APIres.data.result.name;
    }

    if (APIres.data.result.photos && APIres.data.result.photos.length > 0) {
      const photoReference = APIres.data.result.photos[0].photo_reference;
      const imageRequestUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleAPIKey}`;

      try {
        const imageResponse = await axios.get(imageRequestUrl);
        const redirectedUrl = imageResponse.request.res.responseUrl;
        //console.log("redirected url", redirectedUrl);
        res.json({ ...locationDetails, image: redirectedUrl });
      } catch (error) {
        console.error('Error fetching place image:', error);
        res.status(500).send('Server error');
      }
    } else {
      res.json(locationDetails);
    }
  }).catch(error => {
    console.error('Error fetching places details:', error);
    res.status(500).send('Server error');
  });
});

// User registration
app.post('/api/register', cors(corsOptionsDelegate), async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    const user = result.rows[0]; 
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Server error');
  }
});

// User login
app.post('/api/login', cors(corsOptionsDelegate), async (req, res) => {
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
    const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
    const cookie = req.cookies['refresh_token'];
    console.log("cookie", cookie);
    console.log("refresh token", refreshToken);
    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).send('Server error');
  }
});

//User logout
app.post('/api/logout', cors(corsOptionsDelegate), (req, res) => {
  res.clearCookie('refresh_token');
  res.sendStatus(204);
});

// Refresh Token endpoint
app.post('/api/refresh-token', cors(corsOptionsDelegate), (req, res) => {
  const token = req.cookies.refresh_token;
  console.log("refresh token", token);
  if (!token) return res.sendStatus(401); // No token found, unauthorized
  jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token: newAccessToken });
    console.log("user", user);
    console.log("new access token", newAccessToken);
  });
});

// Add resource endpoint
app.post('/api/resources', cors(corsOptionsDelegate), async (req, res) => {
  const { name, category, url, image_url, location, description, user_id, phone_number, vacancies = 0, hours, lat, lng, place_id } = req.body;

  //console.log("lat", lat);
  //console.log("lng", lng);
  
  // Verify Authorization Token
  const token = req.headers['authorization']?.split(' ')[1];
  // console.log("token", token);
  if (!token) return res.status(401).send('Access denied');
  
  try {
    const result = await pool.query(
      'INSERT INTO moderated_resources (name, category, url, image_url, location, description, user_id, phone_number, vacancies, hours, latitude, longitude, place_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [name, category, url, image_url, location, description, user_id, phone_number, vacancies, JSON.stringify(hours), lat, lng, place_id]
    );
    res.json(result.rows[0]); // Return the added resource for moderation
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error adding resource:', err);
    res.status(500).send('Server error');
  }
});

// Update resource endpoint
app.put('/api/resources/:id', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;
  const { name, category, url, image_url, location, description, phone_number, vacancies, hours } = req.body;

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    const resourceCheck = await pool.query('SELECT * FROM moderated_resources WHERE id = $1 AND user_id = $2', [id, userId]);
    if (resourceCheck.rows.length === 0) {
      return res.status(403).send('You are not authorized to update this resource'); // Forbidden
    }

    const result = await pool.query(
      'UPDATE moderated_resources SET name = $1, category = $2, url = $3, image_url = $4, location = $5, description = $6, phone_number = $7, vacancies = $8, hours = $9 WHERE id = $10 RETURNING *',
      [name, category, url, image_url, location, description, phone_number, vacancies, JSON.stringify(hours), id, userId] //NEED TO FIX
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Resource not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error updating resource:', err);
    res.status(500).send('Server error');
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('file'), cors(corsOptionsDelegate), async (req, res) => {
  const { fileNameReq, fileTypeReq } = req.body;

  // console.log("request", req);

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
  const file = req.file; // The uploaded file information
  const fileType = file.mimetype;
  const fileName = file.originalname;
  const validFileSize = file.size; // File size in bytes

  // console.log('File received:', file); // For debugging

  // console.log("file type", fileType);
  // Check if file type matches and size is within the limit
  if (fileType && fileType.match(/image\/(jpeg|jpg|png|gif)/)) {
    if (validFileSize > MAX_SIZE) {
      return res.status(400).send('File size exceeds the allowed limit of 5MB.');
    }
  } else {
    return res.status(400).send('Invalid file type.');
  }

  const s3Params = {
    Bucket: 'safety-net-images', // Replace with your bucket name
    Key: fileNameReq, // File name you want to save as
    Expires: 60, // Time in seconds for the signed URL to remain valid
    ContentType: fileTypeReq, // The content type of the file
    ACL: 'public-read' // Makes the uploaded file publicly readable
  };

  // Create a signed URL for uploading
  s3.getSignedUrl('putObject', s3Params, (err, url) => {
    if (err) {
      console.error('Error getting signed URL:', err);
      return res.status(500).send('Error getting signed URL');
    }
    res.json({ url }); // Send the signed URL back to the client
  });
});

// Get all moderated resources
app.get('/api/moderated-resources', cors(corsOptionsDelegate), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  const { query, category, subcategory, page = 1, limit = 10, latitude, longitude, maxDistance, status = 'pending' } = req.query;

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check user's role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || !['admin', 'moderator'].includes(userResult.rows[0].role)) {
      return res.status(403).send('You are not a moderator'); // Forbidden
    }

    const radius = Number(maxDistance) || 50;  // Default max distance is 50 miles
    const searchQuery = query ? `%%${query}%%` : '%%';  // Escape the query for SQL injection
    const queryParams = [];
    let paramIndex = 1;  // Initialize parameter index

    const latitudeNum = Number(latitude);
    const longitudeNum = Number(longitude);

    let sqlQuery = `SELECT *`;

    // If latitude and longitude are provided, calculate distance in miles
    if (latitudeNum && longitudeNum) {
      sqlQuery += `, (earth_distance(ll_to_earth($${paramIndex}, $${paramIndex + 1}), ll_to_earth(latitude, longitude)) / 1609.34) AS distance_miles`;
      queryParams.push(latitudeNum, longitudeNum);
      paramIndex += 2;
    }

    sqlQuery += ` FROM moderated_resources WHERE status = $${paramIndex} AND (name ILIKE $${paramIndex + 1} OR description ILIKE $${paramIndex + 1})`;
    queryParams.push(status, searchQuery);
    paramIndex += 2;

    // If latitude and longitude are provided, add distance filtering
    if (latitudeNum && longitudeNum) {
      sqlQuery += ` AND earth_box(ll_to_earth($${paramIndex - 4}, $${paramIndex - 3}), $${paramIndex} * 1609.34) @> ll_to_earth(latitude, longitude)
                    AND earth_distance(ll_to_earth($${paramIndex - 4}, $${paramIndex - 3}), ll_to_earth(latitude, longitude)) <= $${paramIndex} * 1609.34`;
      queryParams.push(radius);
      paramIndex++;
    }

    // If category is provided, add it as a filter
    if (category && category !== '') {
      sqlQuery += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Filter by subcategory
    if (subcategory && subcategory !== '') {
      sqlQuery += ` AND subcategory = $${paramIndex}`;
      queryParams.push(subcategory);
      paramIndex++;
    }

    if (latitudeNum && longitudeNum) {
      sqlQuery += ` ORDER BY distance_miles`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    console.log('SQL Query:', sqlQuery);
    console.log('Query Parameters:', queryParams);

    const results = await pool.query(sqlQuery, queryParams);

    console.log('Query Results length:', results.rows.length);
    
    res.json(results.rows);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token');
    }
    console.error('Error fetching moderated resources:', err);
    res.status(500).send('Server error');
  }
});

// Approve resource endpoint
app.put('/api/moderated-resources/:id/approve', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check user's role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || !['admin', 'moderator'].includes(userResult.rows[0].role)) {
      return res.status(403).send('You are not authorized to approve resources'); // Forbidden
    }

    const result = await pool.query('SELECT * FROM moderated_resources WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Resource not found');
    }

    const { name, category, subcategory, url, image_url, location, description, user_id, phone_number, vacancies, hours, latitude, longitude, place_id } = result.rows[0];
    console.log("subcategory", subcategory);

    // Insert the resource into the resources table, maintaining the same ID
    await pool.query(
      'INSERT INTO resources (id, name, category, subcategory, url, image_url, location, description, phone_number, vacancies, hours, user_id, status, latitude, longitude, place_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
      [id, name, category, subcategory, url, image_url, location, description, phone_number, vacancies, JSON.stringify(hours), user_id, 'approved', latitude, longitude, place_id]
    );

    // Update moderation status
    await pool.query('UPDATE moderated_resources SET status = $1 WHERE id = $2', ['approved', id]);

    res.sendStatus(204); // No content
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error approving resource:', err);
    res.status(500).send('Server error');
  }
});

//
app.put('')

// Delete resource endpoint
app.delete('/api/moderated-resources/:id', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check user's role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || !['admin', 'moderator'].includes(userResult.rows[0].role)) {
      return res.status(403).send('You are not authorized to delete resources'); // Forbidden
    }
    
    await pool.query('DELETE FROM moderated_resources WHERE id = $1', [id]);
    res.sendStatus(204); // No content
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error rejecting resource:', err);
    res.status(500).send('Server error');
  }
});

// Get all users
app.get('/api/users', cors(corsOptionsDelegate), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check if the user is an admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).send('Access denied: You are not an admin'); // Forbidden
    }

    const results = await pool.query('SELECT id, name, email, role FROM users'); // Select only relevant
    res.json(results.rows); // Return all users
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// Change user role endpoint
app.put('/api/users/:id/role', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body; // Expecting a new role in the request body

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check if current user is an admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).send('You are not authorized to change user roles'); // Forbidden
    }

    // Update user role
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    res.sendStatus(204); // No content
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error changing user role:', err);
    res.status(500).send('Server error');
  }
});

// Delete resource endpoint
app.delete('/api/resources/:id', cors(corsOptionsDelegate), async (req, res) => {
  const { id } = req.params;

  // Verify Authorization Token
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    // Verify and decode the JWT
    const verified = jwt.verify(token, SECRET_KEY);
    const userId = verified.id;

    // Check if the current user is an admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      // Admins can delete any resource
      await pool.query('DELETE FROM resources WHERE id = $1', [id]);
      return res.sendStatus(204);
    }

    // If not an admin, check if the user owns the resource
    const resourceCheck = await pool.query('SELECT * FROM resources WHERE id = $1 AND user_id = $2', [id, userId]);
    if (resourceCheck.rows.length === 0) {
      return res.status(403).send('You are not authorized to delete this resource'); // Forbidden
    }

    // User owns the resource, proceed to delete
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    // Handle JWT verification errors (invalid or expired token)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).send('Invalid or expired token'); // Return 401 Unauthorized
    }
    // Handle any other errors as a server error
    console.error('Error deleting resource:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});