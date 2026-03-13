import type { InquiryStoreDto } from './inquiry-store.dto';

export type InquiryProductDto = {
  id: string;
  name: string;
  image: string;
  store: InquiryStoreDto;
};
