"use client";

import React, { useMemo } from "react";
import { OrderStatus } from "../../../interfaces/tracking";
import { translations } from "../../../app/i18n";
import { useLang } from "../../../app/lang-context";
import { Badge } from "../../atoms";
import { Card } from "../../molecules";

interface OrderStatusTrackerProps {
  readonly currentStatus: OrderStatus;
  className?: string;
  compact?: boolean;
}

interface StatusStep {
  status: OrderStatus;
  labelKey: string;
  icon: string;
  color: "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
}

const statusSteps: StatusStep[] = [
  {
    status: OrderStatus.WAITING,
    labelKey: "status_waiting",
    icon: "⏳",
    color: "outline"
  },
  {
    status: OrderStatus.MANUFACTURING,
    labelKey: "status_manufacturing", 
    icon: "🔧",
    color: "default"
  },
  {
    status: OrderStatus.TESTING,
    labelKey: "status_testing",
    icon: "🧪",
    color: "warning"
  },
  {
    status: OrderStatus.SHIPPING,
    labelKey: "status_shipping",
    icon: "📦",
    color: "secondary"
  },
  {
    status: OrderStatus.RECEIVED,
    labelKey: "status_received",
    icon: "✅",
    color: "success"
  }
];

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = React.memo(({ 
  currentStatus, 
  className = "",
  compact = false 
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const currentIndex = useMemo(() => {
    return statusSteps.findIndex(step => step.status === currentStatus);
  }, [currentStatus]);

  if (compact) {
    const currentStep = statusSteps[currentIndex];
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">{currentStep.icon}</span>
        <Badge variant={currentStep.color}>
          {t[currentStep.labelKey as keyof typeof t] ?? currentStep.labelKey}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Estado del Pedido
          </h3>
          <p className="text-sm text-gray-600">
            Sigue el progreso de tu pedido en tiempo real
          </p>
        </div>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
            <div 
              className="bg-blue-500 w-full transition-all duration-500 ease-in-out"
              style={{ 
                height: `${(currentIndex / (statusSteps.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Status steps */}
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={step.status} className="relative flex items-center">
                  {/* Icon */}
                  <div 
                    className={`
                      relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-blue-100 shadow-lg scale-110' : ''}
                    `}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 
                        className={`
                          font-medium transition-colors duration-300
                          ${isCompleted ? 'text-gray-900' : 'text-gray-500'}
                          ${isCurrent ? 'text-blue-600 font-semibold' : ''}
                        `}
                      >
                        {t[step.labelKey as keyof typeof t] ?? step.labelKey}
                      </h4>
                      
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Actual
                        </Badge>
                      )}
                      
                      {isCompleted && !isCurrent && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                    
                    {isCurrent && (
                      <p className="text-sm text-gray-600 mt-1">
                        {step.status === OrderStatus.WAITING && "Tu pedido está en cola de producción"}
                        {step.status === OrderStatus.MANUFACTURING && "Estamos fabricando tu tracker"}
                        {step.status === OrderStatus.TESTING && "Realizando pruebas de calidad"}
                        {step.status === OrderStatus.SHIPPING && "Tu pedido está en camino"}
                        {step.status === OrderStatus.RECEIVED && "¡Tu pedido ha sido entregado!"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Los tiempos pueden variar según la disponibilidad de componentes
          </p>
        </div>
      </div>
    </Card>
  );
});

OrderStatusTracker.displayName = "OrderStatusTracker";

export default OrderStatusTracker;
