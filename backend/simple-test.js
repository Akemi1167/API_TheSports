const http = require('http');

// Simple test without axios
const testAPI = () => {
  console.log('🧪 Testing Last 5 API with match_id...\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/standings/season/l965mkyhjpxr1ge/last5?comp_id=jednm9whz0ryox8&limit=3',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Response status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📋 API Response received successfully');
        
        if (response.success) {
          console.log(`📊 Success: ${response.success}`);
          console.log(`🔢 Total teams: ${response.total || 0}`);
          
          const teams = response.teams || response.standings || [];
          if (teams.length > 0) {
            const firstTeam = teams[0];
            console.log(`\n✅ First Team: ${firstTeam.team?.name || firstTeam.team_name}`);
            console.log(`📈 Form: ${firstTeam.last5?.form || firstTeam.last5_form}`);
            
            // Check recent_matches for match_id
            const recentMatches = firstTeam.last5?.recent_matches || firstTeam.recent_matches || [];
            if (recentMatches.length > 0) {
              console.log('\n📋 Recent matches with match_id:');
              recentMatches.slice(0, 3).forEach((match, index) => {
                console.log(`   ${index + 1}. Match ID: ${match.match_id || 'N/A'}`);
                console.log(`      vs ${match.opponent}: ${match.result} (${match.score})`);
                console.log(`      Date: ${match.date}`);
                console.log(`      Estimated: ${match.estimated || false}`);
              });
              
              console.log('\n🎉 SUCCESS: match_id field is present in recent_matches!');
            } else {
              console.log('\n⚠️ No recent matches found');
            }
          } else {
            console.log('❌ No teams data found');
          }
        } else {
          console.log(`❌ API returned success=false: ${response.error}`);
        }
      } catch (error) {
        console.error('❌ Failed to parse JSON response:', error.message);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.on('timeout', () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.end();
};

// Run test
console.log('🚀 Starting simple HTTP test...');
testAPI();

// Exit after 10 seconds
setTimeout(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}, 10000);