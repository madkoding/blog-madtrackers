"use client";

import React, { useMemo } from "react";
import { OrderStatus } from "../../../interfaces/tracking";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

interface OrderStatusTrackerProps {
  readonly currentStatus: OrderStatus;
}

interface StatusStep {
  status: OrderStatus;
  labelKey: string;
  icon: string;
}

const statusSteps: StatusStep[] = [
  {
    status: OrderStatus.WAITING,
    labelKey: "status_waiting",
    icon: "⏳"
  },
  {
    status: OrderStatus.MANUFACTURING,
    labelKey: "status_manufacturing", 
    icon: "🔧"
  },
  {
    status: OrderStatus.TESTING,
    labelKey: "status_testing",
    icon: "🧪"
  },
  {
    status: OrderStatus.SHIPPING,
    labelKey: "status_shipping",
    icon: "📦"
  },
  {
    status: OrderStatus.RECEIVED,
    labelKey: "status_received",
    icon: "✅"
  }
];

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = React.memo(({ currentStatus }) => {
  const { lang } = useLang();
  const t = translations[lang];

  const currentIndex = useMemo(() => {
    return statusSteps.findIndex(step => step.status === currentStatus);
  }, [currentStatus]);

  const progressWidth = useMemo(() => {
    return currentIndex > 0 ? `${(currentIndex / (statusSteps.length - 1)) * 100}%` : '0%';
  }, [currentIndex]);

  const mobileSteps = useMemo(() => 
    statusSteps.map((step, index) => {
      const isActive = index === currentIndex;
      const isCompleted = index < currentIndex;
      const isPending = index > currentIndex;
      
      return (
        <div key={step.status} className="flex items-center">
          {/* Icon container */}
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full text-lg
            ${isActive ? 'bg-blue-500 text-white shadow-lg' : ''}
            ${isCompleted ? 'bg-green-500 text-white' : ''}
            ${isPending ? 'bg-gray-200 text-gray-400' : ''}
          `}>
            {isCompleted ? '✓' : step.icon}
          </div>
          
          {/* Label */}
          <div className="ml-4 flex-1">
            <span className={`
              font-medium text-sm
              ${isActive ? 'text-blue-600' : ''}
              ${isCompleted ? 'text-green-600' : ''}
              ${isPending ? 'text-gray-400' : ''}
            `}>
              {t[step.labelKey as keyof typeof t]}
            </span>
          </div>
          
          {/* Active indicator */}
          {isActive && (
            <div className="ml-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      );
    }), [currentIndex, t]);

  const desktopSteps = useMemo(() => 
    statusSteps.map((step, index) => {
      const isActive = index === currentIndex;
      const isCompleted = index < currentIndex;
      const isPending = index > currentIndex;
      
      return (
        <div key={step.status} className="flex flex-col items-center relative z-10">
          {/* Icon container */}
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full text-lg mb-2 border-2
            ${isActive ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : ''}
            ${isCompleted ? 'bg-green-500 text-white border-green-500' : ''}
            ${isPending ? 'bg-white text-gray-400 border-gray-300' : ''}
          `}>
            {isCompleted ? '✓' : step.icon}
          </div>
          
          {/* Label */}
          <span className={`
            text-xs font-medium text-center max-w-20
            ${isActive ? 'text-blue-600' : ''}
            ${isCompleted ? 'text-green-600' : ''}
            ${isPending ? 'text-gray-400' : ''}
          `}>
            {t[step.labelKey as keyof typeof t]}
          </span>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute -bottom-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      );
    }), [currentIndex, t]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        {t.orderStatus}
      </h3>
      
      {/* Mobile version - Vertical */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {mobileSteps}
        </div>
      </div>

      {/* Desktop version - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: progressWidth }}
            ></div>
          </div>
          
          {desktopSteps}
        </div>
      </div>
    </div>
  );
});

OrderStatusTracker.displayName = 'OrderStatusTracker';

export default OrderStatusTracker;
