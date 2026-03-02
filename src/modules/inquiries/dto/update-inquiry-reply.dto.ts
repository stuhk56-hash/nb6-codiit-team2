import { object, size, string, type Infer } from 'superstruct';

export const UpdateInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export type UpdateInquiryReplyDto = Infer<typeof UpdateInquiryReplyBodyStruct>;
