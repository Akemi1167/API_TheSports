/**
 * Manual trigger for videoStream sync to populate data, then test lineup sync
 */

const mongoose = require('mongoose');
const { syncVideoStreams } = require('./src/cron/videoStreamCron');
const { syncLineups } = require('./src/cron/lineupCron');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_thesports';

async function fullSystemTest() {
  try {
    console.log('🚀 Starting full system test...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Sync videoStreams to populate match data
    console.log('\n🎥 Step 1: Syncing videoStreams...');
    await syncVideoStreams();
    
    // Step 2: Wait a moment for videoStream data to be available
    console.log('\n⏳ Step 2: Waiting 2 seconds for data to be available...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Sync lineups using the populated videoStream data
    console.log('\n🏃‍♂️ Step 3: Syncing lineups...');
    await syncLineups();
    
    console.log('\n✅ Full system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Full system test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

fullSystemTest();
