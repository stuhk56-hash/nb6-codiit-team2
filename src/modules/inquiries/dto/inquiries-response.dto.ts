import type { InquiriesResponseReplyDto } from './inquiries-response-reply.dto';

export type InquiriesResponseDto = {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  reply: InquiriesResponseReplyDto | null;
};
