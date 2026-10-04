"use client";

import React from "react";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application shell for MediFlow SaaS Dashboard.
 * Enforces ProtectedRoute session check, provides responsive sidebar state,
 * and organizes sticky header with max-w-7xl content viewport.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
          {/* Responsive Sidebar (Fixed desktop & mobile drawer) */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto w-full">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
