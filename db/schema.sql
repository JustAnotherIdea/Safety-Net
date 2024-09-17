CREATE SEQUENCE resource_id_seq;
CREATE EXTENSION cube;
CREATE EXTENSION earthdistance;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100),
  place_id VARCHAR(255),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  image_url VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone_number VARCHAR(15),
  vacancies INT DEFAULT 0,
  hours JSONB,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  user_id INT REFERENCES users(id),
  place_id VARCHAR(255),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_location ON resources USING GIST (ll_to_earth(latitude, longitude));

CREATE TABLE moderated_resources (
  id INT DEFAULT nextval('resource_id_seq') PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  image_url VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone_number VARCHAR(15),
  vacancies INT DEFAULT 0,
  hours JSONB,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  user_id INT REFERENCES users(id),
  place_id VARCHAR(255),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Insert seed data into users table
INSERT INTO users (name, email, password, role, place_id, latitude, longitude) VALUES
  ('John Doe', 'john@example.com', 'password123', 'user', 'ChIJx1', 37.7749, -122.4194),
  ('Jane Smith', 'jane@example.com', 'password123', 'admin', 'ChIJx1', 37.7749, -122.4194);

-- Insert seed data into resources table
INSERT INTO resources (name, category, url, image_url, location, description, phone_number, vacancies, hours, rating, user_id, place_id, latitude, longitude) VALUES
  ('Food Bank', 'Food', 'http://example.com/foodbank', 'http://example.com/foodbank.jpg', '123 Main St', 'Provides free food to those in need', '555-1234', 0, '9 AM - 5 PM', 4.5, 1, 'ChIJx1', 37.7749, -122.4194),
  ('Homeless Shelter', 'Housing', 'http://example.com/shelter', 'http://example.com/shelter.jpg', '456 Elm St', 'Provides shelter to homeless individuals', '555-5678', 10, '24/7', 4.8, 2, 'ChIJx2', 37.7740, -122.4319);

-- Insert seed data into moderated_resources table
INSERT INTO moderated_resources (name, category, url, image_url, location, description, phone_number, vacancies, hours, rating, user_id, place_id, latitude, longitude) VALUES
  ('Community Center', 'Community', 'http://example.com/communitycenter', 'http://example.com/communitycenter.jpg', '789 Pine St', 'Provides various community services', '555-9876', 5, '10 AM - 6 PM', 4.2, 1, 'ChIJx3', 37.7750, -122.4183);