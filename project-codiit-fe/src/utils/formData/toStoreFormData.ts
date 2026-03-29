import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";

export function toStoreFormData(data: StoreCreateForm): FormData {
  const formData = new FormData();
  const appendIfNotEmpty = (key: string, value?: string) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    formData.append(key, trimmed);
  };

  formData.append("name", data.storeName);
  formData.append("address", data.address.basic);
  formData.append("detailAddress", data.address.detail ?? "");
  formData.append("phoneNumber", data.phoneNumber);
  formData.append("content", data.description);
  appendIfNotEmpty("businessRegistrationNumber", data.businessRegistrationNumber);
  appendIfNotEmpty("businessPhoneNumber", data.businessPhoneNumber);
  appendIfNotEmpty("mailOrderSalesNumber", data.mailOrderSalesNumber);
  appendIfNotEmpty("representativeName", data.representativeName);
  appendIfNotEmpty("businessAddress", data.businessAddress);
  if (data.image instanceof File) {
    formData.append("image", data.image);
  }
  return formData;
}
