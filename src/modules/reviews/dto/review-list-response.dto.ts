import type { ReviewListResponseMetaDto } from './review-list-response-meta.dto';
import type { ReviewResponseDto } from './review-response.dto';

export type ReviewListResponseDto = {
  items: ReviewResponseDto[];
  meta: ReviewListResponseMetaDto;
};
