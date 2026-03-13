export type InquiryReplyResponseDto = {
  id: string;
  inquiryId: string;
  userId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};
