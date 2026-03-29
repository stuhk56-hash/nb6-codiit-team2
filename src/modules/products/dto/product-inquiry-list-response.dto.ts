import type { ProductInquiryResponseDto } from './product-inquiry-response.dto';

export type ProductInquiryListResponseDto = {
  list: ProductInquiryResponseDto[];
  totalCount: number;
};
