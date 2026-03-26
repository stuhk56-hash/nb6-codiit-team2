import { decryptStorePiiNullable } from '../../../lib/security/store-pii-crypto';
import type { StoreBusinessInfoEncrypted } from '../types/stores.type';

export function toDecryptedStoreBusinessInfo(
  store: StoreBusinessInfoEncrypted,
) {
  return {
    businessRegistrationNumber: decryptStorePiiNullable(
      store.businessRegistrationNumber,
    ),
    businessPhoneNumber: decryptStorePiiNullable(store.businessPhoneNumber),
    mailOrderSalesNumber: decryptStorePiiNullable(store.mailOrderSalesNumber),
    representativeName: decryptStorePiiNullable(store.representativeName),
    businessAddress: decryptStorePiiNullable(store.businessAddress),
  };
}
