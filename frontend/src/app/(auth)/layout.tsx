import React from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Left side: Hero branding & feature showcase (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top brand header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 text-white shadow-lg shadow-indigo-500/30">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white">
                Medi<span className="text-teal-400">Flow</span>
              </span>
              <span className="text-xs text-indigo-200/80 font-medium">
                Enterprise Medical Billing
              </span>
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/50 text-teal-300 text-xs font-semibold mb-6">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>Next-Gen Healthcare SaaS</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Modern Medical Billing{" "}
            <span className="bg-gradient-to-r from-teal-300 to-indigo-200 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="mt-4 text-base text-indigo-100/80 leading-relaxed">
            Eliminate billing friction with automated claim scrubbing, real-time ERA reconciliation, and multi-tenant tenant isolation designed for modern healthcare organizations.
          </p>

          {/* Value propositions */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-sm text-indigo-100/90">
                <strong className="text-white font-semibold">99.4% Clean Claims Rate:</strong> Built-in validation reduces denials before submission.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-sm text-indigo-100/90">
                <strong className="text-white font-semibold">Instant ERA Reconciliation:</strong> Automated payment posting and ledger tracking.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <p className="text-sm text-indigo-100/90">
                <strong className="text-white font-semibold">Full HIPAA Compliance:</strong> Strict role-based access control with complete audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10 pt-6 border-t border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200/70">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-400" />
            <span>Trusted by 450+ medical practices</span>
          </div>
          <span>SOC2 & HIPAA Ready</span>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="relative flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white shadow-md">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Medi<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Main form slot */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediFlow Inc. Protected by HIPAA compliant cloud infrastructure.</p>
        </div>
      </div>
    </div>
  );
}
