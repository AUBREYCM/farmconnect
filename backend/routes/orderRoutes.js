const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Buyer routes
router.post("/", protect, restrictTo("buyer"), placeOrder);
router.get("/my-orders", protect, restrictTo("buyer"), getMyOrders);

// Farmer routes
router.get("/farmer-orders", protect, restrictTo("farmer"), getFarmerOrders);

// Admin routes
router.get("/", protect, restrictTo("admin"), getAllOrders);

module.exports = router;
