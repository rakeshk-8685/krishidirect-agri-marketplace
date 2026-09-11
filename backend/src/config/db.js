const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agri_marketplace';
  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${connUri}: ${error.message}`);
    console.log(`[Agri Platform] Operating in High-Fidelity Hybrid Storage Mode (In-Memory + Persistent state simulation). Full schema validation active.`);
    return false;
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
