const express = require('express');
const router = express.Router();
const {
  USERS, APPLICATIONS,
  getLeads, getLeadById, createLead, updateLead, deleteLead,
  createApplication, addNotification, populateUser
} = require('../mockData');
const { protect, authorize } = require('../middleware/auth');

// GET /api/leads — admin and sales can view all leads
router.get('/', protect, (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  res.json(getLeads(filter));
});

// GET /api/leads/stats
router.get('/stats', protect, authorize('admin', 'sales'), (req, res) => {
  const leads = getLeads();
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };
  res.json(stats);
});

// GET /api/leads/:id
router.get('/:id', protect, (req, res) => {
  const lead = getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
});

// POST /api/leads — admin and sales can create leads
router.post('/', protect, authorize('admin', 'sales'), (req, res) => {
  const lead = createLead(req.body);
  res.status(201).json(lead);
});

// PUT /api/leads/:id — admin and sales can update leads
router.put('/:id', protect, (req, res) => {
  const lead = updateLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
});

// POST /api/leads/:id/assign
router.post('/:id/assign', protect, authorize('admin', 'sales'), (req, res) => {
  const { auditorId, reviewerId } = req.body;
  const lead = getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  const updates = { status: lead.status === 'new' ? 'contacted' : lead.status };
  if (auditorId) {
    updates.assignedAuditor = auditorId;
    addNotification(auditorId, `You have been assigned to lead: ${lead.leadId} — ${lead.companyName}`, 'info');
  }
  if (reviewerId) {
    updates.assignedReviewer = reviewerId;
    addNotification(reviewerId, `You have been assigned to review lead: ${lead.leadId} — ${lead.companyName}`, 'info');
  }
  const updated = updateLead(req.params.id, updates);
  res.json(updated);
});

// POST /api/leads/:id/convert
router.post('/:id/convert', protect, authorize('admin', 'sales'), (req, res) => {
  const lead = getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  const clientId = req.body.clientId || 'u2';
  const appData = {
    client: clientId,
    organizationName: lead.companyName,
    organizationAbbr: lead.companyName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
    city: lead.city || '',
    state: lead.state || '',
    country: lead.country || 'India',
    isoStandard: lead.isoStandard || 'ISO 9001:2015',
    scope: req.body.scope || `ISO Certification for ${lead.companyName}`,
    accreditationBody: req.body.accreditationBody || 'NABCB',
    contactPerson: lead.contactPerson,
    contactEmail: lead.email,
    contactPhone: lead.mobile,
    employeeCount: { headOffice: 0, branches: 0, temporary: 0, total: 0 },
    adminNotes: `Converted from lead ${lead.leadId}. Assigned to: ${lead.assignedTo?.name || 'N/A'}`,
    status: 'submitted',
    submittedAt: new Date(),
  };
  const app = createApplication(appData);
  updateLead(req.params.id, { status: 'converted', convertedToApplication: app._id });
  const assignedId = lead.assignedTo?._id || lead.assignedTo;
  if (assignedId) {
    addNotification(assignedId, `Lead ${lead.leadId} converted — Application ${app.applicationId} created`, 'info');
  }
  res.json({ message: 'Lead converted to application', application: app });
});

// DELETE /api/leads/:id
router.delete('/:id', protect, authorize('admin', 'sales'), (req, res) => {
  const ok = deleteLead(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Lead deleted' });
});

module.exports = router;
