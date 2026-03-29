import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  createCart,
  getCart,
  updateCart,
  getCartItemDetail,
  deleteCartItem,
} from './cart.controller';

export const cartRouter = Router();

// POST /api/cart - 장바구니 생성
cartRouter.post('/', authenticate(), withAsync(createCart));
// GET /api/cart - 장바구니 조회
cartRouter.get('/', authenticate(), withAsync(getCart));
// PATCH /api/cart - 장바구니 수정 (아이템 추가/수량 수정)
cartRouter.patch('/', authenticate(), withAsync(updateCart));

// GET /api/cart/:cartItemId - 장바구니 아이템 상세 조회
cartRouter.get('/:cartItemId', authenticate(), withAsync(getCartItemDetail));

// DELETE /api/cart/:cartItemId - 장바구니 아이템 삭제
cartRouter.delete('/:cartItemId', authenticate(), withAsync(deleteCartItem));
