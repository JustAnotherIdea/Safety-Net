CREATE SEQUENCE resource_id_seq;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100),
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
  hours VARCHAR(50),
  rating DECIMAL(2, 1) DEFAULT 0.0,
  user_id INT REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  hours VARCHAR(50),
  rating DECIMAL(2, 1) DEFAULT 0.0,
  user_id INT REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);