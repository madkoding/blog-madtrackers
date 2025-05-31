"use client";

import { StatusSelectorProps } from '../../../types/admin';
import { OrderStatus } from '../../../interfaces/tracking';
import { useLang } from '../../lang-context';
import { translations } from '../../i18n';

export default function StatusSelector({ currentStatus, onUpdate }: Readonly<StatusSelectorProps>) {
  const { lang } = useLang();
  const t = translations[lang];

  const statuses = [
    { value: OrderStatus.WAITING, label: t.orderStatus_waiting, color: 'bg-gray-500', icon: '⏳' },
    { value: OrderStatus.MANUFACTURING, label: t.orderStatus_manufacturing, color: 'bg-blue-500', icon: '🔧' },
    { value: OrderStatus.TESTING, label: t.orderStatus_testing, color: 'bg-yellow-500', icon: '🧪' },
    { value: OrderStatus.SHIPPING, label: t.orderStatus_shipping, color: 'bg-purple-500', icon: '📦' },
    { value: OrderStatus.RECEIVED, label: t.orderStatus_received, color: 'bg-green-500', icon: '✅' }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-3">Estado del Pedido</div>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => {
              if (status.value !== currentStatus) {
                onUpdate('estadoPedido', status.value);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentStatus === status.value
                ? `${status.color} text-white shadow-lg scale-105`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
            }`}
          >
            <span>{status.icon}</span>
            <span className="text-sm font-medium">{status.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
