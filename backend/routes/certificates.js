const express     = require('express');
const router      = express.Router();
const Certificate = require('../models/Certificate');
const CertSetting = require('../models/CertSetting');
const { protect, authorize } = require('../middleware/auth');

// GET /api/certificates
router.get('/', protect, async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/certificates/settings
router.get('/settings', protect, async (req, res) => {
  try {
    let setting = await CertSetting.findOne();
    if (!setting) setting = await CertSetting.create({});
    res.json(setting);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/certificates/settings
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const setting = await CertSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(setting);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/certificates/manual
router.post('/manual', protect, authorize('admin'), async (req, res) => {
  try {
    if (!req.body.orgName || !req.body.standard || !req.body.certNumber) {
      return res.status(400).json({ message: 'Organization name, standard and certificate number are required' });
    }
    const exists = await Certificate.findOne({ certNumber: req.body.certNumber });
    if (exists) return res.status(400).json({ message: 'Certificate number already exists' });
    const cert = await Certificate.create(req.body);
    res.status(201).json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/certificates/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/certificates/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/certificates/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ message: 'Certificate deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

