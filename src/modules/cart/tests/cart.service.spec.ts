import { prisma } from '../../../lib/constants/prismaClient';
import * as cartService from '../cart.service';
import * as cartRepository from '../cart.repository';
import {
  NotFoundError,
  BadRequestError,
} from '../../../lib/errors/customErrors';

jest.mock('../cart.repository');

describe('장바구니 서비스 유닛 테스트', () => {
  const mockedRepository = cartRepository as jest.Mocked<typeof cartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCart - 장바구니 생성', () => {
    test('새로운 장바구니를 생성한다', async () => {
      const buyerId = 'buyer-123';
      const now = new Date();
      const mockCart = {
        id: 'cart-123',
        buyerId,
        createdAt: now,
        updatedAt: now,
      };

      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(null);
      (mockedRepository.createCart as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.createCart(buyerId);

      expect(result).toEqual({
        id: 'cart-123',
        buyerId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      expect(mockedRepository.findCartByBuyerId).toHaveBeenCalledWith(buyerId);
      expect(mockedRepository.createCart).toHaveBeenCalledWith(buyerId);
    });

    test('이미 존재하는 장바구니는 반환한다', async () => {
      const buyerId = 'buyer-123';
      const now = new Date();
      const existingCart = {
        id: 'cart-123',
        buyerId,
        createdAt: now,
        updatedAt: now,
      };

      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(
        existingCart,
      );

      const result = await cartService.createCart(buyerId);

      expect(result).toEqual({
        id: 'cart-123',
        buyerId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      expect(mockedRepository.createCart).not.toHaveBeenCalled();
    });
  });

  describe('getCart - 장바구니 조회', () => {
    test('아이템을 포함한 장바구니를 반환한다', async () => {
      const buyerId = 'buyer-123';
      const mockCart = {
        id: 'cart-123',
        buyerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            cartId: 'cart-123',
            productId: 'prod-1',
            sizeId: 1,
            quantity: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: {
              id: 'prod-1',
              storeId: 'store-1',
              name: 'Product 1',
              price: 20000,
              image: null,
              discountRate: null,
              discountStartTime: null,
              discountEndTime: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              reviewsRating: 4.5,
              categoryId: 'cat-1',
              content: 'Product content',
              isSoldOut: false,
              store: {
                id: 'store-1',
                userId: 'seller-1',
                name: 'Store 1',
                address: 'Address',
                phoneNumber: '010-1234-5678',
                content: 'Store content',
                image: 'https://example.com/store.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                detailAddress: '101호',
              },
              stocks: [
                {
                  id: 'stock-1',
                  productId: 'prod-1',
                  sizeId: 1,
                  quantity: 100,
                  size: {
                    id: 1,
                    size: { en: 'M', ko: '미디움' },
                    name: 'M',
                  },
                },
              ],
            },
          },
        ],
      };

      (
        mockedRepository.findCartByBuyerIdWithItems as jest.Mock
      ).mockResolvedValue(mockCart);

      const result = await cartService.getCart(buyerId);

      expect(result).toHaveProperty('id', 'cart-123');
      expect(result.items).toHaveLength(1);
      expect(mockedRepository.findCartByBuyerIdWithItems).toHaveBeenCalledWith(
        buyerId,
      );
    });

    test('장바구니가 없으면 NotFoundError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      (
        mockedRepository.findCartByBuyerIdWithItems as jest.Mock
      ).mockResolvedValue(null);

      await expect(cartService.getCart(buyerId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateCart - 장바구니 상품 추가/수정', () => {
    test('상품을 장바구니에 추가한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'prod-123',
        sizes: [{ sizeId: 1, quantity: 2 }],
      };

      const mockProduct = { id: 'prod-123', name: 'Test Product' };
      const mockCart = { id: 'cart-123', buyerId };
      const mockCartItem = {
        id: 'item-1',
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockedRepository.findProductById as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(
        mockCart,
      );
      (mockedRepository.findCartItem as jest.Mock).mockResolvedValue(null);
      (mockedRepository.addCartItem as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      const result = await cartService.updateCart(buyerId, updateDto);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('productId', 'prod-123');
      expect(mockedRepository.addCartItem).toHaveBeenCalled();
    });

    test('이미 존재하는 상품이면 수량을 업데이트한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'prod-123',
        sizes: [{ sizeId: 1, quantity: 5 }],
      };

      const mockProduct = { id: 'prod-123', name: 'Test Product' };
      const mockCart = { id: 'cart-123', buyerId };
      const existingItem = {
        id: 'item-1',
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedItem = { ...existingItem, quantity: 5 };

      (mockedRepository.findProductById as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(
        mockCart,
      );
      (mockedRepository.findCartItem as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockedRepository.updateCartItemQuantity as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await cartService.updateCart(buyerId, updateDto);

      expect(result[0].quantity).toBe(5);
      expect(mockedRepository.updateCartItemQuantity).toHaveBeenCalledWith(
        'item-1',
        5,
      );
    });

    test('productId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: '',
        sizes: [{ sizeId: 1, quantity: 2 }],
      };

      await expect(cartService.updateCart(buyerId, updateDto)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('sizes 배열이 비어있으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'prod-123',
        sizes: [],
      };

      await expect(cartService.updateCart(buyerId, updateDto)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('존재하지 않는 상품이면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'non-exist-product',
        sizes: [{ sizeId: 1, quantity: 1 }],
      };

      (mockedRepository.findProductById as jest.Mock).mockResolvedValue(null);

      await expect(cartService.updateCart(buyerId, updateDto)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('수량이 0 이하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'prod-123',
        sizes: [{ sizeId: 1, quantity: 0 }],
      };

      const mockProduct = { id: 'prod-123', name: 'Test Product' };
      const mockCart = { id: 'cart-123', buyerId };

      (mockedRepository.findProductById as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(
        mockCart,
      );

      await expect(cartService.updateCart(buyerId, updateDto)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('수량이 999를 초과하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateDto = {
        productId: 'prod-123',
        sizes: [{ sizeId: 1, quantity: 1000 }],
      };

      const mockProduct = { id: 'prod-123', name: 'Test Product' };
      const mockCart = { id: 'cart-123', buyerId };

      (mockedRepository.findProductById as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockedRepository.findCartByBuyerId as jest.Mock).mockResolvedValue(
        mockCart,
      );

      await expect(cartService.updateCart(buyerId, updateDto)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('getCartItemDetail - 장바구니 아이템 상세 조회', () => {
    test('아이템 상세 정보를 반환한다', async () => {
      const cartItemId = 'item-123';
      const buyerId = 'buyer-123';
      const mockCartItem = {
        id: cartItemId,
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 'prod-123',
          storeId: 'store-1',
          name: 'Test Product',
          price: 20000,
          image: 'https://example.com/product.jpg',
          discountRate: null,
          discountStartTime: null,
          discountEndTime: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        cart: {
          id: 'cart-123',
          buyerId: buyerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        size: { id: 1, name: 'M', nameEn: 'M', nameKo: '미디움' },
      };

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      const result = await cartService.getCartItemDetail(buyerId, cartItemId);

      expect(result).toHaveProperty('id', cartItemId);
      expect(result).toHaveProperty('product');
      expect(mockedRepository.findCartItemById).toHaveBeenCalledWith(
        cartItemId,
      );
    });

    test('아이템이 없으면 NotFoundError를 throw한다', async () => {
      const cartItemId = 'invalid-item';
      const buyerId = 'buyer-123';

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(null);

      await expect(
        cartService.getCartItemDetail(buyerId, cartItemId),
      ).rejects.toThrow(NotFoundError);
    });

    test('cartItemId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(cartService.getCartItemDetail(buyerId, '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('다른 구매자의 아이템이면 NotFoundError를 throw한다', async () => {
      const cartItemId = 'item-123';
      const buyerId = 'buyer-123';
      const otherBuyerId = 'buyer-456';

      const mockCartItem = {
        id: cartItemId,
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 'prod-123',
          storeId: 'store-1',
          name: 'Test Product',
          price: 20000,
          image: 'https://example.com/product.jpg',
          discountRate: null,
          discountStartTime: null,
          discountEndTime: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        cart: {
          id: 'cart-123',
          buyerId: otherBuyerId, // 다른 구매자의 장바구니
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        size: { id: 1, name: 'M', nameEn: 'M', nameKo: '미디움' },
      };

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      await expect(
        cartService.getCartItemDetail(buyerId, cartItemId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCartItem - 장바구니 아이템 삭제', () => {
    test('아이템을 삭제한다', async () => {
      const cartItemId = 'item-123';
      const buyerId = 'buyer-123';
      const mockCartItem = {
        id: cartItemId,
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        cart: {
          id: 'cart-123',
          buyerId: buyerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(
        mockCartItem,
      );
      (mockedRepository.deleteCartItem as jest.Mock).mockResolvedValue(true);

      await expect(
        cartService.deleteCartItem(buyerId, cartItemId),
      ).resolves.not.toThrow();
      expect(mockedRepository.deleteCartItem).toHaveBeenCalledWith(cartItemId);
    });

    test('아이템이 없으면 NotFoundError를 throw한다', async () => {
      const cartItemId = 'invalid-item';
      const buyerId = 'buyer-123';

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(null);

      await expect(
        cartService.deleteCartItem(buyerId, cartItemId),
      ).rejects.toThrow(NotFoundError);
    });

    test('cartItemId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(cartService.deleteCartItem(buyerId, '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('다른 구매자의 아이템이면 NotFoundError를 throw한다', async () => {
      const cartItemId = 'item-123';
      const buyerId = 'buyer-123';
      const otherBuyerId = 'buyer-456';

      const mockCartItem = {
        id: cartItemId,
        cartId: 'cart-123',
        productId: 'prod-123',
        sizeId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        cart: {
          id: 'cart-123',
          buyerId: otherBuyerId, // 다른 구매자의 장바구니
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (mockedRepository.findCartItemById as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      await expect(
        cartService.deleteCartItem(buyerId, cartItemId),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
