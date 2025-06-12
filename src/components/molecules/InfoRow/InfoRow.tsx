import React, { useMemo } from 'react';

export interface InfoRowProps {
  label: string;
  value: string | number | boolean;
  translations?: {
    yes: string;
    no: string;
  };
}

const InfoRow: React.FC<InfoRowProps> = React.memo(({ label, value, translations }) => {
  const displayValue = useMemo(() => {
    if (typeof value === 'boolean') {
      return value ? (translations?.yes || 'Yes') : (translations?.no || 'No');
    }
    return value;
  }, [value, translations]);

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-800">{displayValue}</span>
    </div>
  );
});

InfoRow.displayName = 'InfoRow';

export { InfoRow };
