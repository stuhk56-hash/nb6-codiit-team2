import { Prisma } from '@prisma/client';
//Record<string, never> 아무 select/include 옵션도 없는 빈 args 객체, 아무 속성도 없는 객체 타입처럼 쓰기 위한 타입 설정
//{} 보다 더 엄격한 설정, {}는 모든 속성을 허용하지만 Record<string, never>는 어떤 속성도 허용하지 않음
export type GradeRow = Prisma.GradeGetPayload<Record<string, never>>;
