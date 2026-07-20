CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    company_ref VARCHAR(50) UNIQUE NOT NULL,
    trans_token VARCHAR(100),
    trans_ref VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZMW',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    payment_method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);CREATE DATABASE farmconnect;CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);INSERT INTO users (username, email, password_hash, role) VALUES
('alice_farm', 'alice@example.com', 'hashed_password_123', 'farmer'),
('bob_buyer', 'bob@example.com', 'hashed_password_456', 'buyer'),
('admin_charlie', 'charlie@farmconnect.com', 'hashed_password_789', 'admin');CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    company_ref VARCHAR(50) UNIQUE NOT NULL,
    trans_token VARCHAR(100),
    trans_ref VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZMW',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    payment_method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);