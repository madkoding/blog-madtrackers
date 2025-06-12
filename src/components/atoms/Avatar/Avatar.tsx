"use client";

import React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarImageVariants = cva("aspect-square h-full w-full", {
  variants: {
    size: {
      sm: "h-8 w-8",
      default: "h-10 w-10", 
      lg: "h-12 w-12",
      xl: "h-16 w-16",
      "2xl": "h-20 w-20",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  showName?: boolean;
  name?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, showName = false, name, ...props }, ref) => {
    const initials = fallback || (name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '');

    return (
      <div className={cn("flex items-center", showName && "space-x-3")}>
        <div
          ref={ref}
          className={cn(avatarVariants({ size, className }))}
          {...props}
        >
          {src ? (
            <Image
              src={src}
              alt={alt || name || "Avatar"}
              className={cn(avatarImageVariants({ size }))}
              width={size === "sm" ? 32 : size === "lg" ? 48 : size === "xl" ? 64 : size === "2xl" ? 80 : 40}
              height={size === "sm" ? 32 : size === "lg" ? 48 : size === "xl" ? 64 : size === "2xl" ? 80 : 40}
            />
          ) : (
            <div className={cn(avatarFallbackVariants({ size }))}>
              {initials}
            </div>
          )}
        </div>
        {showName && name && (
          <div className="font-medium text-gray-900">{name}</div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
