import {
  Cart,
  CartItem,
  Product,
  Store,
  ProductStock,
  Size,
} from '@prisma/client';

//Size타입
export type SizeWithNames = Size;

//ProductStock과 Size포함한 타입
export type ProductStockWithSize = ProductStock & {
  size: SizeWithNames;
};

//Product와 Store, ProductStock, Size 관계를 포함한 타입
export type ProductWithRelations = Product & {
  store: Store;
  stocks: ProductStockWithSize[];
};

//CartItem과 Size, Product, Cart 포함 타입
export type CartItemWithRelations = CartItem & {
  Size?: Size;
  product: ProductWithRelations;
  cart: Cart;
};

//Cart와 CartItem들을 포함하는 타입
export type CartWithItems = Cart & {
  items: CartItemWithRelations[];
};
