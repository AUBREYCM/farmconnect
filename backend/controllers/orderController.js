const pool = require("../config/db");

// @desc    Place an order
// @route   POST /api/orders
// @access  Buyers only
const placeOrder = async (req, res) => {
  const { product_id, quantity } = req.body;
  const buyer_id = req.user.id;

  try {
    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Please provide product ID and quantity" });
    }

    // Check if product exists and has enough stock
    const product = await pool.query("SELECT * FROM products WHERE id = $1", [
      product_id,
    ]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const item = product.rows[0];

    if (item.quantity < quantity) {
      return res.status(400).json({
        message: `Not enough stock. Only ${item.quantity} units available`,
      });
    }

    // Calculate total price
    const total_price = item.price * quantity;

    // Place the order
    const newOrder = await pool.query(
      `INSERT INTO orders (buyer_id, product_id, quantity, total_price) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [buyer_id, product_id, quantity, total_price],
    );

    // Deduct quantity from product stock
    await pool.query(
      "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
      [quantity, product_id],
    );

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder.rows[0],
    });
  } catch (error) {
    console.error("Place Order Error:", error.message);
    res.status(500).json({ message: "Server Error while placing order" });
  }
};

// @desc    Get all orders for the logged in buyer
// @route   GET /api/orders/my-orders
// @access  Buyers only
const getMyOrders = async (req, res) => {
  const buyer_id = req.user.id;

  try {
    const orders = await pool.query(
      `SELECT 
        orders.id AS order_id,
        products.name AS product_name,
        orders.quantity,
        orders.total_price,
        orders.order_date,
        users.username AS farmer_name
       FROM orders
       INNER JOIN products ON orders.product_id = products.id
       INNER JOIN users ON products.farmer_id = users.id
       WHERE orders.buyer_id = $1
       ORDER BY orders.order_date DESC`,
      [buyer_id],
    );

    res.status(200).json(orders.rows);
  } catch (error) {
    console.error("Get My Orders Error:", error.message);
    res.status(500).json({ message: "Server Error while fetching orders" });
  }
};

// @desc    Get all orders for a farmer (orders on their products)
// @route   GET /api/orders/farmer-orders
// @access  Farmers only
const getFarmerOrders = async (req, res) => {
  const farmer_id = req.user.id;

  try {
    const orders = await pool.query(
      `SELECT 
        orders.id AS order_id,
        products.name AS product_name,
        orders.quantity,
        orders.total_price,
        orders.order_date,
        users.username AS buyer_name
       FROM orders
       INNER JOIN products ON orders.product_id = products.id
       INNER JOIN users ON orders.buyer_id = users.id
       WHERE products.farmer_id = $1
       ORDER BY orders.order_date DESC`,
      [farmer_id],
    );

    res.status(200).json(orders.rows);
  } catch (error) {
    console.error("Get Farmer Orders Error:", error.message);
    res
      .status(500)
      .json({ message: "Server Error while fetching farmer orders" });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Admin only
const getAllOrders = async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT 
        orders.id AS order_id,
        buyer.username AS buyer_name,
        products.name AS product_name,
        orders.quantity,
        orders.total_price,
        orders.order_date,
        farmer.username AS farmer_name
       FROM orders
       INNER JOIN users AS buyer ON orders.buyer_id = buyer.id
       INNER JOIN products ON orders.product_id = products.id
       INNER JOIN users AS farmer ON products.farmer_id = farmer.id
       ORDER BY orders.order_date DESC`,
    );

    res.status(200).json(orders.rows);
  } catch (error) {
    console.error("Get All Orders Error:", error.message);
    res.status(500).json({ message: "Server Error while fetching all orders" });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  getAllOrders,
};
