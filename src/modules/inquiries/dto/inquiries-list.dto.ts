import { object, optional, string, type Infer } from 'superstruct';

export const InquiriesListQueryStruct = object({
  page: optional(string()),
  pageSize: optional(string()),
  status: optional(string()),
});

export type InquiriesListQueryDto = Infer<typeof InquiriesListQueryStruct>;
