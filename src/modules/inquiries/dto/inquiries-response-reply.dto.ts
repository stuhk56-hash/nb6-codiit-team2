export type InquiriesResponseReplyDto = {
  id: string;
  inquiryId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
};
