import { CartService } from '../cart.service';
import { cartRepository } from '../cart.repository';
import * as cartMapper from '../utils/cart.mapper';
import * as cartServiceUtil from '../utils/cart.service.util';
import {
  NotFoundError,
  BadRequestError,
} from '../../../lib/errors/customErrors';

jest.mock('../cart.repository');
jest.mock('../utils/cart.mapper');
jest.mock('../utils/cart.service.util');

const service = new CartService();
const mockRepo = cartRepository as jest.Mocked<typeof cartRepository>;

const mockCart = {
  id: 'cart-1',
  buyerId: 'buyer-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartDto = {
  id: 'cart-1',
  buyerId: 'buyer-1',
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

const mockCartItem = {
  id: 'item-1',
  cartId: 'cart-1',
  productId: 'product-1',
  sizeId: 1,
  quantity: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartItemDto = {
  id: 'item-1',
  cartId: 'cart-1',
  productId: 'product-1',
  sizeId: 1,
  quantity: 3,
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

const mockCartItemWithRelations = {
  ...mockCartItem,
  cart: { ...mockCart, buyerId: 'buyer-1' },
  product: {
    id: 'product-1',
    storeId: 'store-1',
    name: '상품',
    price: 10000,
    imageUrl: null,
    imageKey: null,
    store: { id: 'store-1' },
    stocks: [],
  },
  size: { id: 1, name: 'M', nameEn: 'Medium', nameKo: '중간' },
};

beforeEach(() => {
  jest.clearAllMocks();
  (cartMapper.toResponseDto as jest.Mock).mockReturnValue(mockCartDto);
  (cartMapper.toCartItemDto as jest.Mock).mockReturnValue(mockCartItemDto);
  (cartMapper.toCartWithItemsDto as jest.Mock).mockReturnValue({
    ...mockCartDto,
    items: [],
  });
  (cartMapper.toCartItemDetailDto as jest.Mock).mockReturnValue(
    mockCartItemDto,
  );
});

describe('CartService', () => {
  // ─── createCart ───
  describe('createCart', () => {
    test('장바구니가 없으면 새로 생성한다', async () => {
      mockRepo.findCartByBuyerId.mockResolvedValue(null);
      mockRepo.createCart.mockResolvedValue(mockCart as any);

      const result = await service.createCart('buyer-1');

      expect(mockRepo.createCart).toHaveBeenCalledWith('buyer-1');
      expect(result).toEqual(mockCartDto);
    });

    test('장바구니가 이미 있으면 기존 장바구니를 반환한다', async () => {
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);

      const result = await service.createCart('buyer-1');

      expect(mockRepo.createCart).not.toHaveBeenCalled();
      expect(result).toEqual(mockCartDto);
    });
  });

  // ─── getCart ───
  describe('getCart', () => {
    test('장바구니를 정상적으로 반환한다', async () => {
      const cartWithItems = { ...mockCart, items: [] };
      mockRepo.findCartByBuyerIdWithItems.mockResolvedValue(
        cartWithItems as any,
      );
      (cartServiceUtil.resolveCartImages as jest.Mock).mockResolvedValue(
        cartWithItems,
      );

      const result = await service.getCart('buyer-1');

      expect(mockRepo.findCartByBuyerIdWithItems).toHaveBeenCalledWith(
        'buyer-1',
      );
      expect(result).toHaveProperty('items');
    });

    test('장바구니가 없으면 NotFoundError를 던진다', async () => {
      mockRepo.findCartByBuyerIdWithItems.mockResolvedValue(null);

      await expect(service.getCart('buyer-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── updateCart ───
  describe('updateCart', () => {
    test('새 아이템을 추가한다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);
      mockRepo.findCartItem.mockResolvedValue(null);
      mockRepo.addCartItem.mockResolvedValue(mockCartItem as any);

      const result = await service.updateCart('buyer-1', {
        productId: 'product-1',
        sizes: [{ sizeId: 1, quantity: 3 }],
      });

      expect(mockRepo.addCartItem).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    test('기존 아이템의 수량을 업데이트한다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);
      mockRepo.findCartItem.mockResolvedValue(mockCartItem as any);
      mockRepo.updateCartItemQuantity.mockResolvedValue({
        ...mockCartItem,
        quantity: 10,
      } as any);

      const result = await service.updateCart('buyer-1', {
        productId: 'product-1',
        sizes: [{ sizeId: 1, quantity: 10 }],
      });

      expect(mockRepo.updateCartItemQuantity).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    test('productId가 없으면 BadRequestError를 던진다', async () => {
      await expect(
        service.updateCart('buyer-1', {
          productId: '',
          sizes: [{ sizeId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('sizes가 빈 배열이면 BadRequestError를 던진다', async () => {
      await expect(
        service.updateCart('buyer-1', { productId: 'product-1', sizes: [] }),
      ).rejects.toThrow(BadRequestError);
    });

    test('sizes가 배열이 아니면 BadRequestError를 던진다', async () => {
      await expect(
        service.updateCart('buyer-1', {
          productId: 'product-1',
          sizes: null as any,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('존재하지 않는 상품이면 BadRequestError를 던진다', async () => {
      mockRepo.findProductById.mockResolvedValue(null);

      await expect(
        service.updateCart('buyer-1', {
          productId: 'non-existent',
          sizes: [{ sizeId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('장바구니가 없으면 NotFoundError를 던진다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(null);

      await expect(
        service.updateCart('buyer-1', {
          productId: 'product-1',
          sizes: [{ sizeId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundError);
    });

    test('수량이 0이면 BadRequestError를 던진다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);

      await expect(
        service.updateCart('buyer-1', {
          productId: 'product-1',
          sizes: [{ sizeId: 1, quantity: 0 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('수량이 999 초과이면 BadRequestError를 던진다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);

      await expect(
        service.updateCart('buyer-1', {
          productId: 'product-1',
          sizes: [{ sizeId: 1, quantity: 1000 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('수량이 소수이면 BadRequestError를 던진다', async () => {
      mockRepo.findProductById.mockResolvedValue({ id: 'product-1' } as any);
      mockRepo.findCartByBuyerId.mockResolvedValue(mockCart as any);

      await expect(
        service.updateCart('buyer-1', {
          productId: 'product-1',
          sizes: [{ sizeId: 1, quantity: 1.5 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── getCartItemDetail ───
  describe('getCartItemDetail', () => {
    test('장바구니 아이템 상세를 정상 반환한다', async () => {
      mockRepo.findCartItemById.mockResolvedValue(
        mockCartItemWithRelations as any,
      );
      (
        cartServiceUtil.resolveCartItemDetailImage as jest.Mock
      ).mockResolvedValue(mockCartItemWithRelations);

      const result = await service.getCartItemDetail('buyer-1', 'item-1');

      expect(mockRepo.findCartItemById).toHaveBeenCalledWith('item-1');
      expect(result).toEqual(mockCartItemDto);
    });

    test('cartItemId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getCartItemDetail('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('아이템이 존재하지 않으면 NotFoundError를 던진다', async () => {
      mockRepo.findCartItemById.mockResolvedValue(null);

      await expect(
        service.getCartItemDetail('buyer-1', 'non-existent'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 아이템이면 NotFoundError를 던진다', async () => {
      mockRepo.findCartItemById.mockResolvedValue({
        ...mockCartItemWithRelations,
        cart: { ...mockCart, buyerId: 'other-buyer' },
      } as any);

      await expect(
        service.getCartItemDetail('buyer-1', 'item-1'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── deleteCartItem ───
  describe('deleteCartItem', () => {
    test('장바구니 아이템을 정상적으로 삭제한다', async () => {
      mockRepo.findCartItemById.mockResolvedValue(
        mockCartItemWithRelations as any,
      );
      mockRepo.deleteCartItem.mockResolvedValue(undefined as any);

      await service.deleteCartItem('buyer-1', 'item-1');

      expect(mockRepo.deleteCartItem).toHaveBeenCalledWith('item-1');
    });

    test('cartItemId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.deleteCartItem('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('아이템이 존재하지 않으면 NotFoundError를 던진다', async () => {
      mockRepo.findCartItemById.mockResolvedValue(null);

      await expect(
        service.deleteCartItem('buyer-1', 'non-existent'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 아이템이면 NotFoundError를 던진다', async () => {
      mockRepo.findCartItemById.mockResolvedValue({
        ...mockCartItemWithRelations,
        cart: { ...mockCart, buyerId: 'other-buyer' },
      } as any);

      await expect(service.deleteCartItem('buyer-1', 'item-1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
