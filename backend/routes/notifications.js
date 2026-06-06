const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) return res.status(404).json({ message: 'Not found' });
    const notifs = [...(user.notifications || [])].slice(0, 30);
    res.json(notifs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/:notifId/read
router.put('/:notifId/read', protect, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

