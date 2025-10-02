const axios = require('axios');

// Test script để kiểm tra API Last 5 với match_id
const testAPI = async () => {
  const baseURL = 'http://localhost:5000';
  const season_id = 'l965mkyhjpxr1ge'; // Season ID từ ví dụ của user
  const comp_id = 'jednm9whz0ryox8'; // Competition ID từ ví dụ
  
  console.log('🧪 Testing Last 5 API with match_id...\n');
  
  try {
    // Test 1: Lấy standings với Last 5 (không sync matches)
    console.log('🔍 Test 1: Get standings with Last 5 (no sync)');
    const response1 = await axios.get(`${baseURL}/api/standings/season/${season_id}/last5?comp_id=${comp_id}&limit=5`);
    
    console.log('✅ Response received:', response1.status);
    console.log('📋 Data structure:', {
      success: response1.data.success,
      total: response1.data.total,
      teamsCount: response1.data.teams?.length || response1.data.standings?.length || 0
    });
    
    if (response1.data.success) {
      // Check for teams or standings array
      const teams = response1.data.teams || response1.data.standings || [];
      
      if (teams.length > 0) {
        const firstTeam = teams[0];
        console.log(`✅ Team: ${firstTeam.team?.name || firstTeam.team_name}`);
        console.log(`📊 Form: ${firstTeam.last5?.form || firstTeam.last5_form}`);
        
        // Check for recent_matches in different locations
        const recentMatches = firstTeam.last5?.recent_matches || firstTeam.recent_matches || [];
        
        if (recentMatches.length > 0) {
          console.log('📋 Recent matches with match_id:');
          recentMatches.forEach((match, index) => {
            console.log(`   ${index + 1}. Match ID: ${match.match_id || 'N/A'}`);
            console.log(`      vs ${match.opponent}: ${match.result} (${match.score})`);
            console.log(`      Venue: ${match.venue}, Date: ${match.date}`);
            console.log(`      Estimated: ${match.estimated || false}`);
          });
        } else {
          console.log('⚠️ No recent matches found');
          console.log('📋 Team structure:', Object.keys(firstTeam));
        }
      } else {
        console.log('❌ No teams data found');
        console.log('📋 Response keys:', Object.keys(response1.data));
      }
    } else {
      console.log('❌ API returned success=false');
      console.log('📋 Error:', response1.data.error || response1.data.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Sync matches trước rồi lấy Last 5
    console.log('🔍 Test 2: Sync matches first, then get Last 5');
    const response2 = await axios.get(`${baseURL}/api/standings/season/${season_id}/last5?comp_id=${comp_id}&limit=3&sync_matches=true`);
    
    if (response2.data.success) {
      console.log(`✅ Matches synced: ${response2.data.matches_synced}`);
      
      if (response2.data.standings.length > 0) {
        const team = response2.data.standings[0];
        console.log(`📊 Team: ${team.team.name}`);
        console.log(`📈 Form: ${team.last5.form}`);
        
        if (team.last5.recent_matches) {
          console.log('📋 Recent matches after sync:');
          team.last5.recent_matches.slice(0, 2).forEach((match, index) => {
            console.log(`   ${index + 1}. Match ID: ${match.match_id}`);
            console.log(`      vs ${match.opponent}: ${match.result} (${match.score})`);
            console.log(`      Estimated: ${match.estimated || false}`);
          });
        }
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Sync matches riêng biệt
    console.log('🔍 Test 3: Manual season matches sync');
    try {
      const response3 = await axios.post(`${baseURL}/api/standings/season/${season_id}/sync-matches`, {
        comp_id: comp_id
      });
      
      if (response3.data.success) {
        console.log(`✅ Manual sync completed`);
        console.log(`📊 Season: ${response3.data.season_id}`);
        console.log(`🔢 Synced matches: ${response3.data.synced_matches}`);
      } else {
        console.log(`❌ Manual sync failed: ${response3.data.error}`);
      }
    } catch (error) {
      console.log(`❌ Manual sync error: ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Data:', error.response?.data);
    console.error('   Message:', error.message);
  }
};

// Chạy test
testAPI().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test script error:', error.message);
});