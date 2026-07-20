const { Pool } = require("pg");
require("dotenv").config();

// Initialize the connection pool using environmental variables
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// Simple test query to confirm the connection is active
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err.stack);
  } else {
    console.error("✅ Connected to the farmconnect database successfully!");
  }
});

module.exports = pool;
