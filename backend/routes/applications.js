const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const {
  APPLICATIONS, USERS,
  getApplications, getApplicationById, createApplication, updateApplication, getUserById,
  addNotification, populateApp
} = require('../mockData');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/applications');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/applications
router.get('/', protect, (req, res) => {
  const filter = {};
  if (req.user.role === 'client')   filter.client          = req.user._id;
  if (req.user.role === 'auditor')  filter.assignedAuditor = req.user._id;
  if (req.user.role === 'reviewer') filter.assignedReviewer = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  res.json(getApplications(filter));
});

// GET /api/applications/:id
router.get('/:id', protect, (req, res) => {
  const app = getApplicationById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
});

// POST /api/applications
router.post('/', protect, authorize('client', 'admin'), (req, res) => {
  const clientId = req.user.role === 'client' ? req.user._id : (req.body.client || req.user._id);
  const app = createApplication({ ...req.body, client: clientId });
  res.status(201).json(app);
});

// PUT /api/applications/:id
router.put('/:id', protect, (req, res) => {
  const app = updateApplication(req.params.id, req.body);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
});

// PUT /api/applications/:id/status
router.put('/:id/status', protect, (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  const updates = { status: req.body.status };
  if (req.body.notes) {
    if (req.user.role === 'auditor')       updates.auditNotes  = req.body.notes;
    else if (req.user.role === 'reviewer') updates.reviewNotes = req.body.notes;
    else                                   updates.adminNotes  = req.body.notes;
  }
  const app = updateApplication(req.params.id, updates);
  addNotification(raw.client, `Your application ${raw.applicationId} status updated to: ${req.body.status}`, 'info');
  res.json({ message: 'Status updated', app });
});

// POST /api/applications/:id/submit
router.post('/:id/submit', protect, authorize('client'), (req, res) => {
  const app = updateApplication(req.params.id, { status: 'submitted', submittedAt: new Date() });
  if (!app) return res.status(404).json({ message: 'Not found' });
  USERS.filter(u => u.role === 'admin').forEach(a =>
    addNotification(a._id, `New application submitted: ${app.applicationId}`, 'info')
  );
  res.json({ message: 'Application submitted', app });
});

// POST /api/applications/:id/assign
router.post('/:id/assign', protect, authorize('admin'), (req, res) => {
  const { auditorId, reviewerId } = req.body;
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  const updates = { status: 'under_review' };
  if (auditorId) {
    updates.assignedAuditor = auditorId;
    addNotification(auditorId, `You have been assigned to application ${raw.applicationId}`, 'info');
  }
  if (reviewerId) {
    updates.assignedReviewer = reviewerId;
    addNotification(reviewerId, `You have been assigned to review application ${raw.applicationId}`, 'info');
  }
  // Notify client about assignments
  try {
    if (auditorId) {
      const aud = getUserById(auditorId);
      addNotification(raw.client, `An auditor (${aud?.name || 'Assigned Auditor'}) has been assigned to your application ${raw.applicationId}`, 'info');
    }
    if (reviewerId) {
      const rev = getUserById(reviewerId);
      addNotification(raw.client, `A reviewer (${rev?.name || 'Assigned Reviewer'}) has been assigned to your application ${raw.applicationId}`, 'info');
    }
  } catch (e) {
    // safety: continue even if notifications fail
    console.error('Failed to notify client of assignment', e);
  }
  const app = updateApplication(req.params.id, updates);
  res.json({ message: 'Assigned successfully', app });
});

// POST /api/applications/:id/upload
router.post('/:id/upload', protect, upload.single('document'), (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = `/uploads/applications/${req.file.filename}`;
  const docType  = req.body.docType || 'document';
  const specific = ['applicationForm','agreement','signedForm','auditReport','reviewReport','certificate'];

  if (specific.includes(docType)) {
    updateApplication(req.params.id, { [docType]: filePath });
  } else {
    raw.uploadedDocuments.push({
      _id: 'd' + Date.now(),
      name: req.file.originalname,
      path: filePath,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    });
  }
  res.json({ message: 'File uploaded', path: filePath });
});

// POST /api/applications/:id/image
router.post('/:id/image', protect, authorize('admin'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const app = updateApplication(req.params.id, { orgImage: `/uploads/applications/${req.file.filename}` });
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Image uploaded', app });
});

// POST /api/applications/:id/feedback
router.post('/:id/feedback', protect, (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  raw.feedbacks.push({
    _id: 'f' + Date.now(),
    from: req.user._id,
    role: req.user.role,
    message: req.body.message,
    rating: req.body.rating || 5,
    createdAt: new Date(),
  });
  raw.updatedAt = new Date();
  USERS.filter(u => u.role === 'admin').forEach(a =>
    addNotification(a._id, `New feedback on ${raw.applicationId} from ${req.user.role}`, 'info')
  );
  res.json({ message: 'Feedback submitted' });
});

// POST /api/applications/:id/send-document
router.post('/:id/send-document', protect, (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  const msg = req.body.message
    ? `Document/notes for application ${raw.applicationId}: ${req.body.message}`
    : `New document available for application ${raw.applicationId}`;
  addNotification(raw.client, msg, 'info');
  res.json({ message: 'Notification sent to client' });
});

// POST /api/applications/:id/accept-audit
router.post('/:id/accept-audit', protect, authorize('auditor', 'reviewer'), (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  
  if (req.user.role === 'auditor' && raw.assignedAuditor !== req.user._id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (req.user.role === 'reviewer' && raw.assignedReviewer !== req.user._id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const updates = {
    auditAcceptanceStatus: req.body.status, // 'accepted' or 'rejected'
    auditAcceptedDate: new Date(),
  };
  
  const app = updateApplication(req.params.id, updates);
  const statusMsg = req.body.status === 'accepted' ? 'accepted' : 'rejected';
  const roleLabel = req.user.role === 'auditor' ? 'Auditor' : 'Reviewer';
  
  addNotification(
    USERS.find(u => u.role === 'admin')?._id,
    `${roleLabel} ${req.user.name} has ${statusMsg} assignment for application ${raw.applicationId}`,
    'info'
  );
  
  if (req.body.status === 'accepted') {
    addNotification(raw.client, `${roleLabel} has accepted the assignment for application ${raw.applicationId}`, 'info');
  }
  
  res.json({ message: `Audit ${statusMsg}`, app });
});

// POST /api/applications/:id/payment
router.post('/:id/payment', protect, authorize('admin'), (req, res) => {
  const raw = APPLICATIONS.find(a => a._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Not found' });
  
  const updates = {
    paymentStatus: req.body.paymentStatus, // 'pending', 'received', 'partially_received'
    paymentAmount: req.body.paymentAmount || 0,
    paymentDate: req.body.paymentStatus === 'received' ? new Date() : null,
  };
  
  const app = updateApplication(req.params.id, updates);
  
  // Notify client about payment
  if (req.body.paymentStatus === 'received') {
    addNotification(
      raw.client,
      `Payment received for application ${raw.applicationId}. Amount: ₹${req.body.paymentAmount}`,
      'success'
    );
  }
  
  res.json({ message: 'Payment updated', app });
});

module.exports = router;
