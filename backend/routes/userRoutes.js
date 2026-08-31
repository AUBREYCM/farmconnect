const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getPlatformStats,
  activateFarmer,
  switchMode,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, restrictTo("admin"), getAllUsers);
router.get("/stats", protect, restrictTo("admin"), getPlatformStats);
router.post("/activate-farmer", protect, activateFarmer);
router.put("/switch-mode", protect, switchMode);

module.exports = router;
