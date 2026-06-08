const express    = require('express');
const router     = express.Router();
const AppSetting = require('../models/AppSetting');
const { protect, authorize } = require('../middleware/auth');

const DEFAULT_SETTINGS = { clientOtpEnabled: true };

// GET /api/settings — public, returns current settings
router.get('/', async (req, res) => {
  try {
    const records = await AppSetting.find({});
    const settings = { ...DEFAULT_SETTINGS };
    for (const r of records) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/settings — admin only, upsert a setting key
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: 'key is required' });

    await AppSetting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );

    const records = await AppSetting.find({});
    const settings = { ...DEFAULT_SETTINGS };
    for (const r of records) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
