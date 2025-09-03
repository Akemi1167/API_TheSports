/**
 * Test multiple match IDs to find one with lineup data
 */

const mongoose = require('mongoose');
const { debugLineupSync } = require('./src/cron/lineupCron');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_thesports';

async function testMultipleMatches() {
  try {
    console.log('🚀 Testing lineup sync with multiple match IDs...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test multiple match IDs from the API response
    const testMatchIds = [
      'k82rekhg1oyvrep', // Real Pharma vs FC Vilkhivtsi
      '965mkyhk4o2yr1g', // Australia U23 vs Northern Mariana Island U23
      '4jwq2ghnk9p7m0v', // Korea U23 vs Macau U23
      'y39mp1h654kpmoj', // Kuwait U23 vs Myanmar U23
      '965mkyhkg5j5r1g', // Bhawanipore vs Prayag United SC
      'k82rekhg86l0rep', // United Kolkata SC vs Mohammedan SC
      '23xmvkh6owdyqg8', // Yokohama Marinos vs Kashiwa Reysol
      'zp5rzghg70zoq82', // Shonan Bellmare vs Sanfrecce Hiroshima
    ];
    
    console.log(`🎯 Testing ${testMatchIds.length} match IDs for lineup data...`);
    
    for (let i = 0; i < testMatchIds.length; i++) {
      const matchId = testMatchIds[i];
      console.log(`\n🏃‍♂️ [${i+1}/${testMatchIds.length}] Testing match: ${matchId}`);
      
      try {
        await debugLineupSync(matchId);
        console.log(`✅ Completed test for match: ${matchId}`);
      } catch (error) {
        console.error(`❌ Error testing match ${matchId}:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ All tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

testMultipleMatches();
