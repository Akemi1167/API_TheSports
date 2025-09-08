/**
 * Test specific API endpoint /api/video-streams/upcoming?hours=24
 */

const axios = require('axios');

const testUpcomingAPI = async () => {
  try {
    console.log('🚀 Testing /api/video-streams/upcoming?hours=24 endpoint...\n');
    
    // Test với hours=24
    console.log('1. Testing with hours=24:');
    const response24 = await axios.get('http://localhost:3002/api/video-streams/upcoming?hours=24');
    
    if (response24.data && response24.data.results) {
      console.log(`✅ API Response successful`);
      console.log(`- Status code: ${response24.status}`);
      console.log(`- Total matches: ${response24.data.results.length}`);
      console.log(`- Meta info:`, response24.data.meta);
      
      if (response24.data.results.length > 0) {
        console.log('\n📋 Sample matches with converted timestamps:');
        response24.data.results.slice(0, 3).forEach((match, index) => {
          console.log(`${index + 1}. ${match.home} vs ${match.away}`);
          console.log(`   - Original timestamp: ${match.match_time}`);
          console.log(`   - Converted datetime: ${match.match_datetime}`);
          console.log(`   - Date: ${match.match_date}`);
          console.log(`   - Time: ${match.match_time_only}`);
          console.log(`   - Hours from now: ${match.hours_from_now}h`);
          console.log(`   - Competition: ${match.comp}\n`);
        });
      }
    }
    
    // Test với hours=6
    console.log('2. Testing with hours=6:');
    const response6 = await axios.get('http://localhost:3002/api/video-streams/upcoming?hours=6');
    
    if (response6.data && response6.data.results) {
      console.log(`✅ Found ${response6.data.results.length} matches in next 6 hours`);
    }
    
    // Test với hours=1
    console.log('3. Testing with hours=1:');
    const response1 = await axios.get('http://localhost:3002/api/video-streams/upcoming?hours=1');
    
    if (response1.data && response1.data.results) {
      console.log(`✅ Found ${response1.data.results.length} matches in next 1 hour`);
    }
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to server. Please start the test server first:');
      console.log('Run: node -e "..." to start test server on port 3001');
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
};

// Run test
testUpcomingAPI();
