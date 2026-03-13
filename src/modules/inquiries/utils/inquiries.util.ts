export const DEFAULT_INQUIRIES_PAGE = 1;
export const DEFAULT_INQUIRIES_PAGE_SIZE = 16;

export function resolveInquiryImage(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return '/images/Mask-group.svg';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '/images/Mask-group.svg';
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return '/images/Mask-group.svg';
}
