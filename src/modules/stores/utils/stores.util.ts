export const DEFAULT_MY_STORE_PRODUCTS_PAGE = 1;
export const DEFAULT_MY_STORE_PRODUCTS_PAGE_SIZE = 10;

//일단은 이미지가 없는 경우 프론트에 있었던 기본 이미지로 대체하도록 함
export function resolveStoreImage(value: string | null | undefined) {
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
