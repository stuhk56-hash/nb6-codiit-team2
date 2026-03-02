import { boolean, object, optional, size, string } from 'superstruct';

export const CreateInquiryBodyStruct = object({
  productId: size(string(), 1, 191),
  title: size(string(), 1, 255),
  content: size(string(), 1, 5000),
  isSecret: optional(boolean()),
});

export type CreateInquiryDto = {
  productId: string;
  title: string;
  content: string;
  isSecret?: boolean;
};
