const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  paymentCallback,
  paymentRedirect,
} = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Buyer initiates payment for their order
router.post("/initiate", protect, restrictTo("buyer"), initiatePayment);

// DPO calls this server-to-server when payment completes (no auth - DPO doesn't have a token)
router.post("/callback", paymentCallback);

// Buyer's browser lands here after paying on DPO's page
router.get("/redirect", paymentRedirect);

module.exports = router;
