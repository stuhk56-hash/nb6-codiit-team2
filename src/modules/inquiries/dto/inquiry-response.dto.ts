import type { DetailInquiryReplyDto } from './detail-inquiry-reply.dto';

export type InquiryResponseDto = {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  reply?: DetailInquiryReplyDto | null;
};
