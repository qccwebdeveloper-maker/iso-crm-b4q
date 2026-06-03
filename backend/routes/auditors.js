const express = require('express');
const router = express.Router();
const { getUsers } = require('../mockData');
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res) => {
  const auditors  = getUsers({ role: 'auditor' });
  const reviewers = getUsers({ role: 'reviewer' });
  res.json([...auditors, ...reviewers]);
});

module.exports = router;
