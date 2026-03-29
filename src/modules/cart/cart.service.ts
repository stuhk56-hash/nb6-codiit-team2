import { cartRepository } from './cart.repository';
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
import {
  resolveCartImages,
  resolveCartItemDetailImage,
} from './utils/cart.service.util';

export class CartService {
  async createCart(buyerId: string): Promise<CartResponseDto> {
    let cart = await cartRepository.findCartByBuyerId(buyerId);

    if (!cart) {
      cart = await cartRepository.createCart(buyerId);
    }

    return toResponseDto(cart);
  }

  async getCart(buyerId: string): Promise<CartWithItemsDto> {
    const cart = await cartRepository.findCartByBuyerIdWithItems(buyerId);

    if (!cart) {
      throw new NotFoundError('장바구니를 찾을 수 없습니다.');
    }

    const resolvedCart = await resolveCartImages(cart);
    return toCartWithItemsDto(resolvedCart);
  }

  async updateCart(
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

    const product = await cartRepository.findProductById(updateDto.productId);
    if (!product) {
      throw new BadRequestError('존재하지 않는 상품입니다.');
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

      let cartItem = await cartRepository.findCartItem(
        cart.id,
        updateDto.productId,
        sizeData.sizeId,
      );

      if (cartItem) {
        cartItem = await cartRepository.updateCartItemQuantity(
          cartItem.id,
          sizeData.quantity,
        );
      } else {
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

  async getCartItemDetail(
    buyerId: string,
    cartItemId: string,
  ): Promise<CartItemDetailDto> {
    if (!cartItemId) {
      throw new BadRequestError('잘못된 요청입니다.');
    }

    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
    }

    if (cartItem.cart.buyerId !== buyerId) {
      throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
    }

    const resolvedCartItem = await resolveCartItemDetailImage(cartItem);
    return toCartItemDetailDto(resolvedCartItem);
  }

  async deleteCartItem(buyerId: string, cartItemId: string): Promise<void> {
    if (!cartItemId) {
      throw new BadRequestError('잘못된 요청입니다.');
    }

    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
    }

    if (cartItem.cart.buyerId !== buyerId) {
      throw new NotFoundError('장바구니 아이템을 찾을 수 없습니다.');
    }

    await cartRepository.deleteCartItem(cartItemId);
  }
}

export const cartService = new CartService();
