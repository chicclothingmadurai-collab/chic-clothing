const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  name: String,

  brand: String,

  image: String,

  size: String,

  color: String,

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  price: Number,

  finalPrice: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      mobile: String,
      email: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "Google Pay",
        "PhonePe",
        "Paytm",
        "Cash On Delivery",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    razorpayOrderId: String,

    razorpayPaymentId: String,

    transactionId: String,

    statusHistory: [
      {
        status: String,

        timestamp: {
          type: Date,
          default: Date.now,
        },

        note: String,
      },
    ],

    itemsTotal: {
      type: Number,
      default: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    couponDiscount: {
      type: Number,
      default: 0,
    },

    couponCode: String,

    grandTotal: {
      type: Number,
      default: 0,
    },

    estimatedDelivery: Date,

    invoiceNumber: String,

    invoicePdf: String,

    invoiceGeneratedAt: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId =
      "CHIC" +
      Date.now().toString().slice(-8) +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
  }

  if (!this.invoiceNumber) {
    this.invoiceNumber =
      "INV-" +
      Date.now().toString().slice(-8);
  }

  if (
    this.razorpayPaymentId &&
    !this.transactionId
  ) {
    this.transactionId =
      this.razorpayPaymentId;
  }

  next();
});

module.exports = mongoose.model(
  "Order",
  orderSchema
);