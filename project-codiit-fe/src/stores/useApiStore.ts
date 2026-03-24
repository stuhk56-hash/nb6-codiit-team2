import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiBaseUrl } from "@/lib/functions/getApiBaseUrl";
import { normalizeApiBaseUrl } from "@/lib/functions/normalizeApiBaseUrl";

interface ApiStore {
  baseURL: string;
  setBaseURL: (url: string) => void;
}

export const useApiStore = create<ApiStore>()(
  persist(
    (set) => ({
      baseURL: getApiBaseUrl(),
      setBaseURL: (url) => set({ baseURL: normalizeApiBaseUrl(url) }),
    }),
    {
      name: "api-storage", // localStorage key
    }
  )
);
