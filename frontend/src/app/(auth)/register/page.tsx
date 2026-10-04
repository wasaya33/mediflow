"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Globe,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useRegister } from "@/hooks/useAuth";
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

const registerSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters"),

  orgSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Organization slug must be at least 2 characters")
    .max(50, "Organization slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens (e.g. 'metro-health')"
    ),

  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      orgName: "",
      orgSlug: "",
      name: "",
      email: "",
      password: "",
    },
  });

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("orgName", val);
    // Auto-generate slug suggestion if not manually customized yet
    const currentSlug = form.getValues("orgSlug");
    if (!currentSlug || currentSlug === slugify(form.getValues("orgName"))) {
      form.setValue("orgSlug", slugify(val), { shouldValidate: true });
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .slice(0, 50);
  };

  const onSubmit = (data: RegisterFormValues) => {
    setErrorMessage(null);
    register(data, {
      onSuccess: (response) => {
        toast.success("Organization created successfully!", {
          description: `Welcome to MediFlow, ${response.user.name}. You are now logged in as ${response.organization.name} administrator.`,
        });
      },
      onError: (err: unknown) => {
        let msg = "Registration failed. Please check your information and try again.";
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
        toast.error("Registration failed", {
          description: msg,
        });
      },
    });
  };

  const currentSlug = form.watch("orgSlug") || "your-clinic";

  return (
    <Card className="w-full border-slate-200/80 shadow-card bg-white rounded-2xl overflow-hidden my-6">
      <CardHeader className="space-y-1 pb-4 pt-6 px-8">
        <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <CheckCircle2 className="h-4 w-4" />
          <span>New Organization Onboarding</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Create MediFlow Account
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Set up your organization tenant and initial billing administrator
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Organization Name */}
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-xs">
                    Organization / Practice Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="e.g. Apex Health Center"
                        className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        disabled={isPending}
                        {...field}
                        onChange={handleOrgNameChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Slug with mediflow.app/ visual */}
            <FormField
              control={form.control}
              name="orgSlug"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-slate-700 font-medium text-xs">
                      Tenant Subdomain Identifier
                    </FormLabel>
                    <span className="text-[11px] text-slate-500">
                      Unique tenant domain
                    </span>
                  </div>
                  <FormControl>
                    <div className="relative flex rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                      <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100/80 border-r border-slate-200 select-none">
                        mediflow.app/
                      </span>
                      <div className="relative flex-1">
                        <Input
                          placeholder="apex-health"
                          className="border-0 rounded-none h-10 bg-transparent px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={isPending}
                          {...field}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3 text-teal-600" />
                    <span>Workspace URL: <strong className="text-slate-700 font-mono">mediflow.app/{currentSlug}</strong></span>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Administrator Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-xs">
                    Administrator Full Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Dr. Sarah Jenkins"
                        className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-xs">
                    Admin Work Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="sarah@apexhealth.com"
                        autoComplete="email"
                        className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-xs">
                    Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        className="pl-9 pr-10 h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
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
              className="w-full h-11 rounded-xl gradient-primary text-white font-medium shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all mt-3 group"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Organization...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Register & Launch Workspace</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-xs text-slate-600">
        <span>Already have an account?</span>
        <Link
          href="/login"
          className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
