// This file creates all remaining route files

const fs = require('fs');
const path = require('path');

const routes = {
  'cart.js': `const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/item/:itemId', protect, updateCartItem);
router.delete('/item/:itemId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;`,

  'wishlist.js': `const express = require('express');
const router = express.Router();
const { wishlistCtrl } = require('../controllers/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, wishlistCtrl.getWishlist);
router.post('/toggle', protect, wishlistCtrl.toggleWishlist);

module.exports = router;`,

  'orders.js': `const express = require('express');
const router = express.Router();
const { orderCtrl } = require('../controllers/index');
const { protect } = require('../middleware/auth');

router.post('/', protect, orderCtrl.createOrder);
router.get('/my-orders', protect, orderCtrl.getUserOrders);
router.get('/:id', protect, orderCtrl.getOrderById);
router.put('/:id/cancel', protect, orderCtrl.cancelOrder);

module.exports = router;`,

  'reviews.js': `const express = require('express');
const router = express.Router();
const { reviewCtrl } = require('../controllers/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/product/:productId', reviewCtrl.getProductReviews);
router.post('/', protect, reviewCtrl.addReview);
router.delete('/:id', protect, reviewCtrl.deleteReview);

module.exports = router;`,

  'coupons.js': `const express = require('express');
const router = express.Router();
const { couponCtrl } = require('../controllers/index');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/apply', protect, couponCtrl.applyCoupon);
router.get('/', protect, adminOnly, couponCtrl.getCoupons);
router.post('/', protect, adminOnly, couponCtrl.createCoupon);
router.put('/:id', protect, adminOnly, couponCtrl.updateCoupon);
router.delete('/:id', protect, adminOnly, couponCtrl.deleteCoupon);

module.exports = router;`,

  'admin.js': `const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleBlockUser, deleteUser, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;`,

  'users.js': `const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/recently-viewed/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== productId);
    user.recentlyViewed.unshift(productId);
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/recently-viewed', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed', 'name brand images finalPrice ratings');
    res.json({ success: true, products: user.recentlyViewed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;`,

  'payments.js': `const express = require('express');
const router = express.Router();
const { Payment } = require('../models/index');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId, method, transactionId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      method,
      amount: order.grandTotal,
      status: method === 'Cash On Delivery' ? 'Pending' : 'Completed',
      transactionId,
      paymentPhone: '9943983458'
    });

    if (method !== 'Cash On Delivery') {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Processing';
      order.statusHistory.push({ status: 'Processing', note: 'Payment received.' });
      await order.save();
    }

    res.json({ success: true, message: 'Payment confirmed!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;`,

  'notifications.js': `const express = require('express');
const router = express.Router();
const { Notification } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;`
};

// Write all route files
Object.entries(routes).forEach(([filename, content]) => {
  fs.writeFileSync(path.join(__dirname, '../routes', filename), content);
  console.log(`Created routes/${filename}`);
});

console.log('All routes created!');
