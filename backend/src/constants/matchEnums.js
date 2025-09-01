/**
 * Match State Enums
 * Định nghĩa các trạng thái của trận đấu
 */
class MatchEnums {
  /**
   * Match States - Trạng thái trận đấu
   */
  static MatchStates = {
    ABNORMAL: { code: 0, description: 'Abnormal(suggest hiding)' },
    NOT_STARTED: { code: 1, description: 'Not started' },
    FIRST_HALF: { code: 2, description: 'First half' },
    HALF_TIME: { code: 3, description: 'Half-time' },
    SECOND_HALF: { code: 4, description: 'Second half' },
    OVERTIME: { code: 5, description: 'Overtime' },
    OVERTIME_DEPRECATED: { code: 6, description: 'Overtime(deprecated)' },
    PENALTY_SHOOTOUT: { code: 7, description: 'Penalty Shoot-out' },
    END: { code: 8, description: 'End' },
    DELAY: { code: 9, description: 'Delay' },
    INTERRUPT: { code: 10, description: 'Interrupt' },
    CUT_IN_HALF: { code: 11, description: 'Cut in half' },
    CANCEL: { code: 12, description: 'Cancel' },
    TO_BE_DETERMINED: { code: 13, description: 'To be determined' }
  };

  /**
   * Technical Statistics - Thống kê kỹ thuật
   */
  static TechnicalStatistics = {
    GOAL: { code: 1, description: 'Goal' },
    CORNER: { code: 2, description: 'Corner' },
    YELLOW_CARD: { code: 3, description: 'Yellow card' },
    RED_CARD: { code: 4, description: 'Red card' },
    OFFSIDE: { code: 5, description: 'Offside' },
    FREE_KICK: { code: 6, description: 'Free kick' },
    GOAL_KICK: { code: 7, description: 'Goal kick' },
    PENALTY: { code: 8, description: 'Penalty' },
    SUBSTITUTION: { code: 9, description: 'Substitution' },
    START: { code: 10, description: 'Start' },
    MIDFIELD: { code: 11, description: 'Midfield' },
    END: { code: 12, description: 'End' },
    HALFTIME_SCORE: { code: 13, description: 'Halftime score' },
    CARD_UPGRADE_CONFIRMED: { code: 15, description: 'Card upgrade confirmed' },
    PENALTY_MISSED: { code: 16, description: 'Penalty missed' },
    OWN_GOAL: { code: 17, description: 'Own goal' },
    INJURY_TIME: { code: 19, description: 'Injury time' },
    SHOTS_ON_TARGET: { code: 21, description: 'Shots on target' },
    SHOTS_OFF_TARGET: { code: 22, description: 'Shots off target' },
    ATTACKS: { code: 23, description: 'Attacks' },
    DANGEROUS_ATTACK: { code: 24, description: 'Dangerous Attack' },
    BALL_POSSESSION: { code: 25, description: 'Ball possession' },
    OVERTIME_OVER: { code: 26, description: 'Overtime is over' },
    PENALTY_KICK_ENDED: { code: 27, description: 'Penalty kick ended' },
    VAR: { code: 28, description: 'VAR(Video assistant referee)' },
    PENALTY_SHOOTOUT_PENALTY: { code: 29, description: 'Penalty(Penalty Shoot-out)' },
    PENALTY_SHOOTOUT_MISSED: { code: 30, description: 'Penalty missed(Penalty Shoot-out)' }
  };

