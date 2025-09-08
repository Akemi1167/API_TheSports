/**
 * Test script for timestamp conversion in VideoStreamService
 */

const mongoose = require('mongoose');
const videoStreamService = require('./src/services/videoStreamService');

const testTimestampConversion = async () => {
  try {
    console.log('🚀 Testing timestamp conversion...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/thesports', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Test getAllVideoStreams với datetime conversion
    console.log('📋 Testing getAllVideoStreams with datetime conversion...');
    const result = await videoStreamService.getAllVideoStreams();
    
    if (result.success && result.data.length > 0) {
      console.log(`\n✅ Found ${result.data.length} video streams with datetime conversion\n`);
      
      // Display first 5 streams với datetime
      console.log('🎯 Sample streams with converted timestamps:');
      console.log('┌─────────────────┬───────────────────────┬─────────────────┬──────────────────────────────────────┐');
      console.log('│ Match ID        │ DateTime (VN)         │ Status          │ Match Details                        │');
      console.log('├─────────────────┼───────────────────────┼─────────────────┼──────────────────────────────────────┤');
      
      result.data.slice(0, 5).forEach(stream => {
        const status = stream.is_live ? '🔴 LIVE' : 
                      stream.is_future ? '⏰ FUTURE' : '✅ PAST';
        const matchInfo = `${stream.home || 'N/A'} vs ${stream.away || 'N/A'}`;
        
        console.log(`│ ${stream.match_id.padEnd(15)} │ ${stream.match_datetime.padEnd(21)} │ ${status.padEnd(15)} │ ${matchInfo.padEnd(36)} │`);
      });
      
      console.log('└─────────────────┴───────────────────────┴─────────────────┴──────────────────────────────────────┘\n');
      
      // Show detailed info for first stream
      const firstStream = result.data[0];
      console.log('📊 Detailed timestamp info for first stream:');
      console.log(`- Match ID: ${firstStream.match_id}`);
      console.log(`- Original timestamp: ${firstStream.match_time}`);
      console.log(`- DateTime: ${firstStream.match_datetime}`);
      console.log(`- Date only: ${firstStream.match_date}`);
      console.log(`- Time only: ${firstStream.match_time_only}`);
      console.log(`- Is Live: ${firstStream.is_live}`);
      console.log(`- Is Past: ${firstStream.is_past}`);
      console.log(`- Is Future: ${firstStream.is_future}`);
      console.log(`- Minutes from now: ${firstStream.minutes_from_now}`);
      
    } else {
      console.log('❌ No video streams found or error occurred');
    }
    
    // Test getVideoStreamByMatchId
    console.log('\n📋 Testing getVideoStreamByMatchId with datetime conversion...');
    const singleResult = await videoStreamService.getVideoStreamByMatchId('2y8m4zh5zexpql0');
    
    if (singleResult.success) {
      console.log('✅ Single stream with datetime conversion:');
      console.log(`- Match: ${singleResult.data.home} vs ${singleResult.data.away}`);
      console.log(`- DateTime: ${singleResult.data.match_datetime}`);
      console.log(`- Competition: ${singleResult.data.comp}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run test
testTimestampConversion();
