const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  restrictTo("farmer"),
  upload.single("image"),
  uploadImage,
);

module.exports = router;
