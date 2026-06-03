const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const STANDARDS = [
  { _id: 's1', name: 'ISO 9001:2015', category: 'Quality Management', active: true },
  { _id: 's2', name: 'ISO 14001:2015', category: 'Environmental Management', active: true },
  { _id: 's3', name: 'ISO 45001:2018', category: 'Occupational Health & Safety', active: true },
  { _id: 's4', name: 'ISO 27001:2022', category: 'Information Security', active: true },
  { _id: 's5', name: 'ISO 22000:2018', category: 'Food Safety', active: false },
  { _id: 's6', name: 'ISO 13485:2016', category: 'Medical Devices', active: true },
];
let sCounter = 7;

router.get('/', (req, res) => res.json(STANDARDS));

router.post('/', protect, authorize('admin'), (req, res) => {
  const { name, category, active } = req.body;
  if (!name || !category) return res.status(400).json({ message: 'Name and category required' });
  const s = { _id: 's' + sCounter++, name, category, active: active !== false };
  STANDARDS.push(s);
  res.status(201).json(s);
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  const idx = STANDARDS.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  STANDARDS[idx] = { ...STANDARDS[idx], ...req.body };
  res.json(STANDARDS[idx]);
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  const idx = STANDARDS.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  STANDARDS.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
