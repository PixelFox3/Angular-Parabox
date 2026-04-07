# 🛒 Angular E-Commerce Showcase – Roadmap

## 🎯 Objetivo

Construir un e-commerce fullstack moderno tipo Amazon para demostrar:

* Arquitectura escalable
* Buenas prácticas en Angular
* Integración frontend + backend
* UX/UI profesional
* Testing y performance

---

# 🧱 Fase 1 – DevOps Foundation *(antes de escribir una línea de negocio)*

> El pipeline se levanta primero para que cada commit quede desplegado automáticamente desde el día 1.

## �️ Estructura del repositorio — Monorepo

> Un único repo, tres carpetas raíz. Cada servicio se configura de forma independiente en su plataforma de deploy.

```
Angular-Parabox/
├── frontend/          ← Angular 21 (Vercel — Root Directory: frontend/)
├── backend/           ← NestJS API (Railway — Root Directory: backend/)
├── shared/            ← Interfaces y DTOs TypeScript compartidos
└── docker-compose.yml ← Levanta todos los servicios localmente
```

* [x] Mover código Angular actual a `frontend/`
* [x] Crear proyecto NestJS en `backend/`
* [x] Crear carpeta `shared/types/` con interfaces comunes (DTOs, enums, modelos)
* [x] Configurar Vercel → Root Directory: `frontend/`
* [x] Configurar Railway → Root Directory: `backend/`
* [ ] `docker-compose.yml` en raíz que levanta `frontend` + `api` + `postgres` + `redis` + `mailhog`
* [ ] `.gitignore` unificado + `.env` separados por servicio

## 🐳 Entorno local

* [ ] Variables de entorno por stage (`frontend/.env.local`, `backend/.env.local`, `backend/.env.production`)

## 🔁 CI/CD — GitHub Actions *(opcional mientras no haya tests)*

> Vercel ya hace el deploy automático al conectar el repo. GitHub Actions añade un paso previo: bloquear el deploy si los tests fallan.

* [ ] Pipeline `on: push` → `lint → unit tests → build` (el deploy lo sigue haciendo Vercel)
* [ ] Activar cuando haya tests reales que ejecutar (Fase 14)

## 🌐 Deploy continuo

* [x] Frontend → **Vercel** *(ya configurado — deploy automático en cada push, preview URL por PR)*
* [x] Base de datos → **Postgres en Railway**
* [x] Backend API → **Railway** (aloja el proceso NestJS — distinto de la BD)
* [ ] URL pública disponible desde el primer deploy vacío

> ⚠️ NeonDB = solo base de datos. Railway/Render = solo el servidor API. Ambos son necesarios cuando llegue el backend.

## 📖 Documentación base

* [ ] README con arquitectura, stack, instrucciones de setup local y enlaces al deploy
* [ ] Health check endpoint `GET /api/health` (primer endpoint de la API)
* [ ] Swagger / OpenAPI configurado desde el inicio (se va poblando con cada endpoint)

---

# ⚙️ Fase 2 – Backend Foundation *(API + base de datos)*

> Todo lo demás depende de esto. Se define primero.

## 🗄️ Base de datos — diseño de entidades

* [ ] `User` (id, email, passwordHash, role, `expiresAt`, `pendingDeletion`, createdAt)
* [ ] `Product` (id, name, description, price, category, images, variants, stock)
* [ ] `ProductVariant` (id, productId, size, color, stock)
* [ ] `Address` (id, userId, street, city, country, isDefault)
* [ ] `Order` (id, userId, status, shippingAddressId, total, createdAt)
* [ ] `OrderItem` (id, orderId, productVariantId, quantity, unitPrice)
* [ ] `Coupon` (id, code, discount, type, expiresAt, usageLimit)
* [ ] `NewsletterSubscriber` (id, email, subscribedAt, unsubscribeToken)
* [ ] `EmailLog` (id, recipient, type, status, sentAt)
* [ ] Relaciones, índices y soft delete en entidades críticas
* [ ] Seed de datos iniciales (productos demo, categorías, usuario admin)

