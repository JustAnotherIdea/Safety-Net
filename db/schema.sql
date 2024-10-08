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
  subcategory VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  image_url TEXT,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone_number VARCHAR(30),
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
  subcategory VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  image_url TEXT,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone_number VARCHAR(30),
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
