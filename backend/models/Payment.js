const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['Google Pay', 'PhonePe', 'Cash On Delivery'] },
  amount: Number,
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: String,
  paymentPhone: { type: String, default: '9943983458' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
