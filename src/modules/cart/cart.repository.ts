import { prisma } from '../../lib/constants/prismaClient';

export class CartRepository {
  findCartByBuyerId(buyerId: string) {
    return prisma.cart.findUnique({
      where: { buyerId },
    });
  }

  findCartByBuyerIdWithItems(buyerId: string) {
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

  createCart(buyerId: string) {
    return prisma.cart.create({
      data: {
        buyerId,
      },
    });
  }

  findCartItem(cartId: string, productId: string, sizeId: number) {
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

  findCartItemById(cartItemId: string) {
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

  addCartItem(
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

  updateCartItemQuantity(cartItemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  deleteCartItem(cartItemId: string) {
    return prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }
}

export const cartRepository = new CartRepository();
