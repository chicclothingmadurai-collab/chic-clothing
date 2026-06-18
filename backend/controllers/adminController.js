const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Review, Coupon, Payment, Notification } = require('../models/index');

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueData, recentOrders, ordersByStatus] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10)
        .populate('user', 'name email')
        .populate('items.product', 'name brand'),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ])
    ]);

    // Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling products
    const topProducts = await Product.find().sort({ soldCount: -1 }).limit(5).select('name brand soldCount images finalPrice');

    // Top brands by revenue
    const brandRevenue = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.brand', revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData[0]?.total || 0,
        recentOrders,
        ordersByStatus,
        monthlyRevenue,
        topProducts,
        brandRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');

    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock user
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin.' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, message: user.isBlocked ? 'User blocked.' : 'User unblocked.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin.' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderId = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email mobile');

    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    await order.save();

    res.json({ success: true, message: 'Order status updated.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleBlockUser, deleteUser, getAllOrders, updateOrderStatus };
