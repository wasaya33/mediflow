import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        credentials
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(["currentUser"], data.user);
      router.push("/");
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(["currentUser"], data.user);
      router.push("/");
    },
  });
};

export const useCurrentUser = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: ["currentUser", token],
    queryFn: async (): Promise<User | null> => {
      if (!token) return null;
      try {
        const response = await api.get<ApiResponse<User>>("/auth/me");
        const user = response.data.data;
        setUser(user);
        return user;
      } catch (error) {
        logout();
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };
};
