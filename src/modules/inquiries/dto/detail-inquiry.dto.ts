import type { DetailInquiryReplyDto } from './detail-inquiry-reply.dto';

export type DetailInquiryDto = {
  id: string;
  title: string;
  content: string;
  status: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  reply: DetailInquiryReplyDto | null;
};
