const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'AURELIA' },
  contactEmail: { type: String, default: 'concierge@aurelia-jewelry.com' },
  contactPhone: { type: String, default: '+1 (800) 555-0199' },
  freeShippingThreshold: { type: Number, default: 500 },
  currency: { type: String, default: '$' },
  primaryColor: { type: String, default: '#C5A059' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
