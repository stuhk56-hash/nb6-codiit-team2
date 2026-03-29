import { Response } from 'express';
import { cartService } from './cart.service';
import { UpdateCartBySizesDto } from './dto/update-cart-by-sizes.dto';
import { UpdateCartStruct } from './structs/cart.struct';
import { assert } from 'superstruct';
import { AuthenticatedRequest } from '../../types/auth-request.type';
import { requireBuyer } from '../../lib/request/auth-user';

//POST /api/cart 장바구니 생성
export async function createCart(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const cart = await cartService.createCart(buyerId);
  return res.status(201).send(cart);
}

//GET /api/cart 장바구니 조회
export async function getCart(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const cart = await cartService.getCart(buyerId);
  return res.status(200).send(cart);
}

//PATCH /api/cart 장바구니 수정
export async function updateCart(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const updateDto: UpdateCartBySizesDto = req.body;

  assert(updateDto, UpdateCartStruct);

  const items = await cartService.updateCart(buyerId, updateDto);
  return res.status(200).send(items);
}

//GET /api/cart/{cartItemId}
//장바구니 상세 조회
export async function getCartItemDetail(
  req: AuthenticatedRequest,
  res: Response,
) {
  const buyerId = requireBuyer(req.user).id;
  const { cartItemId } = req.params;
  const cartItem = await cartService.getCartItemDetail(buyerId, cartItemId);
  return res.status(200).send(cartItem);
}

//DELETE /api/cart/{cartItemId}
//장바구니 아이템 삭제
export async function deleteCartItem(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { cartItemId } = req.params;
  await cartService.deleteCartItem(buyerId, cartItemId);
  return res.status(204).send();
}
