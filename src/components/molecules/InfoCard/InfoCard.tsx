"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn";

const infoCardVariants = cva(
  "bg-white rounded-lg shadow-lg p-6 mb-6",
  {
    variants: {
      variant: {
        default: "border border-gray-200",
        outline: "border-2 border-gray-200",
        elevated: "shadow-xl border border-gray-100",
        flat: "shadow-sm border border-gray-100",
      },
      size: {
        sm: "p-4 mb-4",
        default: "p-6 mb-6",
        lg: "p-8 mb-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InfoCardProps extends VariantProps<typeof infoCardVariants> {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  icon?: string;
  headerActions?: React.ReactNode;
}

export const InfoCard = React.memo<InfoCardProps>(({ 
  title, 
  children, 
  variant, 
  size, 
  className,
  titleClassName,
  icon,
  headerActions
}) => {
  return (
    <div className={cn(infoCardVariants({ variant, size, className }))}>
      {title && (
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className={cn(
            "text-xl font-semibold text-gray-800 flex items-center gap-2",
            titleClassName
          )}>
            {icon && <span>{icon}</span>}
            {title}
          </h2>
          {headerActions && (
            <div className="flex gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

export default InfoCard;
