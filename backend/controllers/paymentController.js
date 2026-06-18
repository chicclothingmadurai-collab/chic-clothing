const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // INR → Paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("❌ Razorpay Create Order Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unable to create Razorpay order",
    });
  }
};

/**
 * Verify Razorpay Payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY BODY:");
    console.log(req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log("ORDER ID:", razorpay_order_id);
    console.log("PAYMENT ID:", razorpay_payment_id);
    console.log("SIGNATURE:", razorpay_signature);

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    console.log(
      "GENERATED SIGNATURE:",
      generatedSignature
    );

    const isAuthentic =
      generatedSignature === razorpay_signature;

    console.log("IS AUTHENTIC:", isAuthentic);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("❌ Razorpay Verify Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};;