const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getPlatformStats,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, restrictTo("admin"), getAllUsers);
router.get("/stats", protect, restrictTo("admin"), getPlatformStats);

module.exports = router;
