import type { InquiryProductDto } from './inquiry-product.dto';

export type InquiryItemDto = {
  id: string;
  title: string;
  isSecret: boolean;
  status: 'WaitingAnswer' | 'CompletedAnswer';
  product: InquiryProductDto;
  user: {
    name: string;
  };
  createdAt: string;
  content: string;
};
