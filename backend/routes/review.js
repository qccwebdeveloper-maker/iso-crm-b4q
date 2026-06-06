const express     = require('express');
const router      = express.Router();
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// GET /api/review â€” applications assigned to logged-in auditor/reviewer
router.get('/', protect, authorize('auditor', 'reviewer'), async (req, res) => {
  try {
    const field = req.user.role === 'reviewer' ? 'assignedReviewer' : 'assignedAuditor';
    const apps = await Application.find({ [field]: req.user._id })
      .populate('client', 'name email company')
      .sort({ updatedAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/review/:id/report
router.post('/:id/report', protect, authorize('auditor', 'reviewer'), async (req, res) => {
  try {
    const { notes, status } = req.body;
    if (!notes) return res.status(400).json({ message: 'Notes required' });
    const updates = {};
    if (req.user.role === 'reviewer') updates.reviewNotes = notes;
    else                              updates.auditNotes  = notes;
    if (status) updates.status = status;
    const app = await Application.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' })
      .populate('client', 'name email');
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Report submitted', app });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

