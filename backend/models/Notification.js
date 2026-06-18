const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  type: { type: String, enum: ['order', 'promotion', 'system', 'review'], default: 'system' },
  read: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Cart, Review, Coupon, Payment, Notification };
