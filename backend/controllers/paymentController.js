const pool = require("../config/db");
const axios = require("axios");
const xml2js = require("xml2js");

const builder = new xml2js.Builder({ headless: true, rootName: "API3G" });
const parser = new xml2js.Parser({ explicitArray: false });

// @desc    Initiate a payment for an order
// @route   POST /api/payments/initiate
// @access  Buyers only
const initiatePayment = async (req, res) => {
  const { order_id } = req.body;
  const buyer_id = req.user.id;

  try {
    if (!order_id) {
      return res.status(400).json({ message: "Please provide an order_id" });
    }

    // 1. Fetch the order and confirm it belongs to this buyer
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND buyer_id = $2",
      [order_id, buyer_id],
    );

    if (orderResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or not authorised" });
    }

    const order = orderResult.rows[0];

    // 2. Generate a unique company reference for this payment attempt
    const company_ref = `FC-${order_id}-${Date.now()}`;

    // 3. Build the XML payload for DPO's createToken request
    const xmlPayload = builder.buildObject({
      CompanyToken: process.env.DPO_COMPANY_TOKEN,
      Request: "createToken",
      Transaction: {
        PaymentAmount: order.total_price,
        PaymentCurrency: "ZMW",
        CompanyRef: company_ref,
        RedirectURL: "http://localhost:5000/api/payments/redirect",
        BackURL: "http://localhost:5000/api/payments/callback",
        CompanyRefUnique: "0",
        PTL: "5",
      },
      Services: {
        Service: {
          ServiceType: process.env.DPO_SERVICE_TYPE,
          ServiceDescription: `FarmConnect Order #${order_id}`,
          ServiceDate:
            new Date().toISOString().slice(0, 10).replace(/-/g, "/") + " 12:00",
        },
      },
    });

    // 4. Send the request to DPO
    const dpoResponse = await axios.post(process.env.DPO_API_URL, xmlPayload, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });

    // 5. Parse DPO's XML response back into a JS object
    const parsedResponse = await parser.parseStringPromise(dpoResponse.data);

    if (parsedResponse.Result !== "000") {
      return res.status(400).json({
        message: "DPO rejected the payment request",
        detail: parsedResponse.ResultExplanation,
      });
    }

    // 6. Save the payment record in our database
    const newPayment = await pool.query(
      `INSERT INTO payments (order_id, company_ref, trans_token, trans_ref, amount, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [
        order_id,
        company_ref,
        parsedResponse.TransToken,
        parsedResponse.TransRef,
        order.total_price,
      ],
    );

    // 7. Send back the redirect URL for the buyer to complete payment
    res.status(201).json({
      message: "Payment initiated successfully",
      payment: newPayment.rows[0],
      redirect_url: `https://secure.3gdirectpay.com/pay.asp?ID=${parsedResponse.TransToken}`,
    });
  } catch (error) {
    console.error("Payment Initiation Error:", error.message);
    if (error.response) {
      console.error("DPO Response Status:", error.response.status);
      console.error("DPO Response Data:", error.response.data);
    }
    res.status(500).json({ message: "Server Error while initiating payment" });
  }
};
// @desc    DPO server-to-server callback when payment completes
// @route   POST /api/payments/callback
// @access  Public (called by DPO directly)
const paymentCallback = async (req, res) => {
  try {
    // DPO sends the TransToken as a query param or in the body depending on setup
    const transToken = req.query.TransID || req.body.TransID;

    if (!transToken) {
      return res.status(400).send("Missing transaction token");
    }

    // 1. Ask DPO directly what the actual status of this transaction is
    const builder = new (require("xml2js").Builder)({
      headless: true,
      rootName: "API3G",
    });
    const parser = new (require("xml2js").Parser)({ explicitArray: false });

    const xmlPayload = builder.buildObject({
      CompanyToken: process.env.DPO_COMPANY_TOKEN,
      Request: "verifyToken",
      TransactionToken: transToken,
    });

    const dpoResponse = await axios.post(process.env.DPO_API_URL, xmlPayload, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        Accept: "application/xml",
        "User-Agent": "FarmConnect/1.0 (Node.js)",
      },
    });
    const parsedResponse = await parser.parseStringPromise(dpoResponse.data);

    // 2. Find the matching payment record in our database
    const paymentResult = await pool.query(
      "SELECT * FROM payments WHERE trans_token = $1",
      [transToken],
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).send("Payment record not found");
    }

    const payment = paymentResult.rows[0];

    // 3. Update status based on DPO's verification result
    const newStatus = parsedResponse.Result === "000" ? "paid" : "failed";

    await pool.query(
      `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newStatus, payment.id],
    );

    res.status(200).send("Callback received");
  } catch (error) {
    console.error("Payment Callback Error:", error.message);
    res.status(500).send("Server Error processing callback");
  }
};

// @desc    Where the buyer's browser lands after paying
// @route   GET /api/payments/redirect
// @access  Public
const paymentRedirect = async (req, res) => {
  const transToken = req.query.TransID;
  res.send(
    `Payment process complete. Transaction reference: ${transToken}. You may close this window.`,
  );
};
module.exports = {
  initiatePayment,
  paymentCallback,
  paymentRedirect,
};
