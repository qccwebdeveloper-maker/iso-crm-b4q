const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const router   = express.Router();

router.delete('/db', async (req, res) => {
  try {
    await mongoose.connection.dropDatabase();
    res.json({ message: 'Database dropped successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to drop database', error: err.message });
  }
});


module.exports = router;
