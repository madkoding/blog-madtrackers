import { InfoCardProps } from '../../../types/admin';

export default function InfoCard({ title, children }: Readonly<InfoCardProps>) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
