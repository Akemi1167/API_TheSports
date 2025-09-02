const Standing = require('../models/standing');

class StandingService {
  // Lấy xếp hạng theo season_id
  async getStandingBySeason(seasonId) {
    try {
      const standing = await Standing.findOne({ season_id: seasonId }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing not found for this season'
        };
      }
      
      return {
        success: true,
        data: standing
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo stage_id
  async getStandingByStage(stageId) {
    try {
      const standings = await Standing.find({
        'tables.stage_id': stageId
      }).lean();
      
      if (!standings || standings.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing not found for this stage'
        };
      }
      
      // Filter chỉ lấy tables có stage_id phù hợp
      const filteredStandings = standings.map(standing => ({
        ...standing,
        tables: standing.tables.filter(table => table.stage_id === stageId)
      }));
      
      return {
        success: true,
        data: filteredStandings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo table_id
  async getStandingByTable(tableId) {
    try {
      const standing = await Standing.findOne({
        'tables.id': tableId
      }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing table not found'
        };
      }
      
      // Tìm table cụ thể
      const table = standing.tables.find(t => t.id === tableId);
      
      return {
        success: true,
        data: {
          season_id: standing.season_id,
          promotions: standing.promotions,
          table: table,
          updated_at: standing.updated_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy thông tin đội trong xếp hạng
  async getTeamStanding(teamId, seasonId = null) {
    try {
      let query = { 'tables.rows.team_id': teamId };
      if (seasonId) {
        query.season_id = seasonId;
      }
      
      const standings = await Standing.find(query).lean();
      
      if (!standings || standings.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'Team standing not found'
        };
      }
      
      // Tìm thông tin đội trong tất cả các bảng
      const teamStandings = [];
      
      standings.forEach(standing => {
        standing.tables.forEach(table => {
          const teamRow = table.rows.find(row => row.team_id === teamId);
          if (teamRow) {
            teamStandings.push({
              season_id: standing.season_id,
              table_id: table.id,
              stage_id: table.stage_id,
              conference: table.conference,
              group: table.group,
              team_data: teamRow,
              updated_at: standing.updated_at
            });
          }
        });
      });
      
      return {
        success: true,
        data: teamStandings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo group
  async getStandingByGroup(seasonId, groupNumber) {
    try {
      const standing = await Standing.findOne({
        season_id: seasonId,
        'tables.group': groupNumber
      }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Group standing not found'
        };
      }
      
      // Filter chỉ lấy tables của group đó
      const groupTables = standing.tables.filter(table => table.group === groupNumber);
      
      return {
        success: true,
        data: {
          season_id: standing.season_id,
          promotions: standing.promotions,
          tables: groupTables,
          updated_at: standing.updated_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Tạo hoặc cập nhật xếp hạng
  async createOrUpdateStanding(standingData) {
    try {
      const result = await Standing.findOneAndUpdate(
        { season_id: standingData.season_id },
        {
          ...standingData,
          updated_at: Date.now()
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StandingService();
