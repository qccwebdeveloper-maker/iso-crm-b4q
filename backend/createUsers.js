// ============================================================
// CREATE USERS — run:  node createUsers.js
// Creates ONE clean B4Q account per role (admin, client,
// auditor, sales) WITHOUT wiping any existing data.
// Re-running is safe: existing accounts are updated in place.
// ============================================================
require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch { /* ignore on localhost */ }

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI;

// One account per requested role. Edit emails/passwords here if you like.
const ACCOUNTS = [
  {
    role: 'admin',
    name: 'B4Q Admin',
    email: 'admin@b4q.com',
    password: 'admin123',
    company: 'B4Q Management Limited',
    phone: '9000000001',
  },
  {
    role: 'admin',
    name: 'Aryan Kumar',
    email: 'aryankumar7645@gmail.com',
    password: 'admin123',
    company: 'B4Q Management Limited',
    phone: '9000000009',
  },
  {
    role: 'client',
    name: 'B4Q Client',
    email: 'client@b4q.com',
    password: 'client123',
    company: 'Sample Client Pvt Ltd',
    phone: '9000000002',
    clientId: '1111',
    address: 'Client Address, City, State',
    isoStandard: 'ISO 9001:2015',
    scope: 'Manufacturing and Services',
  },
  {
    role: 'auditor',
    name: 'B4Q Auditor',
    email: 'auditor@b4q.com',
    password: 'auditor123',
    company: 'B4Q Management Limited',
    phone: '9000000003',
  },
  {
    role: 'sales',
    name: 'B4Q Sales',
    email: 'sales@b4q.com',
    password: 'sales123',
    company: 'B4Q Management Limited',
    phone: '9000000005',
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  for (const acc of ACCOUNTS) {
    const email    = acc.email.toLowerCase();
    const password = await bcrypt.hash(acc.password, 10);

    const doc = {
      name: acc.name,
      email,
      password,
      role: acc.role,
      company: acc.company,
      phone: acc.phone,
      isActive: true,
      pendingApproval: false,
      ...(acc.clientId    ? { clientId: acc.clientId } : {}),
      ...(acc.address     ? { address: acc.address } : {}),
      ...(acc.isoStandard ? { isoStandard: acc.isoStandard } : {}),
      ...(acc.scope       ? { scope: acc.scope } : {}),
    };

    // Upsert by email — never deletes other accounts or data.
    const existing = await User.findOne({ email });
    if (existing) {
      await User.updateOne({ email }, { $set: doc });
      console.log(`♻️  Updated ${acc.role.padEnd(8)} → ${email}`);
    } else {
      await User.create(doc);
      console.log(`✨ Created ${acc.role.padEnd(8)} → ${email}`);
    }
  }

  console.log('\n──────────────  LOGIN CREDENTIALS  ──────────────');
  console.log('  ADMIN   →  admin@b4q.com             / admin123');
  console.log('  ADMIN   →  aryankumar7645@gmail.com  / admin123  (OTP login)');
  console.log('  CLIENT  →  Client ID: 1111  (or client@b4q.com) / client123');
  console.log('  AUDITOR →  auditor@b4q.com  / auditor123');
  console.log('  SALES   →  sales@b4q.com    / sales123');
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('✅ Done. Existing data was NOT modified.');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
