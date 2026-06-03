const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const OBSERVATIONS = [];
let oCounter = 1;

router.get('/', protect, (req, res) => res.json(OBSERVATIONS));

router.post('/', protect, (req, res) => {
  const obs = {
    _id: 'o' + oCounter++,
    ...req.body,
    raisedByName: req.user?.name || 'Admin',
    status: 'Open',
    createdAt: new Date(),
  };
  OBSERVATIONS.push(obs);
  res.status(201).json(obs);
});

router.put('/:id', protect, (req, res) => {
  const idx = OBSERVATIONS.findIndex(o => o._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  OBSERVATIONS[idx] = { ...OBSERVATIONS[idx], ...req.body };
  res.json(OBSERVATIONS[idx]);
});

module.exports = router;
