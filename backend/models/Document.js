const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name:            { type: String },
  originalName:    { type: String },
  path:            { type: String, required: true },
  publicId:        { type: String, required: true },
  docType:         { type: String, enum: ['applicationForm','agreement','signedForm','auditReport','reviewReport','certificate','proofId','document'], default: 'document' },
  applicationId:   { type: String },
  application:     { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  clientId:        { type: String },   // CLT-... code of the application's client
  client:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedByName:  { type: String },
  fileSize:        { type: Number },
  mimeType:        { type: String },
  uploadedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
