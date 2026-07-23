const cloudinary = require("../config/cloudinary");

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private (farmers only)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Convert buffer to base64 and upload to Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "farmconnect/products",
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      image_url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

module.exports = { uploadImage };
