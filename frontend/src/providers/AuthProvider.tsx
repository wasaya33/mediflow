"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { ApiResponse, User } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Development bypass switch: set to false to re-enable strict session verification
const BYPASS_AUTH = true;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, user, setUser, setLoading } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState<boolean>(!BYPASS_AUTH);

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
        if (isMounted && !BYPASS_AUTH) {
          useAuthStore.getState().logout();
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
  }, [token, setUser, setLoading]);

  if (isVerifying && !BYPASS_AUTH) {
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
