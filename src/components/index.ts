// Design System - Atomic Design Structure
// Exportar todos los componentes organizados por nivel de Atomic Design

// Atoms - Componentes básicos e indivisibles
export * from './atoms';

// Molecules - Grupos simples de átomos que trabajan juntos  
export * from './molecules';

// Organisms - Grupos complejos de moléculas y/o átomos
export * from './organisms';

// Templates - Estructuras de página que muestran el layout de organismos
export * from './templates';

// Re-exportaciones convenientes para imports directos
export { 
  Button, 
  Input, 
  Label, 
  Avatar, 
  Spinner, 
  Badge, 
  LoadingSpinner,
  OrderStatusBadge 
} from './atoms';

export { 
  Card, 
  SearchBox, 
  FormField, 
  ProgressSlider, 
  Alert,
  QuantitySelector,
  InfoCard
  // CurrencyDisplay // Temporarily disabled
} from './molecules';

export { 
  Header, 
  Footer, 
  PricingForm, 
  Navigation,
  UserForm,
  FAQ
} from './organisms';

export { 
  MainLayout, 
  AdminLayout 
} from './templates';
