const mongoose = require('mongoose');

const certSettingSchema = new mongoose.Schema({
  title:         { type: String, default: 'Certificate of Registration' },
  authority:     { type: String, default: 'QC Certification Pvt Ltd' },
  validityYears: { type: Number, default: 3 },
  footerText:    { type: String, default: 'This certificate remains the property of QCC.' },
  accreditation: { type: String, default: 'NABCB' },
}, { timestamps: true });

module.exports = mongoose.model('CertSetting', certSettingSchema);
