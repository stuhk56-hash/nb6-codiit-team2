import { InquiryStatus, Prisma } from '@prisma/client';
import type {
  inquiryAnswerInclude,
  inquiryInclude,
} from '../queries/inquiries.query';

export type InquiryWithRelations = Prisma.InquiryGetPayload<{
  include: typeof inquiryInclude;
}>;

export type InquiryAnswerWithRelations = Prisma.InquiryAnswerGetPayload<{
  include: typeof inquiryAnswerInclude;
}>;

export type InquiriesQuery = {
  page?: number;
  pageSize?: number;
  status?: InquiryStatus;
};

export type NormalizedInquiriesQuery = {
  page: number;
  pageSize: number;
  status?: InquiryStatus;
};

export type InquiriesPageResult = {
  inquiries: InquiryWithRelations[];
  totalCount: number;
};

export type UpdateInquiryRecordInput = {
  title?: string;
  content?: string;
  isSecret?: boolean;
};

export type UpdateInquiryReplyRecordInput = {
  content?: string;
};
