import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { CategoryType, ProductInfoData } from "@/types/Product";

export function transformToFormValues(data: ProductInfoData): ProductFormValues {
  const formatDateTimeLocal = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 16);
  };

  return {
    name: data.name,
    image: data.image ?? null,
    price: data.price,
    category: data.category.name.toUpperCase() as CategoryType,
    sizes: data.stocks.map((s) => s.size.name.toUpperCase()),
    stocks: data.stocks.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.size.name.toUpperCase()] = curr.quantity;
      return acc;
    }, {}),

    discount: {
      enabled: data.discountRate > 0,
      value: data.discountRate > 0 ? data.discountRate : null,
      periodEnabled: !!(data.discountStartTime && data.discountEndTime),
      periodStart: formatDateTimeLocal(data.discountStartTime),
      periodEnd: formatDateTimeLocal(data.discountEndTime),
    },
    detail: data.content,
    noticeInfo: {
      material: data.noticeInfo.material ?? "",
      color: data.noticeInfo.color ?? "",
      manufacturerName: data.noticeInfo.manufacturerName ?? "",
      manufactureCountry: data.noticeInfo.manufactureCountry ?? "",
      manufactureDate: data.noticeInfo.manufactureDate ?? "",
      caution: data.noticeInfo.caution ?? "",
      qualityGuaranteeStandard: data.noticeInfo.qualityGuaranteeStandard ?? "",
      asManagerName: data.noticeInfo.asManagerName ?? "",
      asPhoneNumber: data.noticeInfo.asPhoneNumber ?? "",
    },
    tradeInfo: {
      shippingFee: data.tradeInfo.shippingFee ?? null,
      extraShippingFee: data.tradeInfo.extraShippingFee ?? null,
      shippingCompany: data.tradeInfo.shippingCompany ?? "",
      deliveryPeriod: data.tradeInfo.deliveryPeriod ?? "",
      returnExchangePolicy: data.tradeInfo.returnExchangePolicy ?? "",
      returnShippingFee: data.tradeInfo.returnShippingFee ?? null,
      exchangeShippingFee: data.tradeInfo.exchangeShippingFee ?? null,
    },
    sizeSpecs: data.sizeSpecs ?? [],
  };
}