## 🧠 API — módulos iniciales

* [ ] CRUD productos (con variantes y stock por variante)
* [ ] CRUD usuarios (con campo `expiresAt`, soft delete)
* [ ] CRUD órdenes + endpoint de cambio de estado
* [ ] Endpoint de newsletter (`subscribe` / `unsubscribe`)
* [ ] Paginación y filtrado en todos los listados
* [ ] Manejo de errores global (filtro de excepciones NestJS)
* [ ] Variables de entorno seguras (validación con `@nestjs/config`)

## 🔧 Stack

* NestJS + TypeORM / Prisma
* PostgreSQL
* BullMQ + Redis (colas de email y cron jobs)
* Resend / Nodemailer (Ethereal / MailHog en dev)

---

# 🧩 Fase 3 – Arquitectura Angular *(base del frontend)*

> Se establece antes de construir features para que todo siga el mismo patrón.

## 🏗️ Estructura

* [ ] Standalone components en todos los módulos
* [ ] Lazy loading de rutas (feature-based routing)
* [ ] Separación smart / dumb components
* [ ] Interceptor HTTP base (manejo de errores + token)

## 📡 Estado global con Signals / NgRx

* [ ] Estado del carrito
* [ ] Estado del usuario autenticado
* [ ] Estado de expiración de cuenta temporal
* [ ] Estado de configuración de tienda

---

# 🔐 Fase 4 – Autenticación & Cuentas temporales

> Ahora sí: el backend existe y la arquitectura Angular está lista.

## 🔐 Autenticación

* [ ] Registro de usuario (con campo `expiresAt` asignado automáticamente)
* [ ] Login con JWT (access token + refresh token silencioso)
* [ ] Login social (Google / GitHub OAuth)
* [ ] Logout
* [ ] Verificación de email tras el registro
* [ ] Recuperación de contraseña
* [ ] Guards de rutas (autenticado / admin)
* [ ] Interceptor para añadir `Authorization: Bearer` a los requests

## 👤 Cuentas temporales

> Las cuentas demo se eliminan automáticamente tras X días (configurable por variable de entorno).

* [ ] Cron job en backend para eliminar usuarios con `expiresAt` pasado (soft delete → hard delete)
* [ ] Banner en el frontend mostrando los días restantes hasta la eliminación
* [ ] Email de aviso automático 24 h antes de la expiración
* [ ] Opción "Hacer cuenta permanente" (flujo de upgrade para la demo)

## 👤 Perfil de usuario

* [ ] Perfil editable (nombre, avatar, contraseña)
* [ ] Persistencia de sesión (`localStorage` + refresh token)
* [ ] Gestión de direcciones de envío (añadir, editar, eliminar, dirección por defecto)

---

# 🔍 Fase 5 – Catálogo & Productos

> El núcleo visible del e-commerce. Necesario antes del carrito.

## 🔎 Búsqueda

* [ ] Buscador con debounce
* [ ] Resultados en tiempo real
* [ ] Autocompletado / sugerencias mientras se escribe
* [ ] Búsqueda por voz (Web Speech API, nice-to-have)

## 🎛️ Filtros & Ordenación

* [ ] Por precio (rango slider)
* [ ] Por categoría
* [ ] Por rating
* [ ] Por disponibilidad (en stock / agotado)
* [ ] Precio asc/desc, popularidad, novedades

## 🔗 URL sync

* [ ] Query params para filtros y ordenación (compartible + botón "atrás" funcional)

---

# 🛒 Fase 6 – Carrito, Checkout & Órdenes

> El flujo principal de compra. Depende de catálogo + auth.

## 🛒 Carrito

* [ ] Añadir / eliminar / modificar cantidad
* [ ] Persistencia local (anónimo) y sincronización con backend (logado)
* [ ] Selector de variante (talla / color) al añadir

## 🛍️ Checkout

