import { boolean, object, optional, size, string } from 'superstruct';

export const UpdateInquiryBodyStruct = object({
  title: optional(size(string(), 1, 255)),
  content: optional(size(string(), 1, 5000)),
  isSecret: optional(boolean()),
});

export type UpdateInquiryDto = {
  title?: string;
  content?: string;
  isSecret?: boolean;
};
