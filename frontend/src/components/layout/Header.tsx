"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Building2,
  Shield,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useSidebar } from "./SidebarContext";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { toggleMobile } = useSidebar();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "MD";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 backdrop-blur-md shadow-xs">
      {/* Left side: Hamburger (mobile only) + Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Dynamic Breadcrumbs */}
        <div className="overflow-hidden">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right side: Tenant Badge, Notifications, User Dropdown */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Organization Name Badge (collapses on small screens) */}
        {user?.organization && (
          <div className="hidden sm:flex items-center">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 bg-slate-50 text-slate-700 border-slate-200/90 font-medium px-2.5 py-1 text-xs"
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span className="max-w-[140px] md:max-w-[180px] truncate">
                {user.organization.name}
              </span>
            </Badge>
          </div>
        )}

        {/* Notifications Icon with Badge */}
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            aria-label="Notifications - 3 unread"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
          </Button>
        </Link>

        {/* User Avatar Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              aria-label="User account menu"
            >
              <Avatar className="h-8 w-8 border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-2xs">
                <AvatarFallback className="font-semibold text-xs text-indigo-700">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  {user.role?.replace("_", " ").toLowerCase()}
                </span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 bg-white border-slate-200 shadow-xl rounded-xl p-1.5"
            >
              <DropdownMenuLabel className="font-normal px-2.5 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-slate-900 leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 leading-none truncate">
                    {user.email}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100"
              >
                <UserIcon className="h-4 w-4 text-slate-500" />
                <span>Profile & Security</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Tenant Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/audit-logs")}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100"
              >
                <ExternalLink className="h-4 w-4 text-slate-500" />
                <span>Audit Trail</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 rounded-lg cursor-pointer hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-700"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:text-slate-900"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="gradient-primary text-white border-0 shadow-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
