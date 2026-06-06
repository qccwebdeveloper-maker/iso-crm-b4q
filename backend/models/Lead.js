const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId:                 { type: String, unique: true },
  companyName:            { type: String, required: true, trim: true },
  contactPerson:          { type: String },
  email:                  { type: String },
  mobile:                 { type: String },
  city:                   { type: String },
  state:                  { type: String },
  country:                { type: String, default: 'India' },
  isoStandard:            { type: String },
  source:                 { type: String, enum: ['Website','Referral','LinkedIn','Cold Call','Email Campaign','Trade Show','Other'] },
  status:                 { type: String, enum: ['new','contacted','qualified','converted','lost'], default: 'new' },
  priority:               { type: String, enum: ['high','medium','low'], default: 'medium' },
  notes:                  { type: String },
  assignedTo:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedAuditor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedReviewer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  convertedToApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
}, { timestamps: true });

leadSchema.pre('save', async function (next) {
  if (this.isNew && !this.leadId) {
    const count = await mongoose.model('Lead').countDocuments();
    this.leadId = `LEAD-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
