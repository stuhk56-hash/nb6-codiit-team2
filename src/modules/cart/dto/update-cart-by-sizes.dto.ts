import { SizeQuantityDto } from './size-quantity.dto';

//여러 사이즈의 수량 업데이트 요청
export interface UpdateCartBySizesDto {
  productId: string;
  sizes: SizeQuantityDto[];
}
