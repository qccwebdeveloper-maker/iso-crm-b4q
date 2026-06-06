const express     = require('express');
const router      = express.Router();
const Lead        = require('../models/Lead');
const Application = require('../models/Application');
const User        = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const pushNotif = async (userId, message, type = 'info') => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { $each: [{ message, type, read: false, createdAt: new Date() }], $position: 0, $slice: 50 } }
  });
};

const populateFields = [
  { path: 'assignedTo',       select: 'name email role' },
  { path: 'assignedAuditor',  select: 'name email role' },
  { path: 'assignedReviewer', select: 'name email role' },
];

// GET /api/leads
router.get('/', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'sales') filter.assignedTo = req.user._id;
    const leads = await Lead.find(filter).populate(populateFields).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leads/stats
router.get('/stats', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const [total, newL, contacted, qualified, converted, lost] = await Promise.all([
      Lead.countDocuments(), Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'contacted' }), Lead.countDocuments({ status: 'qualified' }),
      Lead.countDocuments({ status: 'converted' }), Lead.countDocuments({ status: 'lost' }),
    ]);
    res.json({ total, new: newL, contacted, qualified, converted, lost });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leads/:id
router.get('/:id', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(populateFields);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/leads
router.post('/', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    const populated = await Lead.findById(lead._id).populate(populateFields);
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/leads/:id
router.put('/:id', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
      .populate(populateFields);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/leads/:id/assign  â€” assign auditor and/or reviewer to a lead
router.post('/:id/assign', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const { auditorId, reviewerId, assignedTo } = req.body;

    if (!auditorId && !reviewerId && !assignedTo) {
      return res.status(400).json({ message: 'Select at least one person to assign' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const updates = {};
    if (auditorId)  updates.assignedAuditor  = auditorId;
    if (reviewerId) updates.assignedReviewer = reviewerId;
    if (assignedTo) updates.assignedTo       = assignedTo;

    // Move status from 'new' to 'contacted' automatically
    if (lead.status === 'new') updates.status = 'contacted';

    const updated = await Lead.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' })
      .populate(populateFields);

    // Notify the assigned people
    if (auditorId)  await pushNotif(auditorId,  `You have been assigned to lead ${lead.leadId} â€” ${lead.companyName}`, 'info');
    if (reviewerId) await pushNotif(reviewerId, `You have been assigned to review lead ${lead.leadId} â€” ${lead.companyName}`, 'info');

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/leads/:id/convert  â€” convert lead to application
router.post('/:id/convert', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const app = await Application.create({
      organizationName:     lead.companyName,
      organizationAbbr:     lead.companyName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
      city:                 lead.city || '',
      state:                lead.state || '',
      country:              lead.country || 'India',
      isoStandard:          lead.isoStandard || 'ISO 9001:2015',
      standards:            [lead.isoStandard || 'ISO 9001:2015'],
      scope:                req.body.scope || `ISO Certification for ${lead.companyName}`,
      scopeOfCertification: req.body.scope || `ISO Certification for ${lead.companyName}`,
      accreditationBody:    req.body.accreditationBody || 'NABCB',
      contactPerson:        lead.contactPerson,
      emailId:              lead.email,
      contactNumbers:       lead.mobile,
      adminNotes:           `Converted from lead ${lead.leadId}`,
      status:               'submitted',
      submittedAt:          new Date(),
      client:               req.body.clientId || null,
    });

    await Lead.findByIdAndUpdate(req.params.id, { status: 'converted', convertedToApplication: app._id });

    if (lead.assignedTo) {
      await pushNotif(lead.assignedTo._id, `Lead ${lead.leadId} converted â€” Application ${app.applicationId} created`, 'success');
    }

    res.status(201).json({ message: 'Lead converted to application', application: app });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/leads/:id
router.delete('/:id', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

