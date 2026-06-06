const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/auditors â€” returns all auditors + reviewers for assignment dropdowns
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['auditor', 'reviewer'] } })
      .select('-password')
      .populate('assignedApplications', 'applicationId organizationName status')
      .sort({ name: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

