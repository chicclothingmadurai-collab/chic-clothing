const sendEmail = require("../utils/sendEmail");
const Order = require("../models/Order");
const { Cart } = require("../models");
const Product = require("../models/Product");
const User = require("../models/User");

// ---------- ADMIN EMAIL RECIPIENTS ----------
const ADMIN_EMAILS = [
  "eliteeventsx@gmail.com",
  "chicclothing2026@gmail.com",
  "Kalamcricketer@gmail.com",
  "SOMU24397@gmail.com",
  "Syedshamil3088@gmail.com"
];

const createOrder = async (req, res) => {
  try {
    console.log(req.body);

    const {
      addressId,
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    const user = await User.findById(req.user._id);
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

    console.log(cart);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    console.log(addressId);
    console.log("========== USER ADDRESSES ==========");
    console.log(user.addresses);

    const selectedAddress = user.addresses?.id(addressId);

    console.log("========== SELECTED ADDRESS ==========");
    console.log(selectedAddress);

    if (!selectedAddress) {
      return res.status(400).json({
        success: false,
        message: "Address not found",
      });
    }

    // ---------- STOCK VALIDATION BEFORE ORDER CREATION ----------
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product._id}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock (only ${product.stock} available).`,
        });
      }
    }

    // ---------- BUILD ORDER ITEMS ----------
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
        image: item.product.images?.[0]?.url || "",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
        finalPrice: price,
      };
    });

    const deliveryCharge = 0;
    const couponDiscount = 0;
    const grandTotal = itemsTotal;

    // ---------- CREATE ORDER ----------
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: selectedAddress.fullName,
        mobile: selectedAddress.mobile,
        email: user.email,
        addressLine: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      },
      paymentMethod: paymentMethod || "UPI",
      paymentStatus: "Paid",
      razorpayPaymentId,
      razorpayOrderId,
      transactionId: razorpayPaymentId,
      itemsTotal,
      deliveryCharge,
      couponDiscount,
      couponCode: cart.couponCode || "",
      grandTotal,
      orderStatus: "Processing",
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      statusHistory: [
        {
          status: "Processing",
          note: "Order placed successfully",
        },
      ],
    });

    // ---------- CUSTOMER EMAIL (with product details and delivery address) ----------
    const productsHtml = order.items
      .map(
        (item) => `
          <li>
            ${item.name} - Size: ${item.size}
            × ${item.quantity}
            - ₹${item.finalPrice}
          </li>
        `
      )
      .join("");

    const customerHtml = `
      <h2>Thank You for Shopping with CHIC Clothing ❤️</h2>
      <p>Your order has been confirmed successfully.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Order Time:</strong> ${new Date().toLocaleTimeString()}</p>
      <p><strong>Estimated Delivery:</strong> Within 5 Business Days</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <h3>Order Summary</h3>
      <ul>${productsHtml}</ul>
      <p><strong>Total Paid:</strong> ₹${order.grandTotal}</p>
      <h3>Delivery Address</h3>
      <p>
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.addressLine}<br>
        ${order.shippingAddress.city}<br>
        ${order.shippingAddress.state}<br>
        PIN: ${order.shippingAddress.pincode}
      </p>
      <p>Expected delivery within 5-7 business days.</p>
      <p>
        You can track your order anytime from the My Orders section of
        CHIC Clothing.
      </p>
      <p>
        Thank you for buying from CHIC Clothing.<br>
        Your order will be delivered soon.
      </p>
    `;

    // Send customer confirmation email to the actual customer
    try {
      await sendEmail(
        order.shippingAddress.email,
        "Order Confirmed - CHIC Clothing",
        customerHtml
      );
      console.log("Email sent (customer):", order.shippingAddress.email);
    } catch (err) {
      console.error("Email error (customer):", err);
    }

    // ---------- ADMIN EMAIL (complete order details) ----------
    const adminProducts = order.items
      .map(
        (item) => `
          <li>
            ${item.name}
            | Size: ${item.size}
            | Qty: ${item.quantity}
            | ₹${item.finalPrice}
          </li>
        `
      )
      .join("");

    const adminHtml = `
      <h2>🛒 NEW ORDER RECEIVED</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.shippingAddress.fullName}</p>
      <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
      <p><strong>Mobile:</strong> ${order.shippingAddress.mobile}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId}</p>
      <p><strong>Total Amount:</strong> ₹${order.grandTotal}</p>
      <h3>Products</h3>
      <ul>${adminProducts}</ul>
      <h3>Delivery Address</h3>
      <p>
        ${order.shippingAddress.addressLine}<br>
        ${order.shippingAddress.city}<br>
        ${order.shippingAddress.state}<br>
        PIN: ${order.shippingAddress.pincode}
      </p>
    `;

    // Send admin notification to all admins (array)
    try {
      await sendEmail(
        ADMIN_EMAILS,
        "NEW ORDER RECEIVED - CHIC Clothing",
        adminHtml
      );
      console.log("Email sent (admin)");
    } catch (err) {
      console.error("Email error (admin):", err);
    }

    // ---------- UPDATE STOCK ----------
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

    // ---------- CLEAR CART ----------
    cart.items = [];
    cart.couponCode = "";
    cart.couponDiscount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
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

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("items.product", "name brand images");

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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name brand images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
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

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!["Processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order now",
      });
    }

    order.orderStatus = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      note: "Cancelled by customer",
    });

    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
          soldCount: -item.quantity,
        },
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
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