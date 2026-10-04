"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage(null);
    login(data, {
      onSuccess: (response) => {
        toast.success("Welcome back!", {
          description: `Logged in as ${response.user.name} (${response.organization.name})`,
        });
      },
      onError: (err: unknown) => {
        let msg = "Invalid email or password. Please try again.";
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } }).response
            ?.data?.message === "string"
        ) {
          msg = (
            err as { response?: { data?: { message?: string } } }
          ).response?.data?.message || msg;
        }
        setErrorMessage(msg);
        toast.error("Authentication failed", {
          description: msg,
        });
      },
    });
  };

  return (
    <Card className="w-full border-slate-200/80 shadow-card bg-white rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-6 pt-8 px-8">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>Secure Sign In</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Enter your credentials to access your billing workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-xs">
                    Work Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="doctor@clinic.com"
                        autoComplete="email"
                        className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-slate-700 font-medium text-xs">
                      Password
                    </FormLabel>
                    <span className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pl-9 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        disabled={isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl gradient-primary text-white font-medium shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all mt-2 group"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-xs text-slate-600">
        <span>Don&apos;t have an organization account?</span>
        <Link
          href="/register"
          className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Create organization
        </Link>
      </CardFooter>
    </Card>
  );
}
