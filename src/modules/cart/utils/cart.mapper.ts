import { Cart, CartItem } from '@prisma/client';
import { CartWithItems, CartItemWithRelations } from '../types/cart.type';
import { CartResponseDto } from '../dto/cart-response.dto';
import { CartWithItemsDto } from '../dto/cart-with-items.dto';
import { CartItemDetailDto } from '../dto/cart-item-detail.dto';
import { CartItemDto } from '../dto/cart-item.dto';

//Cart entity -> 응답 DTO (아이템 없음)
export function toResponseDto(cart: Cart): CartResponseDto {
  return {
    id: cart.id,
    buyerId: cart.buyerId,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export function toCartWithItemsDto(cart: CartWithItems): CartWithItemsDto {
  return {
    id: cart.id,
    buyerId: cart.buyerId,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map(function (item: any) {
      return {
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        product: {
          id: item.product.id,
          storeId: item.product.storeId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.imageUrl,
          discountRate: item.product.discountRate,
          discountStartTime:
            item.product.discountStartTime?.toISOString() || null,
          discountEndTime: item.product.discountEndTime?.toISOString() || null,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
          reviewsRating: 0,
          categoryId: item.product.categoryId,
          content: item.product.content,
          isSoldOut: item.product.isSoldOut,
          store: {
            id: item.product.store.id,
            userId: item.product.store.sellerId,
            name: item.product.store.name,
            address: item.product.store.address,
            phoneNumber: item.product.store.phoneNumber,
            content: item.product.store.content,
            image: item.product.store.imageUrl,
            createdAt: item.product.store.createdAt.toISOString(),
            updatedAt: item.product.store.updatedAt.toISOString(),
            detailAddress: item.product.store.detailAddress,
          },
          stocks: item.product.stocks.map(function (stock: any) {
            return {
              id: stock.id,
              productId: stock.productId,
              sizeId: stock.sizeId,
              quantity: stock.quantity,
              size: {
                id: stock.size.id,
                size: {
                  en: stock.size.nameEn,
                  ko: stock.size.nameKo,
                },
                name: stock.size.name,
              },
            };
          }),
        },
      };
    }),
  };
}

//CartItem 엔티티를 DTO로 변환

export function toCartItemDto(cartItem: CartItem): CartItemDto {
  return {
    id: cartItem.id,
    cartId: cartItem.cartId,
    productId: cartItem.productId,
    sizeId: cartItem.sizeId,
    quantity: cartItem.quantity,
    createdAt: cartItem.createdAt.toISOString(),
    updatedAt: cartItem.updatedAt.toISOString(),
  };
}

export function toCartItemDetailDto(
  cartItem: CartItemWithRelations,
): CartItemDetailDto {
  return {
    id: cartItem.id,
    cartId: cartItem.cartId,
    productId: cartItem.productId,
    sizeId: cartItem.sizeId,
    quantity: cartItem.quantity,
    createdAt: cartItem.createdAt.toISOString(),
    updatedAt: cartItem.updatedAt.toISOString(),
    product: {
      id: cartItem.product.id,
      storeId: cartItem.product.storeId,
      name: cartItem.product.name,
      price: cartItem.product.price,
      image: cartItem.product.imageUrl,
      discountRate: cartItem.product.discountRate,
      discountStartTime:
        cartItem.product.discountStartTime?.toISOString() || null,
      discountEndTime: cartItem.product.discountEndTime?.toISOString() || null,
      createdAt: cartItem.product.createdAt.toISOString(),
      updatedAt: cartItem.product.updatedAt.toISOString(),
    },
    cart: {
      id: cartItem.cart.id,
      buyerId: cartItem.cart.buyerId,
      createdAt: cartItem.cart.createdAt.toISOString(),
      updatedAt: cartItem.cart.updatedAt.toISOString(),
    },
  };
}

//여러 CartItem을 DTO로 변환
export function toCartItemDtos(cartItems: CartItem[]): CartItemDto[] {
  return cartItems.map(function (item) {
    return toCartItemDto(item);
  });
}
