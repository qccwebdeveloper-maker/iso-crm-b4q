const express     = require('express');
const router      = express.Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

// GET /api/feedback â€” all feedback across all apps (admin view)
router.get('/', protect, async (req, res) => {
  try {
    const apps = await Application.find({ 'feedbacks.0': { $exists: true } })
      .populate('feedbacks.from', 'name role')
      .select('applicationId organizationName isoStandard feedbacks');
    const all = [];
    apps.forEach(a => {
      (a.feedbacks || []).forEach(f => {
        all.push({ ...f.toObject(), applicationId: a.applicationId, organizationName: a.organizationName, isoStandard: a.isoStandard, appMongoId: a._id });
      });
    });
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(all);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/feedback
router.post('/', protect, async (req, res) => {
  try {
    const { applicationId, message, rating } = req.body;
    if (!applicationId || !message) return res.status(400).json({ message: 'Application ID and message required' });
    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.feedbacks.push({ from: req.user._id, role: req.user.role, message, rating: rating || 5 });
    await app.save();
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

