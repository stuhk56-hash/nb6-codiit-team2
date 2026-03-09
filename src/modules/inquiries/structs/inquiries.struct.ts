import { boolean, object, optional, size, string } from 'superstruct';

export const inquiryIdParamStruct = object({
  inquiryId: size(string(), 1, 191),
});

export const replyIdParamStruct = object({
  replyId: size(string(), 1, 191),
});

export const createInquiryBodyStruct = object({
  productId: size(string(), 1, 191),
  title: size(string(), 1, 255),
  content: size(string(), 1, 5000),
  isSecret: optional(boolean()),
});

export const updateInquiryBodyStruct = object({
  title: optional(size(string(), 1, 255)),
  content: optional(size(string(), 1, 5000)),
  isSecret: optional(boolean()),
});

export const createInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export const updateInquiryReplyBodyStruct = object({
  content: size(string(), 1, 5000),
});

export const inquiriesListQueryStruct = object({
  page: optional(string()),
  pageSize: optional(string()),
  status: optional(string()),
});
