import * as cartRepository from './cart.repository';
import {
  toResponseDto,
  toCartWithItemsDto,
  toCartItemDetailDto,
  toCartItemDto,
} from './utils/cart.mapper';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartWithItemsDto } from './dto/cart-with-items.dto';
import { CartItemDetailDto } from './dto/cart-item-detail.dto';
import { CartItemDto } from './dto/cart-item.dto';
import { UpdateCartBySizesDto } from './dto/update-cart-by-sizes.dto';
import { NotFoundError, BadRequestError } from '../../lib/errors/customErrors';

// 장바구니 생성
export async function createCart(buyerId: string): Promise<CartResponseDto> {
  let cart = await cartRepository.findCartByBuyerId(buyerId);

  if (!cart) {
    cart = await cartRepository.createCart(buyerId);
  }

  return toResponseDto(cart);
}

//장바구니 조회 (아이템 포함)
export async function getCart(buyerId: string): Promise<CartWithItemsDto> {
  const cart = await cartRepository.findCartByBuyerIdWithItems(buyerId);

  if (!cart) {
    throw new NotFoundError('장바구니를 찾을 수 없습니다.');
  }

  return toCartWithItemsDto(cart);
}

//장바구니에 상품 추가 또는 수량 수정
export async function updateCart(
  buyerId: string,
  updateDto: UpdateCartBySizesDto,
): Promise<CartItemDto[]> {
  if (
    !updateDto.productId ||
    !Array.isArray(updateDto.sizes) ||
    updateDto.sizes.length === 0
  ) {
    throw new BadRequestError('잘못된 요청입니다.');
  }

  const cart = await cartRepository.findCartByBuyerId(buyerId);

  if (!cart) {
    throw new NotFoundError('장바구니를 찾을 수 없습니다.');
  }

  const updatedItems: CartItemDto[] = [];

  for (const sizeData of updateDto.sizes) {
    if (
      !Number.isInteger(sizeData.quantity) ||
      sizeData.quantity <= 0 ||
      sizeData.quantity > 999
    ) {
      throw new BadRequestError('유효하지 않은 수량입니다.');
    }

    // 기존 아이템 찾기
    let cartItem = await cartRepository.findCartItem(
      cart.id,
      updateDto.productId,
      sizeData.sizeId,
    );

    if (cartItem) {
      // 수량 업데이트
      cartItem = await cartRepository.updateCartItemQuantity(
        cartItem.id,
        sizeData.quantity,
      );
    } else {
      // 새 아이템 추가
      cartItem = await cartRepository.addCartItem(
        cart.id,
        updateDto.productId,
        sizeData.sizeId,
        sizeData.quantity,
      );
    }

    updatedItems.push(toCartItemDto(cartItem));
  }

  return updatedItems;
}

//장바구니 아이템 상세 조회

export async function getCartItemDetail(
  cartItemId: string,
): Promise<CartItemDetailDto> {
  if (!cartItemId) {
    throw new BadRequestError('잘못된 요청입니다.');
  }

  const cartItem = await cartRepository.findCartItemById(cartItemId);

  if (!cartItem) {
    throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
  }

  return toCartItemDetailDto(cartItem);
}

//장바구니 아이템 삭제

export async function deleteCartItem(cartItemId: string): Promise<void> {
  if (!cartItemId) {
    throw new BadRequestError('잘못된 요청입니다.');
  }

  const cartItem = await cartRepository.findCartItemById(cartItemId);

  if (!cartItem) {
    throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
  }

  await cartRepository.deleteCartItem(cartItemId);
}
