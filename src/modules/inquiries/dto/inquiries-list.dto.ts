import type { InquiriesResponseDto } from './inquiries-response.dto';

export type InquiriesListDto = {
  list: InquiriesResponseDto[];
  totalCount: number;
};
