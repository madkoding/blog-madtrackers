import React from 'react';
import { cn } from "../../../utils/cn";

interface ProgressBarProps {
  label?: string;
  percentage: number;
  color?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'default' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const colorVariants = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const sizeVariants = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-3',
};

const ProgressBar: React.FC<ProgressBarProps> = React.memo(({ 
  label, 
  percentage, 
  color,
  variant = 'default',
  size = 'default',
  showPercentage = true,
  animated = true,
  className = ""
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const progressColor = color ?? colorVariants[variant];
  
  return (
    <div className={cn("mb-4", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">{clampedPercentage}%</span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        sizeVariants[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            progressColor,
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
