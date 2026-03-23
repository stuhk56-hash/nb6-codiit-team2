import { prisma } from '../../lib/constants/prismaClient';

//buyerId로 장바구니 조회
export async function findCartByBuyerId(buyerId: string) {
  return prisma.cart.findUnique({
    where: { buyerId },
  });
}

//buyerId로 장바구니 조회 (아이템 포함)
export async function findCartByBuyerIdWithItems(buyerId: string) {
  return prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true,
              stocks: {
                include: {
                  size: true,
                },
              },
            },
          },
          size: true,
          cart: true,
        },
      },
    },
  });
}

//장바구니 생성

export async function createCart(buyerId: string) {
  return prisma.cart.create({
    data: {
      buyerId,
    },
  });
}

//장바구니에서 아이템 찾기 (cartId, productId, sizeId로 unique 조합)

export async function findCartItem(
  cartId: string,
  productId: string,
  sizeId: number,
) {
  return prisma.cartItem.findUnique({
    where: {
      cartId_productId_sizeId: {
        cartId,
        productId,
        sizeId,
      },
    },
  });
}

//cartItemId로 아이템 찾기 (상세 정보 포함)

export async function findCartItemById(cartItemId: string) {
  return prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: {
        include: {
          store: true,
          stocks: {
            include: {
              size: true,
            },
          },
        },
      },
      cart: true,
      size: true,
    },
  });
}

//장바구니에 아이템 추가

export async function addCartItem(
  cartId: string,
  productId: string,
  sizeId: number,
  quantity: number,
) {
  return prisma.cartItem.create({
    data: {
      cartId,
      productId,
      sizeId,
      quantity,
    },
  });
}

// 장바구니 아이템 수량 업데이트

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
) {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

//장바구니 아이템 삭제

export async function deleteCartItem(cartItemId: string) {
  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

// 상품 존재 여부 확인
export async function findProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
  });
}
