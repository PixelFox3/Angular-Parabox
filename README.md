# PARABOX - E-Commerce Showcase Angular

[![Live Demo](https://img.shields.io/badge/%20Live%20Demo-00b8d9?style=for-the-badge&logo=vercel&logoColor=white)](https://paraboxstore.vercel.app)
[![Roadmap](https://img.shields.io/badge/%20Roadmap-0077aa?style=for-the-badge&logo=github&logoColor=white)](./roadmap.md)

Un proyecto de e-commerce moderno construido con **Angular 21** demostrando las mejores prácticas y patrones arquitectónicos actuales en desarrollo Angular.

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Arquitectura](#arquitectura)
- [Buenas Prácticas Implementadas](#buenas-prácticas-implementadas)
- [Stack Tecnológico](#stack-tecnológico)

---

## 📦 Descripción del Proyecto

**Parabox** es una aplicación e-commerce de showcase construida con Angular 21 que presenta un catálogo de productos, carrito de compras funcional y área de cliente. El proyecto enfatiza arquitectura moderna, mantenibilidad y adherencia a los estándares actuales de desarrollo Angular.

### Características Principales

- 🛍️ Catálogo de productos dinámico
- 🛒 Carrito de compras con gestión de estado con Signals
- 🎨 Sistema de temas (Light, Dark, Cyberpunk)
- 🌍 Soporte multi-país con configuración de divisas
- 👤 Área de cliente
- 📱 Diseño responsive
- ♿ Accesibilidad WCAG compliant
- ⚡ Change Detection OnPush optimizado

---

## 🏗️ Arquitectura

El proyecto implementa una **arquitectura basada en características (Feature-Based Architecture)** moderna, que es el estándar recomendado por Angular.

### Estructura de Directorios

```
Angular-Parabox/                  ← Monorepo
├── frontend/                     ← Angular 21 · deploy en Vercel
│   ├── src/
│   │   └── app/
│   │       ├── shared/           # Componentes y servicios compartidos
│   │       │   ├── components/
│   │       │   └── services/
│   │       ├── features/         # Módulos de características independientes
│   │       │   ├── FeatureName/
│   │       │   │   ├── components/
│   │       │   │   └── services/
│   │       │   └── ... (cart, products, client, checkout)
│   │       ├── app.ts            # Componente raíz
│   │       ├── app.routes.ts     # Configuración de rutas
│   │       └── app.config.ts     # Configuración de la aplicación
│   └── angular.json
├── backend/                      ← NestJS API · deploy en Railway
│   └── src/
│       ├── modules/              # Un módulo NestJS por dominio
│       ├── shared/               # Guards, interceptors, pipes globales
│       └── main.ts
├── shared/                       ← Tipos TypeScript compartidos
│   └── types/                    # DTOs e interfaces (frontend ↔ backend)
└── docker-compose.yml            ← Levanta todos los servicios localmente
```

### Patrón Feature-Based (Basado en Características)

Esta arquitectura organiza el código alrededor de **features o módulos de negocio** independientes:

- **Escalabilidad**: Fácil agregar nuevas características sin afectar el resto
- **Mantenibilidad**: Cada feature es autocontenida
- **Reutilización**: Shared contiene reutilizables globales
- **Testing**: Cada feature puede testearse de forma independiente
- **Lazy Loading**: Las features se cargan bajo demanda

---

## ✨ Buenas Prácticas Implementadas

### 1. **Componentes Standalone** ⭐
Todos los componentes utilizan la característica standalone de Angular, eliminando la necesidad de NgModules:

```typescript
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `...`,
})
export class NavbarComponent { }
```

**Beneficio**: Código más limpio, reducción de boilerplate, mejor tree-shaking.

---

### 2. **Change Detection Strategy: OnPush** ⚡
Implementación de `ChangeDetectionStrategy.OnPush` para optimizar el renderizado:

```typescript
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class AppComponent { }
```

**Beneficio**: 
- Mejor rendimiento (evita ciclos de detección innecesarios)
- Código más predecible
- Preparación para zoneless applications (futuro de Angular)

---

### 3. **Angular Signals para State Management** 🎯
Uso de Signals como primitiva reactiva moderna:

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  items = computed(() => this.cartItems());
  
  total = computed(() => {
    return this.cartItems().reduce((sum, item) => 
      sum + item.product.price * item.quantity, 0);
  });
}
```

**Beneficio**:
- State management granular y eficiente
- Computed signals para derivar valores automáticamente
- Mejor rendimiento que Observables para UI state
- API más intuitiva y menos boilerplate que RxJS

---

### 4. **Template Moderno con Control Flow Built-in** 📝
Uso de las nuevas directivas de control de flujo integradas:

```html
@if (cartService.items().length === 0) {
  <div class="empty-cart">...</div>
} @else {
  <div class="cart-content">...</div>
}

@for (item of cartService.items(); track item.product.id) {
  <div class="cart-item">...</div>
}
```

**Beneficio**:
- Sintaxis más clara y performante
- `track` función explícita para optimizar iteraciones
- Mejor soporte de TypeScript
- Eliminación de `*ngIf` y `*ngFor`

---

### 5. **Tipado Fuerte, Strict Mode e Interfaces Exhaustivas** 📋
Configuración TypeScript completa con modo estricto e interfaces en todo el código:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true
  },
  "angularCompilerOptions": {
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

```typescript
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}
```

**Beneficio**:
- Type-safety completo en templates y código
- Detección de errores en tiempo de compilación
- Mejor experiencia IDE y autocompletado
- Refactoring seguro
Rutas configuradas con lazy loading de componentes:

```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.component')
      .then((m) => m.HomeComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/components/cart.component')
      .then((m) => m.CartComponent),
  },
];
```

**Beneficio**:
- Reducción del bundle inicial
- Carga bajo demanda
- Mejor rendimiento de inicio

---

### 7. **Inyección de Dependencias Moderna** 💉
Uso de `inject()` en lugar de constructor:

```typescript
import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
})
export class CartComponent {
  cartService = inject(CartService);
}
```

**Beneficio**:
- Sintaxis más limpia
- Mejor para composición
- Sin necesidad de declarar propiedades privadas

---

### 8. **Separación de Concerns** 🎪
Organización clara entre componentes, servicios y modelos:

- **Componentes**: Únicamente presentación y manejo de eventos
- **Servicios**: Lógica de negocio y state management
- **Modelos**: Interfaces y tipos de datos

```
features/cart/
├── components/      # Presentación
├── services/        # Lógica de negocio
└── models/         # Tipos (si aplica)
```

---

### 9. **Accesibilidad (A11y)** ♿
Implementación de estándares WCAG:

```html
<button
  (click)="toggleDropdown()"
  [attr.aria-label]="'Change theme, current: ' + currentTheme"
  [attr.aria-expanded]="isDropdownOpen()"
>
  Theme
</button>

<button
  (click)="decrementQuantity(item.product.id)"
  [attr.aria-label]="'Decrease quantity of ' + item.product.name"
>
  −
</button>
```

**Beneficio**:
- Accesible para usuarios con discapacidad
- Mejor SEO
- Cumplimiento normativo

---

### 10. **Temas Dinámicos con CSS Variables** 🎨
Sistema de temas robusto y reutilizable:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<ThemeType>('light');
  
  setTheme(theme: ThemeType): void {
    this.currentTheme.set(theme);
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
```

**Beneficio**:
- Temas intercambiables sin recargar
- Persistencia de preferencias
- Fácil mantenimiento

---

### 11. **Configuración Multi-País** 🌍
Sistema robusto para manejo de divisas y regulaciones:

```typescript
export interface CountryConfig {
  code: CountryCode;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  showPricesWithTax: boolean;
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  ES: { /* ... */ },
  US: { /* ... */ },
  // ...
};
```

**Beneficio**:
- Escalable a múltiples regiones
- Configuración centralizada y tipada

---

### 12. **Reactive Patterns con Computed Signals** 🔄
Derivación automática de valores reactivos:

```typescript
total = computed(() => {
  return this.cartItems().reduce((sum, item) => 
    sum + item.product.price * item.quantity, 0);
});

itemCount = computed(() => {
  return this.cartItems().reduce((sum, item) => 
    sum + item.quantity, 0);
});
```

**Beneficio**:
- Actualizaciones automáticas y eficientes
- Sin side-effects

---

### 13. **Testing con Vitest** 🧪
Configuración moderna de testing:

```json
{
  "devDependencies": {
    "vitest": "^4.0.8",
    "jsdom": "^28.0.0"
  }
}
```

**Beneficio**:
- Testing rápido y moderno
- Excelente documentación
- Integración con Angular CLI

---

### 14. **RxJS para Operaciones Asíncronas** 📡
Integración correcta de RxJS para estado global:

```typescript
import { Observable } from 'rxjs';

// Usado para operaciones asíncronas en servicios
// mientras que signals se usan para UI state
```

---

## 🛠️ Stack Tecnológico

| Tecnología       | Versión | Propósito                |
| ---------------- | ------- | ------------------------ |
| **Angular**      | 21.2.0  | Framework principal      |
| **TypeScript**   | 5.9.2   | Lenguaje de programación |
| **RxJS**         | 7.8.0   | Programación reactiva    |
| **Tailwind CSS** | 4.1.12  | Framework CSS            |
| **Vitest**       | 4.0.8   | Testing unitario         |
| **PostCSS**      | 8.5.3   | Procesamiento de CSS     |
| **Prettier**     | 3.8.1   | Formateador de código    |

---

## 📊 Decisiones Arquitectónicas

| Decisión                   | Razón                                 |
| -------------------------- | ------------------------------------- |
| **Componentes Standalone** | Elimina NgModules, reduce boilerplate |
| **OnPush CD**              | Mejor rendimiento, predecible         |
| **Signals**                | Modern, performante, zoneless-ready   |
| **Feature-Based**          | Escalable, mantenible, testeable      |
| **Lazy Loading**           | Reduce bundle inicial                 |
| **Vitest**                 | Más rápido que Karma/Jasmine          |

---

## 🔐 Seguridad

- ✅ Strict TypeScript mode
- ✅ No implicit any
- ✅ Type-safe templates
- ✅ XSS protection (Angular integrado)
- ✅ CSRF tokens (preparado para backend)

---

## 📈 Rendimiento

### Optimizaciones Implementadas

1. **OnPush Change Detection** - Reduce ciclos de detección
2. **Lazy Loading** - Carga bajo demanda
3. **Computed Signals** - Memoización automática
4. **Track Function** - Optimización de loops

---

## 🎓 Recursos de Aprendizaje

### Angular Official
- [Angular Best Practices](https://angular.dev/guide/styleguide)
- [Signals Documentation](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/standalone-components)

### Acerca de Feature-Based Architecture
- [Feature-Based Architecture](https://angular.io/guide/styleguide#style-02-08)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)

---