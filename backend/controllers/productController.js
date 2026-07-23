const pool = require("../config/db");

// @desc    Add a new product
// @route   POST /api/products
// @access  Farmers only
const addProduct = async (req, res) => {
  const { name, description, price, quantity, province, district, image_url } =
    req.body;
  const farmer_id = req.user.id;

  try {
    if (!name || !price || !quantity) {
      return res
        .status(400)
        .json({ message: "Please provide name, price and quantity" });
    }

    const newProduct = await pool.query(
      `INSERT INTO products 
       (farmer_id, name, description, price, quantity, province, district, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        farmer_id,
        name,
        description,
        price,
        quantity,
        province || null,
        district || null,
        image_url || null,
      ],
    );

    res.status(201).json(newProduct.rows[0]);
  } catch (error) {
    console.error("Add Product Error:", error.message);
    res.status(500).json({ message: "Server Error while adding product" });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const products = await pool.query(
      `SELECT products.*, users.username AS farmer_name 
       FROM products 
       INNER JOIN users ON products.farmer_id = users.id
       ORDER BY products.created_at DESC`,
    );

    res.status(200).json(products.rows);
  } catch (error) {
    console.error("Get Products Error:", error.message);
    res.status(500).json({ message: "Server Error while fetching products" });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await pool.query(
      `SELECT products.*, users.username AS farmer_name 
       FROM products 
       INNER JOIN users ON products.farmer_id = users.id
       WHERE products.id = $1`,
      [id],
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product.rows[0]);
  } catch (error) {
    console.error("Get Product Error:", error.message);
    res.status(500).json({ message: "Server Error while fetching product" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Farmers only (own products)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;
  const farmer_id = req.user.id;

  try {
    // Make sure the product belongs to this farmer
    const product = await pool.query(
      "SELECT * FROM products WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id],
    );

    if (product.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found or not authorised" });
    }

    const updatedProduct = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, quantity = $4 
       WHERE id = $5 
       RETURNING *`,
      [name, description, price, quantity, id],
    );

    res.status(200).json(updatedProduct.rows[0]);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(500).json({ message: "Server Error while updating product" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Farmers only (own products)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const farmer_id = req.user.id;

  try {
    const product = await pool.query(
      "SELECT * FROM products WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id],
    );

    if (product.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found or not authorised" });
    }

    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    res.status(500).json({ message: "Server Error while deleting product" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
