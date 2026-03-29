import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import { CartItemWithRelations, CartWithItems } from '../types/cart.type';

//합계 계산
export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

//전체 합계 계산
export function calculateTotal(items: any[]): number {
  return items.reduce(function (total, item) {
    return total + item.price * item.quantity;
  }, 0);
}

// //전체 아이템 수 계산
// export function calculateItemCount(items:any[]):number{

// }

export async function resolveCartImages(cart: CartWithItems) {
  await Promise.all(
    cart.items.map(async function (item) {
      item.product.imageUrl = await resolveS3ImageUrl(
        item.product.imageUrl,
        item.product.imageKey,
        '/images/Mask-group.svg',
      );
      item.product.store.imageUrl = await resolveS3ImageUrl(
        item.product.store.imageUrl,
        item.product.store.imageKey,
        '/images/sample-store.png',
      );
    }),
  );

  return cart;
}

export async function resolveCartItemDetailImage(
  cartItem: CartItemWithRelations,
) {
  cartItem.product.imageUrl = await resolveS3ImageUrl(
    cartItem.product.imageUrl,
    cartItem.product.imageKey,
    '/images/Mask-group.svg',
  );

  return cartItem;
}
