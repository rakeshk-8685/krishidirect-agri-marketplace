require('dotenv').config();
const { connectDB } = require('../config/db');

async function runSeed() {
  console.log('🌾 Starting KrishiDirect Data Seeder...');
  await connectDB();
  const dataService = require('../services/dataService');
  await dataService.syncToMongo(true);
  console.log('✅ Seed process completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
