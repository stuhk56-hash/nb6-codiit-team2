import { object, size, string } from 'superstruct';

export const CreateInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export type CreateInquiryReplyDto = {
  content: string;
};
