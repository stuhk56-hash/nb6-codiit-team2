import { Payment } from '@prisma/client';

export interface PaymentEntity extends Payment {
  // Prisma Payment 타입 그대로 사용
}
