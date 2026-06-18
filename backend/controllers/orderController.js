const Order = require("../models/Order");
const { Cart } = require("../models");
const Product = require("../models/Product");
const User = require("../models/User");
const createOrder = async (req, res) => {
  try {
    console.log("ORDER REQUEST:");
    console.log(req.body);

    

  
    const {
      addressId,
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    const user = await User.findById(req.user._id);

console.log("========== USER ==========");
console.log(user);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const cart = await Cart.findOne({
  user: req.user._id,
}).populate("items.product");

console.log("========== CART ==========");
console.log(cart);

if (!cart || cart.items.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Cart is empty",
  });
}

console.log("========== ADDRESS ID ==========");
console.log(addressId);

console.log("========== USER ADDRESSES ==========");
console.log(user.addresses);

const selectedAddress =
  user.addresses?.id(addressId);

console.log("========== SELECTED ADDRESS ==========");
console.log(selectedAddress);

if (!selectedAddress) {
  return res.status(400).json({
    success: false,
    message: "Address not found",
  });
}

    let itemsTotal = 0;

    const orderItems = cart.items.map((item) => {
      const price =
        item.finalPrice ||
        item.product.finalPrice ||
        item.product.price;

      itemsTotal += price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        brand: item.product.brand,
        image:
          item.product.images?.[0]?.url || "",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
        finalPrice: price,
      };
    });

    const deliveryCharge =
      itemsTotal > 999 ? 0 : 99;

    const couponDiscount =
      cart.couponDiscount || 0;

    const grandTotal =
      itemsTotal +
      deliveryCharge -
      couponDiscount;

    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      shippingAddress: {
        fullName:
          selectedAddress.fullName,

        mobile:
          selectedAddress.phone,

        email: user.email,

        addressLine:
          selectedAddress.line1 +
          " " +
          (selectedAddress.line2 || ""),

        city: selectedAddress.city,

        state: selectedAddress.state,

        pincode:
          selectedAddress.zip,
      },

      paymentMethod:
        paymentMethod || "UPI",

      paymentStatus: "Paid",

      razorpayPaymentId,

      razorpayOrderId,

      transactionId:
        razorpayPaymentId,

      itemsTotal,

      deliveryCharge,

      couponDiscount,

      couponCode:
        cart.couponCode || "",

      grandTotal,

      estimatedDelivery:
        new Date(
          Date.now() +
            7 *
              24 *
              60 *
              60 *
              1000
        ),

      statusHistory: [
        {
          status: "Pending",
          note:
            "Order placed successfully",
        },
      ],
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        }
      );
    }

    cart.items = [];
    cart.couponCode = "";
    cart.couponDiscount = 0;

    await cart.save();

    res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate(
        "items.product",
        "name brand images"
      );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name brand images"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrder = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (
      ![
        "Pending",
        "Processing",
      ].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot cancel order now",
      });
    }

    order.orderStatus =
      "Cancelled";

    order.statusHistory.push({
      status: "Cancelled",
      note:
        "Cancelled by customer",
    });

    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
            soldCount:
              -item.quantity,
          },
        }
      );
    }

    res.json({
      success: true,
      message:
        "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
};