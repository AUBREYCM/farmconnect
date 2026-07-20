const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Route Files
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Basic Test Route
app.get("/", (req, res) => {
  res.send("FarmConnect Backend is running smoothly!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server spinning up on port ${PORT}`);
});