  /**
   * Event Reasons - Lý do sự kiện
   */
  static EventReasons = {
    UNKNOWN: { code: 0, description: 'Unknown' },
    FOUL: { code: 1, description: 'Foul' },
    PROFESSIONAL_FOUL: { code: 2, description: 'Professional foul' },
    ENCROACHMENT_INJURY_SUB: { code: 3, description: 'Encroachment (Card)/Injury substitution (Substitution)' },
    TACTICAL_FOUL_SUB: { code: 4, description: 'Tactical Foul (Card)/Tactical substitution (Substitution)' },
    RECKLESS_OFFENCE: { code: 5, description: 'Reckless Offence' },
    OFF_THE_BALL_FOUL: { code: 6, description: 'Off the ball foul' },
    PERSISTENT_FOULING: { code: 7, description: 'Persistent fouling' },
    PERSISTENT_INFRINGEMENT: { code: 8, description: 'Persistent Infringement' },
    VIOLENT_CONDUCT: { code: 9, description: 'Violent conduct' },
    DANGEROUS_PLAY: { code: 10, description: 'Dangerous play' },
    HANDBALL: { code: 11, description: 'Handball' },
    SERIOUS_FOUL: { code: 12, description: 'Serious Foul' },
    PROFESSIONAL_FOUL_LAST_MAN: { code: 13, description: 'Professional foul last man' },
    DENIED_GOAL_SCORING_OPPORTUNITY: { code: 14, description: 'Denied goal-scoring opportunity' },
    TIME_WASTING: { code: 15, description: 'Time wasting' },
    VIDEO_SYNC_DONE: { code: 16, description: 'Video sync done' },
    RESCINDED_CARD: { code: 17, description: 'Rescinded Card' },
    ARGUMENT: { code: 18, description: 'Argument' },
    DISSENT: { code: 19, description: 'Dissent' },
    FOUL_AND_ABUSIVE_LANGUAGE: { code: 20, description: 'Foul and Abusive Language' },
    EXCESSIVE_CELEBRATION: { code: 21, description: 'Excessive celebration' },
    NOT_RETREATING: { code: 22, description: 'Not Retreating' },
    FIGHT: { code: 23, description: 'Fight' },
    EXTRA_FLAG_TO_CHECKER: { code: 24, description: 'Extra flag to checker' },
    ON_BENCH: { code: 25, description: 'On bench' },
    POST_MATCH: { code: 26, description: 'Post match' },
    OTHER_REASON: { code: 27, description: 'Other reason' },
    UNALLOWED_FIELD_ENTERING: { code: 28, description: 'Unallowed field entering' },
    ENTERING_FIELD: { code: 29, description: 'Entering field' },
    LEAVING_FIELD: { code: 30, description: 'Leaving field' },
    UNSPORTING_BEHAVIOUR: { code: 31, description: 'Unsporting behaviour' },
    NOT_VISIBLE: { code: 32, description: 'Not visible' },
    FLOP: { code: 33, description: 'Flop' },
    EXCESSIVE_USAGE_OF_REVIEW_SIGNAL: { code: 34, description: 'Excessive usage of review signal' },
    ENTERING_REFEREE_REVIEW_AREA: { code: 35, description: 'Entering referee review area' },
    SPITTING: { code: 36, description: 'Spitting' },
    VIRAL: { code: 37, description: 'Viral' }
  };

  /**
   * Half-time Statistics ID - Thống kê hiệp một
   */
  static HalftimeStatistics = {
    GOAL: { code: 1, description: 'Goal' },
    CORNER: { code: 2, description: 'Corner' },
    YELLOW_CARD: { code: 3, description: 'Yellow card' },
    RED_CARD: { code: 4, description: 'Red card' },
    OFFSIDE: { code: 5, description: 'Offside' },
    FREE_KICK: { code: 6, description: 'Free kick' },
    GOAL_KICK: { code: 7, description: 'Goal kick' },
    PENALTY: { code: 8, description: 'Penalty' },
    SUBSTITUTION: { code: 9, description: 'Substitution' },
    CARD_UPGRADE_CONFIRMED: { code: 15, description: 'Card upgrade confirmed' },
    PENALTY_MISSED: { code: 16, description: 'Penalty missed' },
    OWN_GOAL: { code: 17, description: 'Own goal' },
    SHOTS_ON_TARGET: { code: 21, description: 'Shots on target' },
    SHOTS_OFF_TARGET: { code: 22, description: 'Shots off target' },
    ATTACKS: { code: 23, description: 'Attacks' },
    DANGEROUS_ATTACK: { code: 24, description: 'Dangerous Attack' },
    BALL_POSSESSION: { code: 25, description: 'Ball possession' },
    DRIBBLE: { code: 33, description: 'Dribble' },
    DRIBBLE_SUCCESS: { code: 34, description: 'Dribble success' },
    CLEARANCES: { code: 36, description: 'Clearances' },
    BLOCKED_SHOTS: { code: 37, description: 'Blocked shots' },
    INTERCEPT: { code: 38, description: 'Intercept' },
    TACKLES: { code: 39, description: 'Tackles' },
    PASS: { code: 40, description: 'Pass' },
    PASS_SUCCESS: { code: 41, description: 'Pass success' },
    KEY_PASSES: { code: 42, description: 'key passes' },
    CROSS: { code: 43, description: 'Cross' },
    CROSS_SUCCESS: { code: 44, description: 'Cross success' },
    LONG_PASS: { code: 45, description: 'Long pass' },
    LONG_PASS_SUCCESS: { code: 46, description: 'Long pass success' },
    ONE_TO_ONE_FIGHT_SUCCESS: { code: 48, description: '1 to 1 fight success' },
    PASS_BROKEN: { code: 49, description: 'The pass is broken' },
    FOULS: { code: 51, description: 'Fouls' },
    SAVE: { code: 52, description: 'Save' },
    PUNCHES: { code: 53, description: 'Punches' },
    GOALKEEPER_STRIKES: { code: 54, description: 'Goalkeeper strikes' },
    GOALKEEPER_STRIKES_SUCCESS: { code: 55, description: 'Goalkeeper strikes success' },
    HIGH_ALTITUDE_ATTACK: { code: 56, description: 'High altitude attack' },
    ONE_ON_ONE_FIGHT_FAILED: { code: 61, description: '1 on 1 fight failed' },
    FREE_KICK_63: { code: 63, description: 'Free kick' },
    FREE_KICK_GOAL: { code: 65, description: 'Free kick goal' },
    HIT_WOODWORK: { code: 69, description: 'Hit woodwork' },
    FAST_BREAK: { code: 70, description: 'Fast break' },
    FAST_BREAK_SHOT: { code: 71, description: 'Fast break shot' },
    FAST_BREAK_GOAL: { code: 72, description: 'Fast break goal' },
    LOST_THE_BALL: { code: 78, description: 'Lost the ball' },
    SHOTS: { code: 83, description: 'Shots' }
  };

