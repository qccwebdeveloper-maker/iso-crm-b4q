const router             = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ApplicationReview  = require('../models/ApplicationReview');

const POPULATE = [
  { path: 'applicationRef', select: 'applicationId organizationName isoStandard status' },
  { path: 'reviewedBy',     select: 'name email' },
];

// ── GET /api/application-reviews  (list, optional ?appRef=<id>)
router.get('/', protect, authorize('admin', 'auditor', 'reviewer'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.appRef) filter.applicationRef = req.query.appRef;

    const reviews = await ApplicationReview.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/application-reviews/:id
router.get('/:id', protect, authorize('admin', 'auditor', 'reviewer'), async (req, res) => {
  try {
    const review = await ApplicationReview.findById(req.params.id).populate(POPULATE);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/application-reviews  (create)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { applicationRef, ...rest } = req.body;
    const review = await ApplicationReview.create({
      ...rest,
      ...(applicationRef ? { applicationRef } : {}),
      reviewedBy: req.user._id,
    });

    const populated = await ApplicationReview.findById(review._id).populate(POPULATE);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PUT /api/application-reviews/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { applicationRef, ...rest } = req.body;
    const review = await ApplicationReview.findByIdAndUpdate(
      req.params.id,
      { ...rest, ...(applicationRef ? { applicationRef } : {}), reviewedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate(POPULATE);

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/application-reviews/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const review = await ApplicationReview.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
