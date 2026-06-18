// wishlistController.js
const User = require('../models/User');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name brand images finalPrice price discount ratings stock');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    res.json({
      success: true,
      message: idx > -1 ? 'Removed from wishlist.' : 'Added to wishlist!',
      inWishlist: idx === -1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.wishlistCtrl = { getWishlist, toggleWishlist };

// ─────────────────────────────────────────────────────────────────

// orderController.js
const Order = require('../models/Order');
const { Cart } = require('./index');

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsTotal, deliveryCharge, couponDiscount, couponCode, grandTotal } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      deliveryCharge: deliveryCharge || 0,
      couponDiscount: couponDiscount || 0,
      couponCode,
      grandTotal,
      statusHistory: [{ status: 'Pending', note: 'Order placed successfully.' }],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Update sold count
    const Product = require('../models/Product');
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity, stock: -item.quantity } });
    }

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name brand images');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name brand images');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (!['Pending', 'Processing'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage.' });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer.' });
    await order.save();

    // Restore stock
    const Product = require('../models/Product');
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }

    res.json({ success: true, message: 'Order cancelled.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.orderCtrl = { createOrder, getUserOrders, getOrderById, cancelOrder };

// ─────────────────────────────────────────────────────────────────

// reviewController.js
const { Review } = require('../models/index');

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const Product = require('../models/Product');

    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment });

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { ratings: avgRating.toFixed(1), numReviews: reviews.length });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review added!', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.reviewCtrl = { getProductReviews, addReview, deleteReview };

// ─────────────────────────────────────────────────────────────────

// couponController.js
const { Coupon } = require('../models/index');

const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon.' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon expired.' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    if (cartTotal < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}.` });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'You have already used this coupon.' });

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(cartTotal * coupon.discountValue / 100);
      if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ success: true, discount, couponCode: coupon.code, message: `Coupon applied! You saved ₹${discount}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created!', coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Coupon updated!', coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.couponCtrl = { applyCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
