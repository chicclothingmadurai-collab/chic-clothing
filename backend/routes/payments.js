const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/auth");

// Create Razorpay Order
router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

// Verify Payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

module.exports = router;