"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn";

const spinnerVariants = cva(
  "animate-spin inline-block border-solid border-current border-t-transparent rounded-full",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-blue-600",
        light: "text-white",
        dark: "text-gray-800",
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

export interface SpinnerProps
  extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export const Spinner = React.memo<SpinnerProps>(({ 
  className, 
  size, 
  variant,
  label = "Cargando..." 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(spinnerVariants({ size, variant, className }))}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
});

Spinner.displayName = "Spinner";

export default Spinner;
