export const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    return url.pathname === "/api" ? trimmed : `${trimmed}/api`;
  } catch {
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
};
