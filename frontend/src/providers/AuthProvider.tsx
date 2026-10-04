"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { ApiResponse, User } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, setUser, logout, setLoading } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      // Rehydration check
      const currentToken = useAuthStore.getState().token;

      if (!currentToken) {
        if (isMounted) {
          setLoading(false);
          setIsVerifying(false);
        }
        return;
      }

      try {
        const response = await api.get<ApiResponse<User>>("/auth/me");
        if (isMounted && response.data?.success && response.data.data) {
          setUser(response.data.data);
        }
      } catch {
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, setUser, logout, setLoading]);

  if (isVerifying) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        label="Verifying MediFlow session..."
      />
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
