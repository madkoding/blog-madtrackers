import { OrderStatus } from '../interfaces/tracking';

// Tipos para componentes de admin
export interface ProgressSliderProps {
  label: string;
  percentage: number;
  color: string;
  field: string;
  onUpdate: (field: string, value: number) => void;
}

export interface InlineEditProps {
  value: string | number;
  field: string;
  type?: 'text' | 'number' | 'email' | 'date';
  onUpdate: (field: string, value: string | number | boolean) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  id?: string;
}

export interface ColorSelectorProps {
  selectedColor: string;
  field: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
}

export interface StatusSelectorProps {
  currentStatus: OrderStatus;
  onUpdate: (field: string, value: OrderStatus) => void;
  id?: string;
}

export interface SensorSelectorProps {
  selectedSensor: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
}

export interface CountrySelectorProps {
  selectedCountry: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
}

export interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

// Tipos para componentes de tracking (página de usuario)
export interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

export interface InfoRowProps {
  label: string;
  value: string | number | boolean;
}
