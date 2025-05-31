import { InfoRowProps } from '../../../types/admin';
import { useLang } from '../../lang-context';
import { translations } from '../../i18n';

export default function InfoRow({ label, value }: Readonly<InfoRowProps>) {
  const { lang } = useLang();
  const t = translations[lang];
  
  let displayValue: string | number;
  if (typeof value === 'boolean') {
    displayValue = value ? t.yes : t.no;
  } else {
    displayValue = value;
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-800">{displayValue}</span>
    </div>
  );
}
