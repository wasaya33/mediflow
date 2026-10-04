"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
          success:
            "group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-950",
          error:
            "group-[.toaster]:border-rose-200 group-[.toaster]:text-rose-950",
        },
      }}
      richColors
      position="top-right"
      {...props}
    />
  );
};

export { Toaster, toast };
