import { requireBuyer, requireSeller } from '../../lib/request/auth-user';
import { AuthUser } from '../../types/auth-request.type';
import { s3Service } from '../s3/s3.service';
import { notificationsRepository } from '../notifications/notifications.repository';
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
  resolveProductImage,
  resolveProductsImage,
  validateCreateProductInput,
  validateUpdateProductInput,
} from './utils/products.service.util';
import {
  toCreateProductPayload,
  toUpdateProductPayload,
} from './utils/products.payload.util';

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

    const created = await productsRepository.create(
      toCreateProductPayload({
        storeId: store!.id,
        categoryId: category!.id,
        data,
        uploadedImage,
      }),
    );

    const resolvedProduct = await resolveProductImage(created);
    return toDetailProductResponseDto(resolvedProduct);
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
      const resolvedProducts = await resolveProductsImage(paged);

      return {
        ...toProductListResponseDto(resolvedProducts),
        totalCount: filtered.length,
      };
    }

    const { products, totalCount } =
      await productsRepository.findPageByQuery(normalized);
    requireProducts(products);
    const resolvedProducts = await resolveProductsImage(products);

    return {
      ...toProductListResponseDto(resolvedProducts),
      totalCount,
    };
  }

  async findProduct(productId: string): Promise<DetailProductResponseDto> {
    const product = requireProduct(
      await productsRepository.findById(productId),
    );
    const resolvedProduct = await resolveProductImage(product);
    return toDetailProductResponseDto(resolvedProduct);
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
      await productsRepository.update(
        productId,
        toUpdateProductPayload({
          categoryId: category?.id,
          data,
          uploadedImage,
        }),
      ),
    );

    const resolvedProduct = await resolveProductImage(updated);
    return toDetailProductResponseDto(resolvedProduct);
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
    const product = requireProduct(await productsRepository.findById(productId));

    const inquiry = await productsRepository.createInquiry({
      productId,
      buyerId: user.id,
      title: data.title,
      content: data.content,
      isSecret: data.isSecret,
    });

    await notificationsRepository.create(
      product.store.sellerId,
      `상품 "${product.name}"에 새로운 문의가 등록되었습니다.`,
    );

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
