const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads/applications');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/auditors',      require('./routes/auditors'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/feedback',      require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/leads',         require('./routes/leads'));
app.use('/api/payments',      require('./routes/payments'));

// New routes
app.use('/api/standards',     require('./routes/standards'));
app.use('/api/roles',         require('./routes/roles'));
app.use('/api/observations',  require('./routes/observations'));
app.use('/api/certificates',  require('./routes/certificates'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/audit',         require('./routes/audit'));
app.use('/api/review',        require('./routes/review'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: 'mock-data (no MongoDB needed)' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Running in MOCK MODE — no MongoDB needed`);
  console.log(`🔑 Demo logins:`);
  console.log(`   admin@crm.com    / admin123`);
  console.log(`   client@crm.com   / client123`);
  console.log(`   auditor@crm.com  / auditor123`);
  console.log(`   reviewer@crm.com / reviewer123`);
  console.log(`   sales@crm.com    / sales123`);
});
