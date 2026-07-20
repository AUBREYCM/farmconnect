const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

// Helper to generate a token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
      [username, email, hashedPassword, role],
    );

    const user = newUser.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Server Error during registration" });
  }
};

// @desc    Authenticate a user & log in
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error during login" });
  }
};

// 🔽 ADDED: Get current logged in user profile details 🔽
// @desc    Get current logged in user profile details
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // req.user.id is attached by your protect middleware from the JWT token
    const userResult = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [req.user.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // changed 'username' to 'name' here so the frontend's {user.name} works instantly!
    res.status(200).json({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error fetching profile details" });
  }
};
// @desc    Get all users (admin only)
// @route   GET /api/users/all
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.status(200).json(users.rows);
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
};
// @desc    Get platform stats (admin only)
// @route   GET /api/users/stats
// @access  Admin only
const getPlatformStats = async (req, res) => {
  try {
    const [usersCount, ordersCount, productsCount, revenueResult] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM orders"),
        pool.query("SELECT COUNT(*) FROM products"),
        pool.query("SELECT SUM(total_price) FROM orders"),
      ]);

    res.status(200).json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      totalProducts: parseInt(productsCount.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].sum || 0),
    });
  } catch (error) {
    console.error("Get Stats Error:", error.message);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};
// 🔽 UPDATED: Included getUserProfile and getAllUsers in exports 🔽
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getPlatformStats,
};
