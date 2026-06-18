const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema({
  no:   { type: String, trim: true },
  text: { type: String, trim: true },
}, { _id: false });

const standardSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  category:    { type: String },
  description: { type: String },
  clauses:     { type: [clauseSchema], default: [] },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Standard', standardSchema);
