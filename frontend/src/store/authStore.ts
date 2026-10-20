import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const DEV_BYPASS_USER: User = {
  id: "65f000000000000000000001",
  organizationId: "65f000000000000000000002",
  name: "Dr. Alex Taylor (Dev Bypass)",
  email: "admin@mediflow.com",
  role: "PLATFORM_ADMIN",
  phone: "+1-512-555-0100",
  isActive: true,
  createdAt: new Date().toISOString(),
  organization: {
    id: "65f000000000000000000002",
    name: "Demo Clinic",
    slug: "demo-clinic",
    address: "123 Medical Center Blvd, Suite 400, Austin, TX 78701",
    phone: "+1-512-555-0199",
    email: "contact@democlinic.mediflow.io",
    taxId: "74-1234567",
    settings: {
      currency: "USD",
      timezone: "America/Chicago",
      billingCycle: "MONTHLY",
      autoSubmitClaims: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
};

export const DEV_BYPASS_TOKEN = "dev-bypass-token";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEV_BYPASS_USER,
      token: DEV_BYPASS_TOKEN,
      isAuthenticated: true,
      isLoading: false,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setToken: (token: string | null) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      setLoading: (isLoading: boolean) =>
        set({ isLoading }),

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("mediflow-auth");
        }
      },
    }),
    {
      name: "mediflow-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: !!state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.user || !state.token) {
            state.user = DEV_BYPASS_USER;
            state.token = DEV_BYPASS_TOKEN;
            state.isAuthenticated = true;
          }
          state.setLoading(false);
        }
      },
    }
  )
);
