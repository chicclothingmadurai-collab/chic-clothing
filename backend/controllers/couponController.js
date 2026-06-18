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
