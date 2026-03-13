export type CreateProductStockDto = {
  sizeId: number;
  quantity: number;
};

export type CreateProductDto = {
  name: string;
  price: number;
  content?: string;
  categoryName: string;
  stocks: CreateProductStockDto[];
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
};

export type UpdateProductDto = Partial<CreateProductDto> & {
  isSoldOut?: boolean;
};
