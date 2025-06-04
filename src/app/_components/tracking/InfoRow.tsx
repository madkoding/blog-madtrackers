import React, { useMemo } from 'react';
import { InfoRowProps } from '../../../types/admin';
import { useLang } from '../../lang-context';
import { translations } from '../../i18n';

const InfoRow: React.FC<InfoRowProps> = React.memo(({ label, value }) => {
  const { lang } = useLang();
  const t = translations[lang];
  
  const displayValue = useMemo(() => {
    if (typeof value === 'boolean') {
      return value ? t.yes : t.no;
    }
    return value;
  }, [value, t.yes, t.no]);

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-800">{displayValue}</span>
    </div>
  );
});

InfoRow.displayName = 'InfoRow';

export default InfoRow;
