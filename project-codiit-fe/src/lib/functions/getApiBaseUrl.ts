import { normalizeApiBaseUrl } from "./normalizeApiBaseUrl";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

export const getApiBaseUrl = (value?: string | null) =>
  normalizeApiBaseUrl(value || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL);
