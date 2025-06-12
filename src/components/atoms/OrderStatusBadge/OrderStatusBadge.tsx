"use client";

import React from "react";
import { Badge } from "../Badge";
import { cn } from "../../../utils/cn";

export interface OrderStatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const getStatusConfig = (status: string) => {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: string }> = {
    'waiting': { variant: 'secondary', label: 'En Espera', icon: '⏳' },
    'processing': { variant: 'default', label: 'Procesando', icon: '⚙️' },
    'manufacturing': { variant: 'default', label: 'Fabricando', icon: '🔧' },
    'shipping': { variant: 'outline', label: 'Enviando', icon: '📦' },
    'delivered': { variant: 'default', label: 'Entregado', icon: '✅' },
    'cancelled': { variant: 'destructive', label: 'Cancelado', icon: '❌' },
    'refunded': { variant: 'secondary', label: 'Reembolsado', icon: '💰' }
  };

  return statusMap[status.toLowerCase()] || statusMap['waiting'];
};

export const OrderStatusBadge = React.memo<OrderStatusBadgeProps>(({ 
  status, 
  className,
  size = "default"
}) => {
  const { variant, label, icon } = getStatusConfig(status);

  return (
    <Badge 
      variant={variant} 
      size={size}
      className={cn("flex items-center gap-1", className)}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Badge>
  );
});

OrderStatusBadge.displayName = "OrderStatusBadge";

export default OrderStatusBadge;
