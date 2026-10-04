"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component enforces authentication before rendering dashboard contents.
 * If unauthenticated or token is missing, user is redirected to /login.
 * While checking session or loading user profile, a full-screen loading spinner is displayed.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading } = useAuthStore();
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoading) {
      if (!token || !isAuthenticated) {
        router.replace("/login");
      }
    }
  }, [hasMounted, isLoading, token, isAuthenticated, router]);

  // Prevent hydration mismatch and show loading state while rehydrating Zustand
  if (!hasMounted || isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        label="Verifying secure MediFlow credentials..."
      />
    );
  }

  // If credentials are confirmed absent, hold in loading state while router redirects
  if (!token || !isAuthenticated) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        label="Redirecting to login..."
      />
    );
  }

  // If token is present but user profile is still being populated
  if (!user) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        label="Loading practitioner workspace..."
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
