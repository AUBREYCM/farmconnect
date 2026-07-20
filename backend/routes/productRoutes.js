const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Public routes (no token needed)
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (token + farmer role required)
router.post("/", protect, restrictTo("farmer"), addProduct);
router.put("/:id", protect, restrictTo("farmer"), updateProduct);
router.delete("/:id", protect, restrictTo("farmer"), deleteProduct);

module.exports = router;
