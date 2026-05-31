const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 24 },
  description: { type: String, default: 'Exquisitely handcrafted with premium materials, designed to offer an elegant and timeless appeal. Perfect for both high-fashion occasions and sophisticated daily wear.' },
  stock: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
