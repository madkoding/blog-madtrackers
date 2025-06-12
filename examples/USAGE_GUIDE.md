# 🚀 Guía Práctica: Usando los Componentes Migrados

## 📋 Imports Disponibles

```tsx
// Importación directa desde el sistema
import { 
  Button, 
  Input, 
  LoadingSpinner,
  Card,
  Navigation,
  UserForm,
  AdminLayout 
} from '@/components';

// O importación específica por nivel
import { Button, Input } from '@/components/atoms';
import { Card, InfoCard } from '@/components/molecules';
import { Navigation, FAQ } from '@/components/organisms';
import { AdminLayout } from '@/components/templates';
```

## 🎨 Ejemplos de Uso

### 1. **Navigation** (Migrado de navbar.tsx)

```tsx
// Antes (navbar.tsx)
import { NavBar } from '@/app/_components/navbar';

export function Layout() {
  return <NavBar />;
}

// Después - Opción 1: Directo
import { Navigation } from '@/components/organisms';
import { translations } from '@/app/i18n';

export function Layout() {
  const [lang, setLang] = useState('es');
  
  return (
    <Navigation 
      translations={translations[lang]}
      lang={lang}
      onLanguageChange={setLang}
    />
  );
}

// Después - Opción 2: Wrapper de compatibilidad
import { NavigationWrapper } from '@/app/_components/NavigationWrapper';

export function Layout() {
  return <NavigationWrapper />;
}
```

### 2. **LoadingSpinner** (Mejorado)

```tsx
// Antes
import LoadingSpinner from '@/app/_components/LoadingSpinner';

<LoadingSpinner />

// Después - Con variants
import { LoadingSpinner } from '@/components/atoms';

<LoadingSpinner size="lg" variant="primary" />
<LoadingSpinner size="sm" variant="white" />
```

### 3. **UserForm** (Simplificado)

```tsx
// Antes - Sistema complejo
import UserForm from '@/app/_components/UserForm';

// Después - Sistema tipado
import { UserForm } from '@/components/organisms';

<UserForm
  userData={user}
  saving={saving}
  saveStatus="success"
  validationErrors={errors}
  onFieldUpdate={handleUpdate}
  onSave={handleSave}
  onCancel={handleCancel}
  mode="edit"
/>
```

### 4. **FAQ** (Con nuevos componentes)

```tsx
// Antes
import Faq from '@/app/_components/faq';

<Faq />

// Después - Con props tipadas
import { FAQ } from '@/components/organisms';

<FAQ
  placeholder="¿Qué quieres saber?"
  submitButtonText="Consultar"
  onQuestionSubmit={(question, answer) => {
    // Analytics o logging
    console.log('Pregunta:', question);
  }}
/>
```

### 5. **Componentes Composables**

```tsx
import { 
  Card, 
  Button, 
  Input, 
  Badge,
  InfoCard,
  QuantitySelector 
} from '@/components';

export function ProductCard() {
  return (
    <Card className="max-w-md">
      <Card.Header>
        <Card.Title>madTracker Pro</Card.Title>
        <Card.Description>
          Tracker de última generación
        </Card.Description>
      </Card.Header>
      
      <Card.Content>
        <QuantitySelector
          quantities={[1, 3, 5, 10]}
          selectedQuantity={quantity}
          onQuantityChange={setQuantity}
          label="Cantidad de trackers"
        />
        
        <InfoCard 
          title="Especificaciones"
          icon="⚙️"
          variant="elevated"
        >
          <div className="space-y-2">
            <Badge variant="default">LSM6DSR</Badge>
            <Badge variant="outline">Magnetómetro</Badge>
          </div>
        </InfoCard>
      </Card.Content>
      
      <Card.Footer>
        <Button className="w-full">
          Agregar al Carrito
        </Button>
      </Card.Footer>
    </Card>
  );
}
```

## 🔧 Templates para Layouts

### AdminLayout Mejorado

```tsx
import { AdminLayout } from '@/components/templates';

export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout
      title="Dashboard"
      showNavigation={true}
      translations={translations.es}
      lang="es"
      onLanguageChange={handleLangChange}
    >
      {children}
    </AdminLayout>
  );
}
```

## 🎯 Patterns de Migración

### Pattern 1: Migración Directa
```tsx
// Para componentes simples
// ANTES:
import OldComponent from '@/app/_components/OldComponent';

// DESPUÉS:
import { NewComponent } from '@/components';
```

### Pattern 2: Wrapper de Compatibilidad
```tsx
// Para mantener compatibilidad temporal
// Crear: @/app/_components/OldComponentWrapper.tsx
import { NewComponent } from '@/components';
import { useOldHooks } from '@/hooks';

export const OldComponentWrapper = () => {
  const { oldData, oldHandlers } = useOldHooks();
  
  return (
    <NewComponent
      {...adaptOldPropsToNew(oldData)}
      {...oldHandlers}
    />
  );
};
```

### Pattern 3: Migración Progresiva
```tsx
// Para componentes complejos
// Paso 1: Usar atoms/molecules dentro del componente viejo
import { Button, Input, Card } from '@/components';

export function OldComplexComponent() {
  return (
    <Card> {/* Nuevo */}
      <OldLogicPart /> {/* Viejo */}
      <Button>Acción</Button> {/* Nuevo */}
    </Card>
  );
}

// Paso 2: Migrar completamente más tarde
```

## 📊 Ventajas Inmediatas

### ✅ Tipado Mejorado
```tsx
// Autocompletado completo
<Button 
  variant="outline" // ✅ Tipado: "default" | "outline" | "destructive"
  size="lg"         // ✅ Tipado: "sm" | "default" | "lg"
  disabled={false}  // ✅ Boolean tipado
/>
```

### ✅ Consistencia Visual
```tsx
// Todos los botones siguen el mismo sistema
<Button variant="default">Guardar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>
```

### ✅ Reutilización
```tsx
// Mismo componente, diferentes contexts
<InfoCard title="Usuario" icon="👤">
  <UserInfo />
</InfoCard>

<InfoCard title="Pedido" icon="📦" variant="elevated">
  <OrderInfo />
</InfoCard>
```

## 🚀 Próximos Pasos

1. **Crear wrappers** para componentes complejos pendientes
2. **Migrar imports** progresivamente en páginas
3. **Añadir tests** para componentes migrados
4. **Documentar patterns** específicos del proyecto

## 📚 Recursos

- **Atomic Design Guide**: `/ATOMIC_DESIGN.md`
- **Component Library**: `/src/components/`
- **Migration Examples**: `/examples/`
- **Build Validation**: `npm run build`
