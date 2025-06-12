"use client";

import React, { useCallback, useMemo } from 'react';
import { OrderStatus } from '../../../interfaces/tracking';
import { useLang } from '../../../app/lang-context';
import { translations } from '../../../app/i18n';
import { Button } from "../../atoms";

interface StatusSelectorProps {
  currentStatus: OrderStatus;
  onUpdate: (field: string, value: OrderStatus) => void;
  className?: string;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const StatusSelector = React.memo<StatusSelectorProps>(({ 
  currentStatus, 
  onUpdate, 
  className = "",
  disabled = false,
  layout = 'horizontal'
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const statuses = useMemo(() => [
    { 
      value: OrderStatus.WAITING, 
      label: t.orderStatus_waiting ?? 'Esperando', 
      color: 'bg-gray-500', 
      icon: '⏳',
      variant: 'outline' as const
    },
    { 
      value: OrderStatus.MANUFACTURING, 
      label: t.orderStatus_manufacturing ?? 'Fabricando', 
      color: 'bg-blue-500', 
      icon: '🔧',
      variant: 'default' as const
    },
    { 
      value: OrderStatus.TESTING, 
      label: t.orderStatus_testing ?? 'Probando', 
      color: 'bg-yellow-500', 
      icon: '🧪',
      variant: 'warning' as const
    },
    { 
      value: OrderStatus.SHIPPING, 
      label: t.orderStatus_shipping ?? 'Enviando', 
      color: 'bg-purple-500', 
      icon: '📦',
      variant: 'secondary' as const
    },
    { 
      value: OrderStatus.RECEIVED, 
      label: t.orderStatus_received ?? 'Recibido', 
      color: 'bg-green-500', 
      icon: '✅',
      variant: 'success' as const
    }
  ], [t]);

  const handleStatusChange = useCallback((statusValue: OrderStatus) => {
    if (statusValue !== currentStatus && !disabled) {
      onUpdate('estadoPedido', statusValue);
    }
  }, [currentStatus, onUpdate, disabled]);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-2';
      case 'grid':
        return 'grid grid-cols-2 md:grid-cols-3 gap-2';
      default:
        return 'flex flex-wrap gap-2';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-3">Estado del Pedido</div>
      <div className={getLayoutClasses()}>
        {statuses.map((status) => {
          const isSelected = currentStatus === status.value;
          
          return (
            <Button
              key={status.value}
              variant={isSelected ? status.variant : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(status.value)}
              disabled={disabled}
              className={`
                flex items-center gap-2 justify-center transition-all duration-200
                ${isSelected 
                  ? `${status.color} text-white shadow-lg scale-105 border-transparent` 
                  : 'hover:scale-102'
                }
                ${layout === 'vertical' ? 'w-full' : ''}
              `}
            >
              <span>{status.icon}</span>
              <span className="text-sm font-medium">{status.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
});

StatusSelector.displayName = 'StatusSelector';

export default StatusSelector;
