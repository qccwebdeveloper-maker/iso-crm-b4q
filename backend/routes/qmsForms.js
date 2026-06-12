const express  = require('express');
const router   = express.Router();
const QMSForm  = require('../models/QMSForm');
const User     = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/qms-forms?formType=1&status=draft
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.formType) filter.formType = Number(req.query.formType);
    if (req.query.clientId) filter.clientId = req.query.clientId;
    if (req.query.status)   filter.status   = req.query.status;

    const forms = await QMSForm.find(filter)
      .populate('clientRef', 'name company clientId email phone')
      .sort({ updatedAt: -1 });
    res.json(forms);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/qms-forms/client/:clientId — fetch client info for pre-fill
router.get('/client/:clientId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ clientId: req.params.clientId })
      .select('name company email phone address isoStandard scope clientId');
    if (!user) return res.status(404).json({ message: 'No client found with this ID' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/qms-forms/by-client/:clientId/:formType — get saved form data
router.get('/by-client/:clientId/:formType', protect, authorize('admin'), async (req, res) => {
  try {
    const form = await QMSForm.findOne({
      clientId: req.params.clientId,
      formType: Number(req.params.formType),
    }).populate('clientRef', 'name company clientId email phone');
    if (!form) return res.status(404).json({ message: 'No form found' });
    res.json(form);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/qms-forms — create or update (upsert by clientId + formType)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { clientId, formType, formCode, formName, status, formData } = req.body;
    if (!clientId || !formType) {
      return res.status(400).json({ message: 'clientId and formType are required' });
    }

    const client = await User.findOne({ clientId });
    if (!client) return res.status(404).json({ message: 'No client found with this ID' });

    const form = await QMSForm.findOneAndUpdate(
      { clientId, formType: Number(formType) },
      {
        clientId,
        clientRef: client._id,
        formType: Number(formType),
        formCode,
        formName,
        status: status || 'draft',
        formData: formData || {},
      },
      { upsert: true, new: true, runValidators: false, setDefaultsOnInsert: true }
    );
    res.json(form);
  } catch (err) {
    console.error('[POST /api/qms-forms]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/qms-forms/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await QMSForm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Form deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
