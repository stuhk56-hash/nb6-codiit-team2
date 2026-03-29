import type { CreateProductDto, UpdateProductDto } from '../dto/create-product.dto';
import type { UploadedProductImage } from '../types/products.type';

function toUploadedImagePayload(uploadedImage: UploadedProductImage) {
  if (!uploadedImage) {
    return {};
  }

  return {
    imageUrl: uploadedImage.url,
    imageKey: uploadedImage.key,
  };
}

function toProductCommonPayload(data: CreateProductDto | UpdateProductDto) {
  return {
    name: data.name,
    price: data.price,
    content: data.content,
    material: data.material,
    color: data.color,
    manufacturerName: data.manufacturerName,
    manufactureCountry: data.manufactureCountry,
    manufactureDate: data.manufactureDate,
    caution: data.caution,
    qualityGuaranteeStandard: data.qualityGuaranteeStandard,
    asManagerName: data.asManagerName,
    asPhoneNumber: data.asPhoneNumber,
    shippingFee: data.shippingFee,
    extraShippingFee: data.extraShippingFee,
    shippingCompany: data.shippingCompany,
    deliveryPeriod: data.deliveryPeriod,
    returnExchangePolicy: data.returnExchangePolicy,
    returnShippingFee: data.returnShippingFee,
    exchangeShippingFee: data.exchangeShippingFee,
    discountRate: data.discountRate,
  };
}

export function toCreateProductPayload(params: {
  storeId: string;
  categoryId: string;
  data: CreateProductDto;
  uploadedImage?: UploadedProductImage;
}) {
  const { storeId, categoryId, data, uploadedImage } = params;

  return {
    storeId,
    categoryId,
    ...toProductCommonPayload(data),
    ...toUploadedImagePayload(uploadedImage),
    discountStartTime: data.discountStartTime
      ? new Date(data.discountStartTime)
      : undefined,
    discountEndTime: data.discountEndTime
      ? new Date(data.discountEndTime)
      : undefined,
    stocks: data.stocks,
    sizeSpecs: data.sizeSpecs,
  };
}

export function toUpdateProductPayload(params: {
  categoryId?: string;
  data: UpdateProductDto;
  uploadedImage?: UploadedProductImage;
}) {
  const { categoryId, data, uploadedImage } = params;

  return {
    ...toUploadedImagePayload(uploadedImage),
    categoryId,
    ...toProductCommonPayload(data),
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
    sizeSpecs: data.sizeSpecs,
  };
}
