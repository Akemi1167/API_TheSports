## 📋 Available Match IDs for Testing

Dựa trên kết quả test trước đó, đây là các **match_id có sẵn** và có dữ liệu standings:

### ✅ **Working Match IDs:**

```
8yomo4h3kw9oq0j  ← Đã test thành công
6ypq3nh352gymd7
pxwrxlh51674ryk
3glrw7h71x0vqdy
23xmvkh8oe9oqg8
```

### 🚀 **API Endpoints để test:**

#### 1. Lấy bảng xếp hạng từ match_id:
```
GET /api/matches/{match_id}/standings
```

**Example:**
```bash
GET /api/matches/8yomo4h3kw9oq0j/standings
```

#### 2. So sánh 2 đội từ match_id:
```
GET /api/matches/{match_id}/teams-comparison
```

**Example:**
```bash
GET /api/matches/8yomo4h3kw9oq0j/teams-comparison
```

#### 3. Bảng xếp hạng khu vực (xung quanh 2 đội):
```
GET /api/matches/{match_id}/area-standings?range={number}
```

**Example:**
```bash
GET /api/matches/8yomo4h3kw9oq0j/area-standings?range=3
```

#### 4. Last 5 form của đội:
```
GET /api/matches/team/{team_id}/last5
```

**Example (với team từ match trên):**
```bash
GET /api/matches/team/4zp5rzgh84yq82w/last5
```

### 🎯 **Thử ngay với match_id hoạt động:**

Thay vì `ednm9whwgy0lryo`, hãy sử dụng:
```
8yomo4h3kw9oq0j
```

### 📊 **Expected Response cho standings:**
```json
{
  "match_info": {
    "match_id": "8yomo4h3kw9oq0j",
    "home_team_id": "4zp5rzgh84yq82w",
    "away_team_id": "k82rekhv82vrepz",
    "competition_id": "xkn54qllhjqvy9d",
    "season_id": "jednm9whny8ryox",
    "status": 8
  },
  "standings": {
    "season_id": "jednm9whny8ryox",
    "tables": [...],
    "promotions": [...]
  },
  "match_teams": {
    "home": {
      "position": 1,
      "points": 19,
      "last5_form": {
        "form": "DW",
        "matches_count": 2
      }
    },
    "away": {
      "position": 5,
      "points": 6,
      "last5_form": {
        "form": "LL",
        "matches_count": 2
      }
    }
  }
}
```

### 🔧 **Để tìm match_id mới:**

Nếu bạn muốn tìm thêm match_id khác, chạy:
```bash
node find-matches-with-standings.js
```