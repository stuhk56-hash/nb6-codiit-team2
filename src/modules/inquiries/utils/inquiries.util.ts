import { InquiryStatus } from '@prisma/client';
import { InquiryValidationError } from '../inquiries.errors';
import { INQUIRY_STATUS_API_to_DB } from '../../../utils/enum-mapper';

export function normalizeRequiredText(value: string | undefined, fieldName: string) {
  const normalizedValue = (value ?? '').trim();

  if (!normalizedValue) {
    throw new InquiryValidationError(`${fieldName}은(는) 비워둘 수 없습니다.`);
  }

  return normalizedValue;
}

export function parsePositiveInteger(
  value: string | undefined,
  fallbackValue: number,
  fieldName: string,
) {
  if (value === undefined || value === '') return fallbackValue;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new InquiryValidationError(`${fieldName}는 1 이상의 정수여야 합니다.`);
  }

  return parsedValue;
}

export function parseInquiryStatus(value?: string): InquiryStatus | undefined {
  if (!value) return undefined;

  if (Object.values(InquiryStatus).includes(value as InquiryStatus)) {
    return value as InquiryStatus;
  }

  const mappedStatus =
    INQUIRY_STATUS_API_to_DB[value as keyof typeof INQUIRY_STATUS_API_to_DB];

  if (mappedStatus) return mappedStatus;

  throw new InquiryValidationError('status 값이 올바르지 않습니다.');
}
