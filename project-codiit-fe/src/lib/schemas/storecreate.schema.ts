import { z } from "zod";

export const storeCreateSchema = z.object({
  storeName: z.string().min(1, "스토어명을 입력하세요").max(50, "스토어명은 최대 50자까지 입력 가능합니다"),
  address: z.object({
    basic: z.string().min(1, "주소를 입력하세요"),
    detail: z.string().optional(),
  }),
  phoneNumber: z
    .string()
    .min(1, "전화번호를 입력하세요")
    .regex(/^\d{2,3}-?\d{3,4}-?\d{4}$/, "유효한 전화번호를 입력하세요"),

  image: z
    .custom<File>((file) => file instanceof File, {
      message: "이미지를 선택하세요.",
    })
    .optional(),
  description: z.string().min(10, "스토어 설명은 최소 10자 이상입니다"),
  businessRegistrationNumber: z.string().optional(),
  businessPhoneNumber: z.string().optional(),
  mailOrderSalesNumber: z.string().optional(),
  representativeName: z.string().optional(),
  businessAddress: z.string().optional(),
  disclosureAgreement: z.boolean().refine((value) => value, {
    message: "공개 항목 및 약관 안내에 동의해야 저장할 수 있습니다",
  }),
});

export type StoreCreateForm = z.infer<typeof storeCreateSchema>;
