import { object, size, string } from 'superstruct';

export const UpdateInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export type UpdateInquiryReplyDto = {
  content: string;
};
