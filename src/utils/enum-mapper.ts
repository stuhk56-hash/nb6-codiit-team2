// TODO) Enum-Mapper: Prisma enum과 API 값 매핑 유틸
/**
 * @index
 * 1) Prisma Enums
 * 2) inverse 헬퍼
 * 3) CAR_STATUS_API_TO_DB
 * 4) CAR_STATUS_DB_TO_API
 * 5) CONTRACT_STATUS_API_TO_DB
 * 6) CONTRACT_STATUS_DB_TO_API
 * 7) GENDER_API_TO_DB
 * 8) GENDER_DB_TO_API
 * 9) AGE_GROUP_API_TO_DB
 * 10) AGE_GROUP_DB_TO_API
 * 11) REGION_API_TO_DB
 * 12) REGION_DB_TO_API
 * 13) CAR_TYPE_LABEL_MAP
 * 14) mapEnumValue
 */

// 1) Prisma Enums
import {
  AgeGroup,
  CarStatus,
  CarType,
  ContractStatus,
  Gender,
  Region,
} from '@prisma/client';

// 2) inverse 헬퍼
const inverse = <T extends Record<string, string | number>>(
  obj: T
): Record<T[keyof T], keyof T> =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<T[keyof T], keyof T>
  );

// 3) CAR_STATUS_API_TO_DB
export const CAR_STATUS_API_TO_DB: Record<
  'possession' | 'contractProceeding' | 'contractCompleted',
  CarStatus
> = {
  possession: CarStatus.POSSESSION,
  contractProceeding: CarStatus.CONTRACT_PROCEEDING,
  contractCompleted: CarStatus.CONTRACT_COMPLETED,
};

// 4) CAR_STATUS_DB_TO_API
export const CAR_STATUS_DB_TO_API = inverse(CAR_STATUS_API_TO_DB);

// 5) CONTRACT_STATUS_API_TO_DB
export const CONTRACT_STATUS_API_TO_DB: Record<
  | 'carInspection'
  | 'priceNegotiation'
  | 'contractDraft'
  | 'contractSuccessful'
  | 'contractFailed',
  ContractStatus
> = {
  carInspection: ContractStatus.CAR_INSPECTION,
  priceNegotiation: ContractStatus.PRICE_NEGOTIATION,
  contractDraft: ContractStatus.CONTRACT_DRAFT,
  contractSuccessful: ContractStatus.CONTRACT_SUCCESSFUL,
  contractFailed: ContractStatus.CONTRACT_FAILED,
};

// 6) CONTRACT_STATUS_DB_TO_API
export const CONTRACT_STATUS_DB_TO_API = inverse(CONTRACT_STATUS_API_TO_DB);

// 7) GENDER_API_TO_DB
export const GENDER_API_TO_DB: Record<'male' | 'female', Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
};

// 8) GENDER_DB_TO_API
export const GENDER_DB_TO_API = inverse(GENDER_API_TO_DB);

// 9) AGE_GROUP_API_TO_DB
export const AGE_GROUP_API_TO_DB: Record<
  '10대' | '20대' | '30대' | '40대' | '50대' | '60대' | '70대' | '80대',
  AgeGroup
> = {
  '10대': AgeGroup.TEEN_10,
  '20대': AgeGroup.TWENTIES_20,
  '30대': AgeGroup.THIRTIES_30,
  '40대': AgeGroup.FORTIES_40,
  '50대': AgeGroup.FIFTIES_50,
  '60대': AgeGroup.SIXTIES_60,
  '70대': AgeGroup.SEVENTIES_70,
  '80대': AgeGroup.EIGHTIES_80,
};

// 10) AGE_GROUP_DB_TO_API
export const AGE_GROUP_DB_TO_API = inverse(AGE_GROUP_API_TO_DB);

// 11) REGION_API_TO_DB
export const REGION_API_TO_DB: Record<
  | '서울'
  | '경기'
  | '인천'
  | '강원'
  | '충북'
  | '충남'
  | '세종'
  | '대전'
  | '전북'
  | '전남'
  | '광주'
  | '경북'
  | '경남'
  | '대구'
  | '울산'
  | '부산'
  | '제주',
  Region
> = {
  서울: Region.SEOUL,
  경기: Region.GYEONGGI,
  인천: Region.INCHEON,
  강원: Region.GANGWON,
  충북: Region.CHUNGBUK,
  충남: Region.CHUNGNAM,
  세종: Region.SEJONG,
  대전: Region.DAEJEON,
  전북: Region.JEONBUK,
  전남: Region.JEONNAM,
  광주: Region.GWANGJU,
  경북: Region.GYEONGBUK,
  경남: Region.GYEONGNAM,
  대구: Region.DAEGU,
  울산: Region.ULSAN,
  부산: Region.BUSAN,
  제주: Region.JEJU,
};

// 12) REGION_DB_TO_API
export const REGION_DB_TO_API = inverse(REGION_API_TO_DB);

// 13) CAR_TYPE_LABEL_MAP (명세 예시에 맞춘 사용자 노출용)
export const CAR_TYPE_LABEL_MAP: Record<CarType, string> = {
  [CarType.COMPACT]: '경차',
  [CarType.MID_SIZE]: '세단',
  [CarType.LARGE]: '대형',
  [CarType.SPORTS_CAR]: '스포츠카',
  [CarType.SUV]: 'SUV',
};

// 13-1) CAR_TYPE_DASHBOARD_LABEL_MAP (대시보드 명세용)
export const CAR_TYPE_DASHBOARD_LABEL_MAP: Record<CarType, string> = {
  [CarType.COMPACT]: '경·소형',
  [CarType.MID_SIZE]: '준중·중형',
  [CarType.LARGE]: '대형',
  [CarType.SPORTS_CAR]: '스포츠카',
  [CarType.SUV]: 'SUV',
};

// 14) mapEnumValue
export const mapEnumValue = <
  MapType extends Record<PropertyKey, PropertyKey>,
  Key extends keyof MapType,
>(
  map: MapType,
  value: Key | null | undefined
): MapType[Key] | null | undefined => {
  if (value === undefined || value === null) return undefined;
  return map[value] ?? null;
};
