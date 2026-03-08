"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "destructive";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  variant?: ToastVariant;
  onOpenChange?: (open: boolean) => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, open = true, variant = "default", onOpenChange, ...props }, ref) => {
    void onOpenChange;
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border bg-white p-3 shadow-lg transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          variant === "destructive"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-gray-200 text-gray-900",
          className,
        )}
        {...props}
      />
    );
  },
);
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-gray-600 leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText: string;
}

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, altText, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={altText}
      className={cn(
        "inline-flex h-7 items-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100",
        className,
      )}
      {...props}
    />
  ),
);
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700",
      className,
    )}
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </button>
));
ToastClose.displayName = "ToastClose";
