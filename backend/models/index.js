const mongoose = require('mongoose');

// CART MODEL
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  size: { type: String, required: true },
  color: String,
  price: Number,
  finalPrice: Number
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  couponCode: String,
  couponDiscount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);


// REVIEW MODEL
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [String],
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verified: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

// COUPON MODEL
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: Number,
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  applicableBrands: [String]
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

// PAYMENT MODEL

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Cash On Delivery'] },
  amount: Number,
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: String,
  paymentPhone: { type: String, default: '9943983458' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

// NOTIFICATION MODEL
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  type: { type: String, enum: ['order', 'promotion', 'system', 'review'], default: 'system' },
  read: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Cart,
  Review,
  Coupon,
  Payment,
  Notification
};  
