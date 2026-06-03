const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const REPORTS = [];

router.get('/', protect, (req, res) => res.json(REPORTS));

router.post('/', protect, (req, res) => {
  const r = { _id: 'rp' + Date.now(), ...req.body, submittedBy: req.user?.name, status: 'submitted', createdAt: new Date() };
  REPORTS.push(r);
  res.status(201).json(r);
});

module.exports = router;
