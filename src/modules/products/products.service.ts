import { requireBuyer, requireSeller } from '../../lib/request/auth-user';
import { AuthUser } from '../../types/auth-request.type';
import { s3Service } from '../s3/s3.service';
import { DetailProductResponseDto } from './dto/detail-product-response.dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { ProductInquiryListResponseDto } from './dto/product-inquiry-list-response.dto';
import { ProductInquiryResponseDto } from './dto/product-inquiry-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { productsRepository } from './products.repository';
import {
  ProductInquiryListQuery,
  ProductListQuery,
} from './types/products.type';
import {
  toDetailProductResponseDto,
  toProductInquiryListResponseDto,
  toProductInquiryResponseDto,
  toProductListResponseDto,
} from './utils/products.mapper';
import {
  ensureCategory,
  ensureProductOwner,
  requireProducts,
  ensureSellerStore,
  filterProductInquiries,
  normalizeProductListQuery,
  normalizeProductInquiryListQuery,
  paginateProductInquiries,
  paginateProducts,
  requireProduct,
  sortProductInquiries,
  sortProducts,
  validateCreateProductInput,
  validateUpdateProductInput,
} from './utils/products.service.util';

export class ProductsService {
  async create(
    user: AuthUser,
    data: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<DetailProductResponseDto> {
    requireSeller(user);
    validateCreateProductInput(data);

    const store = await productsRepository.findSellerStore(user.id);
    ensureSellerStore(store?.id);

    const category = await productsRepository.findCategoryByName(
      data.categoryName,
    );
    ensureCategory(category?.id);

    const uploadedImage = image ? await s3Service.uploadFile(image) : null;

    const created = await productsRepository.create({
      storeId: store!.id,
      categoryId: category!.id,
      name: data.name,
      price: data.price,
      content: data.content,
      ...(uploadedImage
        ? {
            imageUrl: uploadedImage.url,
            imageKey: uploadedImage.key,
          }
        : {}),
      discountRate: data.discountRate,
      discountStartTime: data.discountStartTime
        ? new Date(data.discountStartTime)
        : undefined,
      discountEndTime: data.discountEndTime
        ? new Date(data.discountEndTime)
        : undefined,
      stocks: data.stocks,
    });

    return await toDetailProductResponseDto(created);
  }

  async findList(query: ProductListQuery): Promise<ProductListResponseDto> {
    const normalized = normalizeProductListQuery(query);

    if (normalized.categoryName) {
      const category = await productsRepository.findCategoryByName(
        normalized.categoryName,
      );
      ensureCategory(category?.id);
    }

    if (
      normalized.sort === 'highRating' ||
      normalized.sort === 'salesRanking'
    ) {
      const filtered = await productsRepository.findFilteredByQuery(normalized);
      requireProducts(filtered);
      const sorted = sortProducts(filtered, normalized.sort);
      const paged = paginateProducts(sorted, normalized);

      return {
        ...(await toProductListResponseDto(paged)),
        totalCount: filtered.length,
      };
    }

    const { products, totalCount } =
      await productsRepository.findPageByQuery(normalized);
    requireProducts(products);

    return {
      ...(await toProductListResponseDto(products)),
      totalCount,
    };
  }

  async findProduct(productId: string): Promise<DetailProductResponseDto> {
    const product = requireProduct(
      await productsRepository.findById(productId),
    );
    return await toDetailProductResponseDto(product);
  }

  async update(
    user: AuthUser,
    productId: string,
    data: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<DetailProductResponseDto> {
    requireSeller(user);

    const product = requireProduct(
      await productsRepository.findById(productId),
    );
    ensureProductOwner(user.id, product);
    validateUpdateProductInput(data, product);

    const category = data.categoryName
      ? await productsRepository.findCategoryByName(data.categoryName)
      : undefined;

    if (data.categoryName) {
      ensureCategory(category?.id);
    }

    const uploadedImage = image ? await s3Service.uploadFile(image) : null;

    const updated = requireProduct(
      await productsRepository.update(productId, {
        ...(uploadedImage
          ? {
              imageUrl: uploadedImage.url,
              imageKey: uploadedImage.key,
            }
          : {}),
        categoryId: category?.id,
        name: data.name,
        price: data.price,
        content: data.content,
        discountRate: data.discountRate,
        discountStartTime:
          data.discountStartTime !== undefined
            ? data.discountStartTime
              ? new Date(data.discountStartTime)
              : null
            : undefined,
        discountEndTime:
          data.discountEndTime !== undefined
            ? data.discountEndTime
              ? new Date(data.discountEndTime)
              : null
            : undefined,
        stocks: data.stocks,
      }),
    );

    return await toDetailProductResponseDto(updated);
  }

  async remove(user: AuthUser, productId: string): Promise<void> {
    requireSeller(user);
    const product = requireProduct(
      await productsRepository.findById(productId),
    );
    ensureProductOwner(user.id, product);

    await productsRepository.deleteById(productId);
  }

  async createInquiry(
    user: AuthUser,
    productId: string,
    data: { title: string; content: string; isSecret?: boolean },
  ): Promise<ProductInquiryResponseDto> {
    requireBuyer(user);
    requireProduct(await productsRepository.findById(productId));

    const inquiry = await productsRepository.createInquiry({
      productId,
      buyerId: user.id,
      title: data.title,
      content: data.content,
      isSecret: data.isSecret,
    });

    return toProductInquiryResponseDto(inquiry);
  }

  async getListInquiry(
    productId: string,
    query: ProductInquiryListQuery,
  ): Promise<ProductInquiryListResponseDto> {
    requireProduct(await productsRepository.findById(productId));
    const inquiries = await productsRepository.findProductInquiries(productId);
    const normalized = normalizeProductInquiryListQuery(query);
    const filtered = filterProductInquiries(inquiries, normalized.status);
    const sorted = sortProductInquiries(filtered, normalized.sort);
    const paged = paginateProductInquiries(sorted, normalized);
    const response = toProductInquiryListResponseDto(paged);

    return {
      ...response,
      totalCount: filtered.length,
    };
  }
}

export const productsService = new ProductsService();
