import type { InquiryItemDto } from './inquiry-item.dto';

export type InquiryListResponseDto = {
  list: InquiryItemDto[];
  totalCount: number;
};
