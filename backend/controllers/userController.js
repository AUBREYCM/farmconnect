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
  const user_id = req.user.id;

  try {
    const userResult = await pool.query(
      `SELECT id, username, email, role, is_farmer, is_buyer, active_mode, 
              phone, farm_province, main_produce, created_at 
       FROM users WHERE id = $1`,
      [user_id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    res.status(200).json({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      is_farmer: user.is_farmer,
      is_buyer: user.is_buyer,
      active_mode: user.active_mode || "buyer",
      phone: user.phone,
      farm_province: user.farm_province,
      main_produce: user.main_produce,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Server error fetching profile" });
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
// @desc    Activate farmer mode for a user
// @route   POST /api/users/activate-farmer
// @access  Private
const activateFarmer = async (req, res) => {
  const { phone, farm_province, main_produce } = req.body;
  const user_id = req.user.id;

  try {
    if (!phone || !farm_province || !main_produce) {
      return res.status(400).json({
        message: "Please provide phone, province and main produce",
      });
    }

    const updatedUser = await pool.query(
      `UPDATE users 
       SET is_farmer = TRUE, 
           role = 'farmer',
           phone = $1, 
           farm_province = $2, 
           main_produce = $3,
           active_mode = 'farmer'
       WHERE id = $4 
       RETURNING id, username, email, role, is_farmer, is_buyer, active_mode, phone, farm_province, main_produce`,
      [phone, farm_province, main_produce, user_id],
    );

    const user = updatedUser.rows[0];

    res.status(200).json({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      is_farmer: user.is_farmer,
      is_buyer: user.is_buyer,
      active_mode: user.active_mode,
      phone: user.phone,
      farm_province: user.farm_province,
      main_produce: user.main_produce,
      message: "Farmer mode activated successfully!",
    });
  } catch (error) {
    console.error("Activate Farmer Error:", error.message);
    res.status(500).json({ message: "Server error activating farmer mode" });
  }
};

// @desc    Switch active mode (buyer/farmer)
// @route   PUT /api/users/switch-mode
// @access  Private
const switchMode = async (req, res) => {
  const { mode } = req.body;
  const user_id = req.user.id;

  try {
    if (!mode || !["buyer", "farmer"].includes(mode)) {
      return res
        .status(400)
        .json({ message: "Invalid mode. Use 'buyer' or 'farmer'" });
    }

    // Check if user has farmer access when switching to farmer
    if (mode === "farmer") {
      const userCheck = await pool.query(
        "SELECT is_farmer FROM users WHERE id = $1",
        [user_id],
      );
      if (!userCheck.rows[0].is_farmer) {
        return res.status(403).json({
          message: "You need to activate farmer mode first",
        });
      }
    }

    const updatedUser = await pool.query(
      `UPDATE users SET active_mode = $1 WHERE id = $2 
       RETURNING id, username, email, role, is_farmer, is_buyer, active_mode`,
      [mode, user_id],
    );

    const user = updatedUser.rows[0];

    res.status(200).json({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      is_farmer: user.is_farmer,
      is_buyer: user.is_buyer,
      active_mode: user.active_mode,
      message: `Switched to ${mode} mode`,
    });
  } catch (error) {
    console.error("Switch Mode Error:", error.message);
    res.status(500).json({ message: "Server error switching mode" });
  }
};
// 🔽 UPDATED: Included getUserProfile and getAllUsers in exports 🔽
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getPlatformStats,
  activateFarmer,
  switchMode,
};
