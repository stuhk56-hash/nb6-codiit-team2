import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeApiBaseUrl } from "@/lib/functions/normalizeApiBaseUrl";

interface ApiStore {
  baseURL: string;
  setBaseURL: (url: string) => void;
}

export const useApiStore = create<ApiStore>()(
  persist(
    (set) => ({
      baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || ""),
      setBaseURL: (url) => set({ baseURL: normalizeApiBaseUrl(url) }),
    }),
    {
      name: "api-storage", // localStorage key
    }
  )
);
