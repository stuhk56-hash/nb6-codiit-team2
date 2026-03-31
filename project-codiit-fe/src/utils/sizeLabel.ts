type SizeNameLike = {
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  size?: {
    ko?: string | null;
    en?: string | null;
  } | null;
} | null | undefined;

const INVALID_TEXT = new Set(["", "-", "?", "n/a", "na", "none", "null", "undefined"]);

const toValidText = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (INVALID_TEXT.has(trimmed.toLowerCase())) return null;
  return trimmed;
};

export const resolveSizeLabel = (
  size: SizeNameLike,
  fallback = "사이즈 정보 없음",
): string => {
  const candidates = [
    size?.size?.ko,
    size?.nameKo,
    size?.name,
    size?.size?.en,
    size?.nameEn,
  ];

  for (const candidate of candidates) {
    const value = toValidText(candidate);
    if (value) return value;
  }

  return fallback;
};
