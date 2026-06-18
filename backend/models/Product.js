const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: {
    type: String,
    required: true,
    enum: ['Nike', 'Adidas', 'Puma', 'Reebok', "Levi's", 'US Polo Assn.', 'Tommy Hilfiger',
      'Calvin Klein', 'Jack & Jones', 'Allen Solly', 'Louis Philippe', 'Peter England',
      'Van Heusen', 'H&M', 'Zara']
  },
  category: {
    type: String,
    required: true,
    enum: ['Oversized', 'Polo', 'Round Neck', 'Printed', 'Plain', 'Sports', 'Casual', 'Premium Cotton']
  },
  description: { type: String, required: true },
  images: [{ url: String, public_id: String }],
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
  colors: [{
    name: String,
    hex: String
  }],
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number },
  stock: { type: Number, required: true, default: 0, min: 0 },
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  tags: [String],
  soldCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  this.finalPrice = Math.round(this.price * (1 - this.discount / 100));
  next();
});

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ brand: 1, category: 1, finalPrice: 1 });

module.exports = mongoose.model('Product', productSchema);