  /**
   * Lấy mô tả trạng thái trận đấu theo mã
   * @param {number} code - Mã trạng thái
   * @returns {string|null} Mô tả trạng thái hoặc null nếu không tìm thấy
   */
  static getMatchStateDescription(code) {
    const state = Object.values(this.MatchStates).find(state => state.code === code);
    return state ? state.description : null;
  }

  /**
   * Lấy mô tả thống kê kỹ thuật theo mã
   * @param {number} code - Mã thống kê
   * @returns {string|null} Mô tả thống kê hoặc null nếu không tìm thấy
   */
  static getTechnicalStatisticDescription(code) {
    const stat = Object.values(this.TechnicalStatistics).find(stat => stat.code === code);
    return stat ? stat.description : null;
  }

  /**
   * Lấy mô tả lý do sự kiện theo mã
   * @param {number} code - Mã lý do sự kiện
   * @returns {string|null} Mô tả lý do sự kiện hoặc null nếu không tìm thấy
   */
  static getEventReasonDescription(code) {
    const reason = Object.values(this.EventReasons).find(reason => reason.code === code);
    return reason ? reason.description : null;
  }

  /**
   * Lấy mô tả thống kê hiệp một theo mã
   * @param {number} code - Mã thống kê hiệp một
   * @returns {string|null} Mô tả thống kê hiệp một hoặc null nếu không tìm thấy
   */
  static getHalftimeStatisticDescription(code) {
    const stat = Object.values(this.HalftimeStatistics).find(stat => stat.code === code);
    return stat ? stat.description : null;
  }

  /**
   * Lấy tất cả trạng thái trận đấu
   * @returns {Array} Mảng các trạng thái trận đấu
   */
  static getAllMatchStates() {
    return Object.values(this.MatchStates);
  }

  /**
   * Lấy tất cả thống kê kỹ thuật
   * @returns {Array} Mảng các thống kê kỹ thuật
   */
  static getAllTechnicalStatistics() {
    return Object.values(this.TechnicalStatistics);
  }

  /**
   * Lấy tất cả lý do sự kiện
   * @returns {Array} Mảng các lý do sự kiện
   */
  static getAllEventReasons() {
    return Object.values(this.EventReasons);
  }

  /**
   * Lấy tất cả thống kê hiệp một
   * @returns {Array} Mảng các thống kê hiệp một
   */
  static getAllHalftimeStatistics() {
    return Object.values(this.HalftimeStatistics);
  }

  /**
   * Kiểm tra mã trạng thái trận đấu có hợp lệ không
   * @param {number} code - Mã trạng thái
   * @returns {boolean} True nếu hợp lệ, false nếu không
   */
  static isValidMatchState(code) {
    return Object.values(this.MatchStates).some(state => state.code === code);
  }

  /**
   * Kiểm tra mã thống kê kỹ thuật có hợp lệ không
   * @param {number} code - Mã thống kê
   * @returns {boolean} True nếu hợp lệ, false nếu không
   */
  static isValidTechnicalStatistic(code) {
    return Object.values(this.TechnicalStatistics).some(stat => stat.code === code);
  }

  /**
   * Kiểm tra mã lý do sự kiện có hợp lệ không
   * @param {number} code - Mã lý do sự kiện
   * @returns {boolean} True nếu hợp lệ, false nếu không
   */
  static isValidEventReason(code) {
    return Object.values(this.EventReasons).some(reason => reason.code === code);
  }

  /**
   * Kiểm tra mã thống kê hiệp một có hợp lệ không
   * @param {number} code - Mã thống kê hiệp một
   * @returns {boolean} True nếu hợp lệ, false nếu không
   */
  static isValidHalftimeStatistic(code) {
    return Object.values(this.HalftimeStatistics).some(stat => stat.code === code);
  }
}

module.exports = MatchEnums;
