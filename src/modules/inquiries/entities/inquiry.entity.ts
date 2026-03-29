import { InquiryStatus } from '@prisma/client';

export type InquiryEntity = {
  id: string;
  productId: string;
  buyerId: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
};
