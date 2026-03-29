import { ProductFormValues } from "@/lib/schemas/productForm.schema";

export function toProductFormData(data: ProductFormValues): FormData {
  const formData = new FormData();
  const appendIfNotEmpty = (key: string, value?: string | null) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    formData.append(key, trimmed);
  };
  const appendIfNumber = (key: string, value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return;
    formData.append(key, String(value));
  };

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("categoryName", data.category.toLowerCase());

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  // 재고
  const sizeNameToIdMap: Record<string, number> = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
    free: 6,
  };
  const stocksArray = Object.entries(data.stocks || {})
    .filter(([, quantity]) => typeof quantity === "number")

    .map(([sizeName, quantity]) => ({
      sizeId: sizeNameToIdMap[sizeName.toLowerCase()],
      quantity,
    }));
  formData.append("stocks", JSON.stringify(stocksArray));

  // 할인
  if (data.discount.enabled && typeof data.discount.value === "number") {
    formData.append("discountRate", String(data.discount.value));

    if (data.discount.periodEnabled) {
      if (data.discount.periodStart) {
        const isoStart = new Date(data.discount.periodStart).toISOString();
        formData.append("discountStartTime", isoStart);
      }
      if (data.discount.periodEnd) {
        const isoEnd = new Date(data.discount.periodEnd).toISOString();
        formData.append("discountEndTime", isoEnd);
      }
    }
  }

  // 상세 설명
  formData.append("content", data.detail);
  appendIfNotEmpty("material", data.noticeInfo.material);
  appendIfNotEmpty("color", data.noticeInfo.color);
  appendIfNotEmpty("manufacturerName", data.noticeInfo.manufacturerName);
  appendIfNotEmpty("manufactureCountry", data.noticeInfo.manufactureCountry);
  appendIfNotEmpty("manufactureDate", data.noticeInfo.manufactureDate);
  appendIfNotEmpty("caution", data.noticeInfo.caution);
  appendIfNotEmpty(
    "qualityGuaranteeStandard",
    data.noticeInfo.qualityGuaranteeStandard
  );
  appendIfNotEmpty("asManagerName", data.noticeInfo.asManagerName);
  appendIfNotEmpty("asPhoneNumber", data.noticeInfo.asPhoneNumber);
  appendIfNumber("shippingFee", data.tradeInfo.shippingFee);
  appendIfNumber("extraShippingFee", data.tradeInfo.extraShippingFee);
  appendIfNotEmpty("shippingCompany", data.tradeInfo.shippingCompany);
  appendIfNotEmpty("deliveryPeriod", data.tradeInfo.deliveryPeriod);
  appendIfNotEmpty("returnExchangePolicy", data.tradeInfo.returnExchangePolicy);
  appendIfNumber("returnShippingFee", data.tradeInfo.returnShippingFee);
  appendIfNumber("exchangeShippingFee", data.tradeInfo.exchangeShippingFee);
  if (Array.isArray(data.sizeSpecs)) {
    formData.append("sizeSpecs", JSON.stringify(data.sizeSpecs));
  }

  return formData;
}