* [ ] Formulario de envío (dirección guardada o nueva)
* [ ] Validaciones avanzadas
* [ ] Aplicar código de descuento / cupón
* [ ] Resumen de compra (subtotal, envío, impuestos, total)
* [ ] Simulación de pago (Stripe recomendado, modo test)
* [ ] Página de confirmación post-compra con número de pedido

## 📦 Órdenes

* [ ] Crear orden desde carrito al confirmar pago
* [ ] Historial de pedidos paginado
* [ ] Detalle de pedido
* [ ] Estados: `pendiente → procesando → enviado → entregado → cancelado`
* [ ] Cancelar pedido (solo en estado "pendiente")
* [ ] Flujo de devolución / reembolso (mock)
* [ ] Generar factura PDF descargable

---

# 📧 Fase 7 – Sistema de Email & Newsletter

> Depende de que existan órdenes y usuarios. Ahora tiene sentido completo.

## ✉️ Emails transaccionales

* [ ] Email de bienvenida al registrarse (con aviso de cuenta temporal)
* [ ] Email de confirmación de pedido (resumen + total + número de pedido)
* [ ] Email de cambio de estado del pedido:
  * `Pendiente → Procesando`
  * `Procesando → Enviado` (con número de seguimiento mock)
  * `Enviado → Entregado`
* [ ] Email de aviso de expiración de cuenta (−24 h antes)
* [ ] Email de recuperación de contraseña

## 📰 Newsletter (dummy)

* [ ] Formulario de suscripción (footer + modal de bienvenida)
* [ ] Links de "darse de baja" en el footer de todos los emails (CAN-SPAM / GDPR)
* [ ] Envío simulado de newsletter desde el panel admin

## 🧩 Infraestructura de email

* [ ] Plantillas HTML reutilizables con variables dinámicas (nombre, pedido, tracking, días restantes)
* [ ] Cola de emails con BullMQ (no bloquea la API)
* [ ] Logging de todos los emails enviados en la tabla `email_log`
* [ ] Ethereal / MailHog en entorno local y de CI

---

# ❤️ Fase 8 – Funcionalidades de usuario

> Requiere auth + catálogo + órdenes funcionando.

* [ ] Wishlist / Lista de deseos persistente
* [ ] Guardar carrito (sincronizado con backend cuando está logado)
* [ ] Productos vistos recientemente
* [ ] Comparación de productos (hasta 3 a la vez)
* [ ] Código de referido (mock, generado por usuario)

---

# 📊 Fase 9 – Admin Dashboard

> Gestiona todo lo construido en las fases anteriores.

* [ ] Crear / editar / eliminar productos (con variantes y stock)
* [ ] Gestionar pedidos (cambiar estado → dispara email automático al cliente)
* [ ] Gestión de usuarios (ver, suspender, eliminar, ver estado de expiración)
* [ ] Gestión de suscriptores newsletter (listado + envío simulado de campaña)
* [ ] Vista de logs de emails enviados
* [ ] Gestión de cupones de descuento
* [ ] Métricas básicas (ventas, pedidos, usuarios activos — gráficos con Chart.js / ng2-charts)

---

# 🎨 Fase 10 – UX/UI profesional *(polish)*

> Se aplica sobre features ya funcionales, no antes.

## ✨ Mejoras visuales

* [ ] Skeleton loaders en listados y detalles
* [ ] Toast notifications
* [ ] Animaciones de transición (Angular Animations)
* [ ] Dark / Light mode con persistencia
* [ ] Breadcrumbs en páginas de producto y checkout

## 📱 Responsive

* [ ] Revisión mobile-first de todas las pantallas
* [ ] Sidebar adaptable

## 📦 Página de producto

* [ ] Galería de imágenes con zoom
* [ ] Selector de variantes (talla / color)
* [ ] Indicador de stock ("quedan X unidades")
* [ ] Reviews y Rating por estrellas
* [ ] Productos relacionados

## ⚠️ Páginas de estado

