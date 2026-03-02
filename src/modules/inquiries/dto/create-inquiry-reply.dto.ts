import { object, size, string, type Infer } from 'superstruct';

export const CreateInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export type CreateInquiryReplyDto = Infer<typeof CreateInquiryReplyBodyStruct>;
