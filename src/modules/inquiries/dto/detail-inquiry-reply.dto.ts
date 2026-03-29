import type { ReplyUserDto } from './reply-user.dto';

export type DetailInquiryReplyDto = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReplyUserDto | null;
};
