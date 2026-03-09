import type { InquiryStatus } from '@prisma/client';

export type InquiryRole = 'BUYER' | 'SELLER' | 'ADMIN';

export type AuthUser = {
  id: string | number;
  role?: InquiryRole;
};

export type InquiriesListFilter = {
  userId: string;
  role: InquiryRole;
  page: number;
  pageSize: number;
  status?: InquiryStatus;
};

export type InquiryReplyPayload = {
  content: string;
};
