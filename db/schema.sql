
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100)
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100),
  category VARCHAR(50),
  location VARCHAR(100),
  description TEXT
);

INSERT INTO users (name, email, password) VALUES
  ('John Doe', 'john@example.com', 'password123'),
  ('Jane Smith', 'jane@example.com', 'password123');

INSERT INTO resources (user_id, name, category, location, description) VALUES
  (1, 'Food Bank', 'Food', '123 Main St', 'Provides free food to those in need'),
  (2, 'Shelter', 'Housing', '456 Elm St', 'Provides shelter to homeless individuals');
