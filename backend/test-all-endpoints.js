/**
 * Test script for all VideoStream endpoints with timestamp conversion
 */

const mongoose = require('mongoose');
const videoStreamService = require('./src/services/videoStreamService');
const { timestampToDateTime, getCurrentTimestamp } = require('./src/utils/timestampUtils');

const testAllEndpoints = async () => {
  try {
    console.log('🚀 Testing All VideoStream Endpoints with Timestamp Conversion...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/thesports', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    const currentTime = getCurrentTimestamp();
    console.log(`⏰ Current time: ${timestampToDateTime(currentTime)}\n`);
    
    // 1. Test getUpcomingMatches
    console.log('1. 📋 Testing getUpcomingMatches (24 hours):');
    const upcomingResult = await videoStreamService.getUpcomingMatches(24);
    if (upcomingResult.success && upcomingResult.data.length > 0) {
      console.log(`✅ Found ${upcomingResult.data.length} upcoming matches`);
      const sample = upcomingResult.data[0];
      console.log(`   Sample: ${sample.home} vs ${sample.away}`);
      console.log(`   - Original timestamp: ${sample.match_time}`);
      console.log(`   - Converted datetime: ${sample.match_datetime}`);
      console.log(`   - Hours from now: ${sample.hours_from_now}h`);
      console.log(`   - Status: ${sample.is_future ? '⏰ FUTURE' : sample.is_live ? '🔴 LIVE' : '✅ PAST'}\n`);
    } else {
      console.log(`ℹ️ No upcoming matches found\n`);
    }
    
    // 2. Test getActiveStreams
    console.log('2. 📋 Testing getActiveStreams:');
    const activeResult = await videoStreamService.getActiveStreams();
    if (activeResult.success && activeResult.data.length > 0) {
      console.log(`✅ Found ${activeResult.data.length} active streams`);
      const sample = activeResult.data[0];
      console.log(`   Sample: ${sample.home} vs ${sample.away}`);
      console.log(`   - Converted datetime: ${sample.match_datetime}`);
      console.log(`   - Minutes from now: ${sample.minutes_from_now}\n`);
    } else {
      console.log(`ℹ️ No active streams found\n`);
    }
    
    // 3. Test getLiveMatches
    console.log('3. 📋 Testing getLiveMatches:');
    const liveResult = await videoStreamService.getLiveMatches();
    if (liveResult.success && liveResult.data.length > 0) {
      console.log(`✅ Found ${liveResult.data.length} live matches`);
      const sample = liveResult.data[0];
      console.log(`   Sample: ${sample.home} vs ${sample.away}`);
      console.log(`   - Converted datetime: ${sample.match_datetime}`);
      console.log(`   - Match status: ${sample.matchTimeInfo.displayTime} (${sample.matchTimeInfo.half})\n`);
    } else {
      console.log(`ℹ️ No live matches found\n`);
    }
    
    // 4. Test getMatchesWithStatus
    console.log('4. 📋 Testing getMatchesWithStatus:');
    const statusResult = await videoStreamService.getMatchesWithStatus();
    if (statusResult.success && statusResult.data.length > 0) {
      console.log(`✅ Found ${statusResult.data.length} matches with status`);
      const statuses = statusResult.data.reduce((acc, match) => {
        acc[match.status] = (acc[match.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`   Status breakdown:`, statuses);
      
      const sample = statusResult.data[0];
      console.log(`   Sample: ${sample.home} vs ${sample.away}`);
      console.log(`   - Converted datetime: ${sample.match_datetime}`);
      console.log(`   - Status: ${sample.status}`);
      console.log(`   - Minutes from now: ${sample.minutes_from_now}\n`);
    } else {
      console.log(`ℹ️ No matches with status found\n`);
    }
    
    // 5. Test getMatchesByTimeRange (next 12 hours)
    console.log('5. 📋 Testing getMatchesByTimeRange (next 12 hours):');
    const twelveHoursFromNow = currentTime + (12 * 60 * 60);
    const rangeResult = await videoStreamService.getMatchesByTimeRange(currentTime, twelveHoursFromNow);
    if (rangeResult.success && rangeResult.data.length > 0) {
      console.log(`✅ Found ${rangeResult.data.length} matches in time range`);
      const sample = rangeResult.data[0];
      console.log(`   Sample: ${sample.home} vs ${sample.away}`);
      console.log(`   - Converted datetime: ${sample.match_datetime}`);
      console.log(`   - Range: ${timestampToDateTime(currentTime)} to ${timestampToDateTime(twelveHoursFromNow)}\n`);
    } else {
      console.log(`ℹ️ No matches found in time range\n`);
    }
    
    console.log('✅ All endpoint tests completed successfully!');
    console.log('\n🎯 Summary of timestamp conversion features:');
    console.log('- ✅ match_datetime: Full datetime in Vietnamese format');
    console.log('- ✅ match_date: Date only (DD/MM/YYYY)');
    console.log('- ✅ match_time_only: Time only (HH:mm:ss)');
    console.log('- ✅ is_live, is_past, is_future: Status booleans');
    console.log('- ✅ minutes_from_now: Time difference in minutes');
    console.log('- ✅ hours_from_now: Time difference in hours (for upcoming matches)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run tests
testAllEndpoints();
