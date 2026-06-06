const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  category:    { type: String, required: true },
  description: { type: String },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Standard', standardSchema);
