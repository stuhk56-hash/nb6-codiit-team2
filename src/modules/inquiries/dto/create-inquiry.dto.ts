export interface CreateInquiryDto {
  productId: string;
  title: string;
  content: string;
  isSecret?: boolean;
}
