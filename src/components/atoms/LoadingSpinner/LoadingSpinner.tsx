"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn";

const loadingSpinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        default: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
      },
      variant: {
        default: "text-blue-600",
        white: "text-white",
        primary: "text-primary",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps extends VariantProps<typeof loadingSpinnerVariants> {
  className?: string;
  label?: string;
}

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ 
  className, 
  size, 
  variant,
  label = "Cargando..." 
}) => {
  return (
    <svg
      className={cn(loadingSpinnerVariants({ size, variant, className }))}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label={label}
    >
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="0"
        opacity="0.3"
      />
      <path
        d="M45 25a20 20 0 1 1-20-20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="1"
      />
    </svg>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
