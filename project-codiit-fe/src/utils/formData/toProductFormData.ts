import { ProductFormValues } from "@/lib/schemas/productForm.schema";

export function toProductFormData(data: ProductFormValues): FormData {
  const formData = new FormData();
  const INVALID_TEXT_VALUES = new Set([
    "?",
    "-",
    "n/a",
    "na",
    "none",
    "null",
    "undefined",
  ]);
  const appendIfNotEmpty = (key: string, value?: string | null) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (INVALID_TEXT_VALUES.has(trimmed.toLowerCase())) return;
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
  const runtimeSizeIdMap = data.sizeIdMap || {};
  const stocksArray = Object.entries(data.stocks || {})
    .filter(([, quantity]) => typeof quantity === "number")
    .map(([sizeName, quantity]) => {
      const normalizedSizeName = sizeName.toUpperCase();
      const resolvedSizeId =
        runtimeSizeIdMap[normalizedSizeName] ??
        sizeNameToIdMap[sizeName.toLowerCase()];

      return {
        sizeId: resolvedSizeId,
        quantity,
      };
    })
    .filter(
      (row): row is { sizeId: number; quantity: number } =>
        typeof row.sizeId === "number" && Number.isFinite(row.sizeId)
    );
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
    const normalizedSizeSpecs = data.sizeSpecs.map((spec) => {
      const normalizeSpecValue = (value: number | null | undefined) =>
        typeof value === "number" && Number.isFinite(value) && value > 0
          ? value
          : null;

      return {
        ...spec,
        totalLengthCm: normalizeSpecValue(spec.totalLengthCm),
        shoulderCm: normalizeSpecValue(spec.shoulderCm),
        chestCm: normalizeSpecValue(spec.chestCm),
        sleeveCm: normalizeSpecValue(spec.sleeveCm),
        waistCm: normalizeSpecValue(spec.waistCm),
        hipCm: normalizeSpecValue(spec.hipCm),
        thighCm: normalizeSpecValue(spec.thighCm),
        riseCm: normalizeSpecValue(spec.riseCm),
        hemCm: normalizeSpecValue(spec.hemCm),
      };
    });

    formData.append("sizeSpecs", JSON.stringify(normalizedSizeSpecs));
  }

  return formData;
}
