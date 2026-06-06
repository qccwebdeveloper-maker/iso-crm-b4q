const express     = require('express');
const router      = express.Router();
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// GET /api/audit â€” audit stage applications
router.get('/', protect, async (req, res) => {
  try {
    const filter = { status: { $in: ['audit_stage1', 'audit_stage2'] } };
    if (req.user.role === 'auditor') filter.assignedAuditor = req.user._id;
    const apps = await Application.find(filter)
      .populate('client', 'name email company')
      .populate('assignedAuditor', 'name email')
      .sort({ updatedAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/audit/:id/stage
router.put('/:id/stage', protect, authorize('admin', 'auditor'), async (req, res) => {
  try {
    const { stage, notes } = req.body;
    const validStages = ['audit_stage1', 'audit_stage2'];
    if (!validStages.includes(stage)) return res.status(400).json({ message: 'Invalid stage' });
    const updates = { status: stage };
    if (notes) updates.auditNotes = notes;
    const app = await Application.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' })
      .populate('client', 'name email');
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json({ message: `Moved to ${stage}`, app });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

