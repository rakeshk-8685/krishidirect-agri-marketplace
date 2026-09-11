require('dotenv').config();
const { connectDB } = require('../config/db');

async function runSeed() {
  console.log('🌾 Starting KrishiDirect Data Seeder...');
  await connectDB();
  // Requiring dataService will trigger initMemoryState with MongoDB connection status
  const dataService = require('../services/dataService');
  console.log('✅ Seed process completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
