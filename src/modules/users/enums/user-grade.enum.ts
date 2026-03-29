/**
 * 유저 등급 명칭을 관리하는 Enum
 * 피그마 UI의 등급 배지 및 혜택 계산에 사용됩니다.
 */
export enum UserGradeName {
  GREEN = 'green',
  SILVER = 'silver',
  GOLD = 'gold',
  VIP = 'vip',
}

/**
 * 데이터베이스에 저장되는 Grade ID (PK) 관리용 Enum
 * 제공해주신 JSON의 "id": "grade_green" 형식을 따릅니다.
 */
export enum UserGradeId {
  GREEN = 'grade_green',
  SILVER = 'grade_silver',
  GOLD = 'grade_gold',
  VIP = 'grade_vip',
}