* [ ] Página 404 personalizada
* [ ] Página 500 / Error genérico
* [ ] Página de mantenimiento (configurable desde admin)

---

# 🔐 Fase 11 – Seguridad *(hardening)*

> Los ítems críticos (guards, env vars, interceptor) ya están desde fases anteriores. Aquí se hace el endurecimiento completo.

* [ ] Rate limiting en endpoints públicos (login, registro, newsletter)
* [ ] CSRF protection en formularios
* [ ] Protección de endpoints backend por roles (admin / user)
* [ ] Sanitización de inputs en frontend y backend
* [ ] Auditoría de headers HTTP (Helmet en NestJS)
* [ ] GDPR / Banner de consentimiento de cookies
* [ ] Política de privacidad y T&C (páginas estáticas)

---

# 🚀 Fase 12 – Performance & optimización

* [ ] Lazy loading de imágenes (`NgOptimizedImage`)
* [ ] Imágenes en formato WebP
* [ ] `trackBy` en todas las listas
* [ ] Angular Universal (SSR)
* [ ] PWA (offline support, service worker)
* [ ] Prefetch de rutas más visitadas

---

# 🌍 Fase 13 – Internacionalización (i18n)

## 🌐 Traducciones

* [ ] Soporte multi-idioma (es/en)
* [ ] JSON de traducciones

## ⚙️ Implementación

* [ ] Angular i18n o ngx-translate
* [ ] Pipe de traducción
* [ ] Cambio dinámico de idioma

## 💱 Localización

* [ ] Formato de moneda dinámico
* [ ] Formato de fechas por país

---

# 🧪 Fase 14 – Testing

## ✅ Unit testing

* [ ] Componentes críticos
* [ ] Servicios (cart, auth, email queue)

## 🔁 E2E

* [ ] Flujo de compra completo
* [ ] Login / registro / logout
* [ ] Checkout con pago simulado
* [ ] Verificación de recepción de email (Ethereal / MailHog en CI)

---

# 💡 Fase 15 – Features avanzadas (WOW factor)

* [ ] Recomendaciones de productos (mock AI basado en historial de vistas)
* [ ] Generación de factura PDF descargable (jsPDF / Puppeteer en backend)
* [ ] Tracking de pedidos con timeline visual
* [ ] Notificaciones en tiempo real (WebSockets / SSE para cambios de estado)
* [ ] Exportar historial de pedidos a CSV
* [ ] Búsqueda semántica (mock embeddings o integración con Typesense)

---

# 📈 Observabilidad *(ongoing — se añade en paralelo con las fases)*

* [ ] Sentry (frontend error tracking)
* [ ] Logging estructurado en backend (Winston / Pino)
* [ ] Diagrama de arquitectura (C4 o similar)

* [ ] Registro de usuario (con campo `expiresAt` para cuentas temporales)
* [ ] Login (JWT o Firebase)
* [ ] Login social (Google / GitHub OAuth)
* [ ] Logout
* [ ] Guards de rutas
* [ ] Interceptor para añadir token a requests
* [ ] Refresh token silencioso
* [ ] Verificación de email tras el registro

## 👤 Cuentas de usuario temporales

> Las cuentas demo se autodestruyen tras X días para mantener la base de datos limpia.

* [ ] Campo `expiresAt` en la entidad User (configurable por env variable, ej. 7 días)
* [ ] Cron job / tarea programada en el backend para eliminar usuarios expirados
* [ ] Banner de advertencia en el frontend mostrando los días restantes antes de la eliminación
* [ ] Email de aviso 24 h antes de la eliminación automática
* [ ] Opción "Hacer cuenta permanente" (flujo de upgrade para la demo)
* [ ] Soft delete antes del hard delete (marcar como `pendingDeletion`)

## 👤 Perfil de usuario

* [ ] Perfil editable (nombre, avatar, contraseña)
* [ ] Persistencia de sesión
* [ ] Gestión de direcciones de envío (añadir, editar, eliminar, dirección por defecto)

---