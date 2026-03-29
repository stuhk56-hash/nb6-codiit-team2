import { toDecryptedStoreBusinessInfo } from './stores.business-info.util';

function maskBusinessRegistrationNumber(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***-**-${digits.slice(-4)}`;
}

function maskPhone(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `***-****-${digits.slice(-4)}`;
}

function maskName(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length === 1) return '*';
  return `${trimmed[0]}${'*'.repeat(trimmed.length - 1)}`;
}

function maskMailOrderSalesNumber(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split('-');
  if (parts.length < 3) return '***';
  const tail = parts[parts.length - 1];
  const maskedTail =
    tail.length > 2 ? `${'*'.repeat(tail.length - 2)}${tail.slice(-2)}` : '**';
  return [...parts.slice(0, -1), maskedTail].join('-');
}

function maskAddress(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return '[MASKED_ADDRESS]';
}

export function toStoreAuditSnapshot(store: {
  id: string;
  sellerId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  businessRegistrationNumber: string | null;
  businessPhoneNumber: string | null;
  mailOrderSalesNumber: string | null;
  representativeName: string | null;
  businessAddress: string | null;
}) {
  const businessInfo = toDecryptedStoreBusinessInfo(store);

  return {
    id: store.id,
    sellerId: store.sellerId,
    name: store.name,
    address: store.address,
    detailAddress: store.detailAddress,
    phoneNumber: store.phoneNumber,
    content: store.content,
    businessRegistrationNumber: maskBusinessRegistrationNumber(
      businessInfo.businessRegistrationNumber,
    ),
    businessPhoneNumber: maskPhone(businessInfo.businessPhoneNumber),
    mailOrderSalesNumber: maskMailOrderSalesNumber(
      businessInfo.mailOrderSalesNumber,
    ),
    representativeName: maskName(businessInfo.representativeName),
    businessAddress: maskAddress(businessInfo.businessAddress),
  };
}
