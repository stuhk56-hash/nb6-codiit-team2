import {
  toResponseDto,
  toCartWithItemsDto,
  toCartItemDto,
  toCartItemDetailDto,
  toCartItemDtos,
} from '../utils/cart.mapper';

const baseDate = new Date('2026-01-01T00:00:00.000Z');

describe('cart.mapper', () => {
  // ─── toResponseDto ───
  describe('toResponseDto', () => {
    test('Cart 엔티티를 DTO로 변환한다', () => {
      const cart = {
        id: 'cart-1',
        buyerId: 'buyer-1',
        createdAt: baseDate,
        updatedAt: baseDate,
      } as any;

      const dto = toResponseDto(cart);

      expect(dto.id).toBe('cart-1');
      expect(dto.buyerId).toBe('buyer-1');
      expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  // ─── toCartItemDto ───
  describe('toCartItemDto', () => {
    test('CartItem 엔티티를 DTO로 변환한다', () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        sizeId: 1,
        quantity: 3,
        createdAt: baseDate,
        updatedAt: baseDate,
      } as any;

      const dto = toCartItemDto(cartItem);

      expect(dto.id).toBe('item-1');
      expect(dto.cartId).toBe('cart-1');
      expect(dto.quantity).toBe(3);
      expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  // ─── toCartItemDtos ───
  describe('toCartItemDtos', () => {
    test('여러 CartItem을 DTO 배열로 변환한다', () => {
      const items = [
        {
          id: 'item-1',
          cartId: 'cart-1',
          productId: 'p1',
          sizeId: 1,
          quantity: 1,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
        {
          id: 'item-2',
          cartId: 'cart-1',
          productId: 'p2',
          sizeId: 2,
          quantity: 2,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
      ] as any[];

      const dtos = toCartItemDtos(items);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe('item-1');
      expect(dtos[1].id).toBe('item-2');
    });

    test('빈 배열이면 빈 배열을 반환한다', () => {
      const dtos = toCartItemDtos([]);
      expect(dtos).toEqual([]);
    });
  });

  // ─── toCartItemDetailDto ───
  describe('toCartItemDetailDto', () => {
    test('CartItem 상세를 DTO로 변환한다', () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        sizeId: 1,
        quantity: 3,
        createdAt: baseDate,
        updatedAt: baseDate,
        product: {
          id: 'product-1',
          storeId: 'store-1',
          name: '상품',
          price: 10000,
          imageUrl: 'https://example.com/img.jpg',
          discountRate: 10,
          discountStartTime: baseDate,
          discountEndTime: baseDate,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
        cart: {
          id: 'cart-1',
          buyerId: 'buyer-1',
          createdAt: baseDate,
          updatedAt: baseDate,
        },
      } as any;

      const dto = toCartItemDetailDto(cartItem);

      expect(dto.id).toBe('item-1');
      expect(dto.product.name).toBe('상품');
      expect(dto.product.image).toBe('https://example.com/img.jpg');
      expect(dto.product.discountRate).toBe(10);
      expect(dto.product.discountStartTime).toBe('2026-01-01T00:00:00.000Z');
      expect(dto.product.discountEndTime).toBe('2026-01-01T00:00:00.000Z');
      expect(dto.cart.buyerId).toBe('buyer-1');
    });

    test('discountStartTime/discountEndTime이 null이면 null을 반환한다', () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        sizeId: 1,
        quantity: 3,
        createdAt: baseDate,
        updatedAt: baseDate,
        product: {
          id: 'product-1',
          storeId: 'store-1',
          name: '상품',
          price: 10000,
          imageUrl: null,
          discountRate: null,
          discountStartTime: null,
          discountEndTime: null,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
        cart: {
          id: 'cart-1',
          buyerId: 'buyer-1',
          createdAt: baseDate,
          updatedAt: baseDate,
        },
      } as any;

      const dto = toCartItemDetailDto(cartItem);

      expect(dto.product.discountStartTime).toBeNull();
      expect(dto.product.discountEndTime).toBeNull();
      expect(dto.product.discountRate).toBeNull();
    });
  });

  // ─── toCartWithItemsDto ───
  describe('toCartWithItemsDto', () => {
    test('장바구니와 아이템을 DTO로 변환한다', () => {
      const cart = {
        id: 'cart-1',
        buyerId: 'buyer-1',
        createdAt: baseDate,
        updatedAt: baseDate,
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'product-1',
            sizeId: 1,
            quantity: 2,
            createdAt: baseDate,
            updatedAt: baseDate,
            product: {
              id: 'product-1',
              storeId: 'store-1',
              name: '상품',
              price: 10000,
              imageUrl: 'https://example.com/img.jpg',
              discountRate: null,
              discountStartTime: null,
              discountEndTime: null,
              categoryId: 'cat-1',
              content: '설명',
              isSoldOut: false,
              createdAt: baseDate,
              updatedAt: baseDate,
              store: {
                id: 'store-1',
                sellerId: 'seller-1',
                name: '스토어',
                address: '서울시',
                phoneNumber: '010-1234-5678',
                content: '스토어 설명',
                imageUrl: null,
                createdAt: baseDate,
                updatedAt: baseDate,
                detailAddress: '1층',
              },
              stocks: [
                {
                  id: 'stock-1',
                  productId: 'product-1',
                  sizeId: 1,
                  quantity: 100,
                  size: {
                    id: 1,
                    name: 'M',
                    nameEn: 'Medium',
                    nameKo: '중간',
                  },
                },
              ],
            },
          },
        ],
      } as any;

      const dto = toCartWithItemsDto(cart);

      expect(dto.id).toBe('cart-1');
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0].product.name).toBe('상품');
      expect(dto.items[0].product.store.userId).toBe('seller-1');
      expect(dto.items[0].product.stocks[0].size.size.en).toBe('Medium');
      expect(dto.items[0].product.stocks[0].size.size.ko).toBe('중간');
    });

    test('아이템이 없으면 빈 배열을 반환한다', () => {
      const cart = {
        id: 'cart-1',
        buyerId: 'buyer-1',
        createdAt: baseDate,
        updatedAt: baseDate,
        items: [],
      } as any;

      const dto = toCartWithItemsDto(cart);

      expect(dto.items).toEqual([]);
    });
  });
});
