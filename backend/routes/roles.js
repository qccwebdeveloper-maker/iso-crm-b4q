const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const ROLES = [
  { _id: 'r1', name: 'Admin', permissions: ['all'], userCount: 1 },
  { _id: 'r2', name: 'Client', permissions: ['view_dashboard','view_applications','submit_application'], userCount: 12 },
  { _id: 'r3', name: 'Auditor', permissions: ['view_dashboard','view_applications','submit_audit_report'], userCount: 4 },
  { _id: 'r4', name: 'Reviewer', permissions: ['view_dashboard','view_applications','submit_review','approve_application'], userCount: 2 },
  { _id: 'r5', name: 'Sales', permissions: ['view_dashboard','manage_users','view_reports'], userCount: 1 },
];
let rCounter = 6;

router.get('/', protect, (req, res) => res.json(ROLES));

router.post('/', protect, authorize('admin'), (req, res) => {
  const { name, permissions } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const r = { _id: 'r' + rCounter++, name, permissions: permissions || [], userCount: 0 };
  ROLES.push(r);
  res.status(201).json(r);
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  const idx = ROLES.findIndex(r => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  ROLES[idx] = { ...ROLES[idx], ...req.body };
  res.json(ROLES[idx]);
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  const idx = ROLES.findIndex(r => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  ROLES.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
