import { encryptStorePiiNullable } from '../../../lib/security/store-pii-crypto';

export function encryptStoreBusinessInfoInput<T extends Record<string, unknown>>(
  data: T,
) {
  return {
    ...data,
    businessRegistrationNumber: encryptStorePiiNullable(
      data.businessRegistrationNumber as string | null | undefined,
    ),
    businessPhoneNumber: encryptStorePiiNullable(
      data.businessPhoneNumber as string | null | undefined,
    ),
    mailOrderSalesNumber: encryptStorePiiNullable(
      data.mailOrderSalesNumber as string | null | undefined,
    ),
    representativeName: encryptStorePiiNullable(
      data.representativeName as string | null | undefined,
    ),
    businessAddress: encryptStorePiiNullable(
      data.businessAddress as string | null | undefined,
    ),
  };
}
