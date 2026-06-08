const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to resolve MongoDB Atlas SRV records
// (ISP DNS may block SRV queries needed for mongodb+srv:// URIs)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb+srv://qccwebdeveloper_db:iso_crm_qcc_101@cluster0.nhou9fq.mongodb.net/?appName=Cluster0',
        { serverSelectionTimeoutMS: 15000 }
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
