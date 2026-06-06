const express  = require('express');
const router   = express.Router();
const Document = require('../models/Document');
const { protect, authorize } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../utils/cloudinary');

// GET /api/documents
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.applicationId) filter.application = req.query.applicationId;
    if (req.query.docType)       filter.docType      = req.query.docType;
    const docs = await Document.find(filter).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/documents/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    // Remove from Cloudinary
    if (doc.publicId) {
      try { await deleteFromCloudinary(doc.publicId); } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
    }
    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

