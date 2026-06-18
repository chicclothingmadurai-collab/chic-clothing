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
