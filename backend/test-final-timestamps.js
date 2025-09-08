/**
 * Final demonstration of timestamp conversion system
 */

const axios = require('axios');

const testTimestampAPI = async () => {
  try {
    console.log('🚀 Testing Timestamp Conversion API...\n');
    
    // Test summary endpoint
    console.log('1. Testing Summary Endpoint:');
    const summaryResponse = await axios.get('http://localhost:3001/api/timestamps/summary');
    
    if (summaryResponse.data.success) {
      console.log('✅ Summary API working!');
      console.log(`- Total video streams: ${summaryResponse.data.data.total}`);
      console.log(`- Live matches: ${summaryResponse.data.data.live}`);
      console.log(`- Upcoming matches: ${summaryResponse.data.data.upcoming}`);
      console.log(`- Past matches: ${summaryResponse.data.data.past}`);
      console.log(`- Current time: ${summaryResponse.data.data.current_datetime}\n`);
    }
    
    // Test video streams endpoint  
    console.log('2. Testing Video Streams with Timestamps:');
    const streamsResponse = await axios.get('http://localhost:3001/api/timestamps/video-streams');
    
    if (streamsResponse.data.success && streamsResponse.data.data.length > 0) {
      console.log(`✅ Found ${streamsResponse.data.count} video streams with converted timestamps`);
      console.log('\n📋 Sample streams:');
      
      streamsResponse.data.data.slice(0, 3).forEach((stream, index) => {
        console.log(`${index + 1}. ${stream.home} vs ${stream.away}`);
        console.log(`   - Original timestamp: ${stream.match_time}`);
        console.log(`   - Converted datetime: ${stream.match_datetime}`);
        console.log(`   - Date: ${stream.match_date}`);
        console.log(`   - Time: ${stream.match_time_only}`);
        console.log(`   - Status: ${stream.is_live ? '🔴 LIVE' : stream.is_future ? '⏰ FUTURE' : '✅ PAST'}`);
        console.log(`   - Competition: ${stream.comp}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test
testTimestampAPI();
