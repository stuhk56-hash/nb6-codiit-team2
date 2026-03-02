import { object, optional, string } from 'superstruct';

export const InquiriesListQueryStruct = object({
  page: optional(string()),
  pageSize: optional(string()),
  status: optional(string()),
});

export type InquiriesListQueryDto = {
  page?: string;
  pageSize?: string;
  status?: string;
};
