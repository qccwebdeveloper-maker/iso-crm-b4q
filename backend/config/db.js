const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to resolve MongoDB Atlas SRV records
// (ISP DNS may block SRV queries needed for mongodb+srv:// URIs)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Log topology recovery so a replica-set election (which produces the transient
// "primary marked stale due to electionId/setVersion mismatch" message) is visible
// as a normal disconnect → reconnect cycle rather than an unexplained error.
let listenersBound = false;
const bindConnectionListeners = () => {
  if (listenersBound) return;
  listenersBound = true;
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected — retrying automatically…'));
  mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected (new primary selected)'));
  mongoose.connection.on('error', err => console.error(`❌ MongoDB connection error: ${err.message}`));
};

const connectDB = async (retries = 5) => {
  bindConnectionListeners();
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb+srv://qccwebdeveloper_db:iso_crm_qcc_101@cluster0.nhou9fq.mongodb.net/?appName=Cluster0',
        {
          serverSelectionTimeoutMS: 15000, // keep selecting through an election
          retryWrites: true,               // auto-retry writes against the new primary
          retryReads: true,                // auto-retry reads against the new primary
          w: 'majority',                   // durable writes acked by a majority
          heartbeatFrequencyMS: 10000,     // detect topology changes promptly
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
        }
      );
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        const wait = i * 3000;
        console.log(`⏳ Retrying in ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Server continues without DB.');
      }
    }
  }
};

module.exports = connectDB;
