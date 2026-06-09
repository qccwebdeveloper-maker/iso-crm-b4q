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

router.post('/create-admin', async (req, res) => {
  try {
    const email    = 'qcc.webdeveloper@gmail.com';
    const password = 'admin123';

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role     = 'admin';
      existing.isActive = true;
      existing.password = await bcrypt.hash(password, 10);
      await existing.save();
      return res.json({ message: 'Existing user updated to admin', email, password });
    }

    await User.create({
      name:     'QCC Admin',
      email,
      password: await bcrypt.hash(password, 10),
      role:     'admin',
      isActive: true,
    });

    res.status(201).json({ message: 'Admin created', email, password });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
