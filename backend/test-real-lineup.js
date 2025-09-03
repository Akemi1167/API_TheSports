/**
 * Test lineup sync with a real match ID from the API
 */

const mongoose = require('mongoose');
const { debugLineupSync } = require('./src/cron/lineupCron');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_thesports';

async function testWithRealMatch() {
  try {
    console.log('🚀 Testing lineup sync with real match ID...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Use a real match ID from the API response
    const testMatchId = 'k82rekhg1oyvrep'; // Real Pharma vs FC Vilkhivtsi
    console.log(`🎯 Testing with real match ID: ${testMatchId}`);
    
    await debugLineupSync(testMatchId);
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

testWithRealMatch();
