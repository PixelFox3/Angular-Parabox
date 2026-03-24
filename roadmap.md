# 🛒 Angular E-Commerce Showcase – Roadmap

## 🎯 Objetivo

Construir un e-commerce fullstack moderno tipo Amazon para demostrar:

* Arquitectura escalable
* Buenas prácticas en Angular
* Integración frontend + backend
* UX/UI profesional
* Testing y performance

---

# 🚀 Fase 1 – Fundamentos Fullstack

## 🔐 Autenticación

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

# 📧 Fase 2 – Sistema de Email & Newsletter

> Stack recomendado: **Resend** + **React Email** (o Nodemailer + plantillas HTML) para emails transaccionales. MockMail / Ethereal para desarrollo local.

## ✉️ Emails transaccionales

* [ ] Email de bienvenida al registrarse (con aviso de cuenta temporal si aplica)
* [ ] Email de confirmación de pedido (resumen + total)
* [ ] Email de cambio de estado del pedido:
  * `Pendiente → Procesando`
  * `Procesando → Enviado` (con número de seguimiento mock)
  * `Enviado → Entregado`
* [ ] Email de aviso de expiración de cuenta (−24 h)
* [ ] Email de recuperación de contraseña

## 📰 Newsletter (dummy)

* [ ] Formulario de suscripción (footer + modal de bienvenida)
* [ ] Endpoint `POST /newsletter/subscribe` y `DELETE /newsletter/unsubscribe`
* [ ] Link de "darse de baja" en el footer de todos los emails (cumplimiento CAN-SPAM / GDPR)
* [ ] Envío simulado de newsletter desde el panel admin (mock, sin envío real masivo)
* [ ] Gestión de suscriptores en Admin Dashboard

## 🧩 Infraestructura de email

* [ ] Plantillas HTML reutilizables por tipo de email
* [ ] Variables dinámicas (nombre, pedido, tracking, días restantes)
* [ ] Cola de emails (Bull / BullMQ recomendado) para no bloquear la API
* [ ] Logging de emails enviados en la base de datos

---

# 🧾 Fase 3 – Checkout & Órdenes

## 🛍️ Checkout

* [ ] Formulario de envío (con dirección guardada o nueva)
* [ ] Validaciones avanzadas
* [ ] Aplicar código de descuento / cupón
* [ ] Resumen de compra (subtotal, gastos de envío, impuestos, total)
* [ ] Simulación o integración de pago (Stripe recomendado)
* [ ] Página de confirmación post-compra con número de pedido

## 📦 Órdenes

* [ ] Crear orden desde carrito
* [ ] Historial de pedidos paginado
* [ ] Detalle de pedido
* [ ] Estado del pedido (pendiente → procesando → enviado → entregado → cancelado)
* [ ] Cancelar pedido (si aún está en estado "pendiente")
* [ ] Flujo de devolución / reembolso (mock)
* [ ] Generar factura PDF descargable

---

# ⚙️ Fase 4 – Backend (Fullstack real)

## 🧠 API

* [ ] CRUD productos (con variantes: talla, color, stock por variante)
* [ ] CRUD usuarios
* [ ] CRUD órdenes
* [ ] Endpoint de cambio de estado de orden (con disparo de email automático)
* [ ] Endpoint de newsletter (suscribir / desuscribir)
* [ ] Paginación y filtrado en todos los listados

## 🗄️ Base de datos

* [ ] Diseño de entidades
* [ ] Relaciones (user → orders, order → products, user → addresses)
* [ ] Campo `expiresAt` en User + índice para el cron de limpieza
* [ ] Tabla `email_log` para auditoría de emails enviados
* [ ] Tabla `newsletter_subscribers`
* [ ] Tabla `coupons`
* [ ] Seed de datos iniciales (productos, usuarios demo, categorías)
* [ ] Soft delete en entidades críticas (productos, usuarios)

## 🔧 Stack sugerido

* Node.js + NestJS (recomendado para un showcase profesional)
* PostgreSQL
* BullMQ (colas de emails y tareas programadas)
* Resend / Nodemailer (servicio de email)

---

# 🔍 Fase 5 – Catálogo avanzado

## 🔎 Búsqueda

* [ ] Buscador con debounce
* [ ] Resultados en tiempo real
* [ ] Autocompletado / sugerencias mientras se escribe
* [ ] Búsqueda por voz (Web Speech API, nice-to-have)

## 🎛️ Filtros

* [ ] Por precio (rango slider)
* [ ] Por categoría
* [ ] Por rating
* [ ] Por disponibilidad (en stock / agotado)

## ↕️ Ordenación

* [ ] Precio asc/desc
* [ ] Popularidad / ventas
* [ ] Novedades

## 🔗 URL sync

* [ ] Query params para filtros y ordenación (UX pro + compartible)

---

# ❤️ Fase 6 – Funcionalidades de usuario

* [ ] Wishlist / Lista de deseos persistente
* [ ] Guardar carrito (sincronizado con el backend al estar logado)
* [ ] Productos vistos recientemente
* [ ] Comparación de productos (hasta 3 a la vez)
* [ ] Código de referido (mock, generado por usuario)

---

# 🧩 Fase 7 – Arquitectura Angular

## 🏗️ Estructura

* [ ] Lazy loading de módulos / rutas
* [ ] Standalone components
* [ ] Separación smart/dumb components

## 📡 Estado global

* [ ] Implementar NgRx / Signals
* [ ] Estado de:

  * carrito
  * usuario autenticado
  * expiración de cuenta temporal
  * configuración tienda

---

# 🎨 Fase 8 – UX/UI profesional

## ✨ Mejoras visuales

* [ ] Skeleton loaders
* [ ] Toast notifications
* [ ] Animaciones de transición (Angular Animations)
* [ ] Dark / Light mode con persistencia
* [ ] Breadcrumbs en páginas de producto y checkout

## 📱 Responsive

* [ ] Mobile-first
* [ ] Sidebar adaptable

## 📦 Página de producto

* [ ] Galería de imágenes con zoom
* [ ] Selector de variantes (talla / color)
* [ ] Indicador de stock (quedan X unidades)
* [ ] Reviews y Rating por estrellas
* [ ] Productos relacionados

## ⚠️ Páginas de estado

* [ ] Página 404 personalizada
* [ ] Página 500 / Error genérico
* [ ] Página de mantenimiento (modo mantenimiento configurable)

---

# 🌍 Fase 9 – Internacionalización (i18n)

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

# 🧪 Fase 10 – Testing

## ✅ Unit testing

* [ ] Componentes
* [ ] Servicios (cart, auth, email queue)

## 🔁 E2E

* [ ] Flujo de compra completo
* [ ] Login / registro / logout
* [ ] Checkout con pago simulado
* [ ] Verificación de recepción de email (Ethereal / MailHog en CI)

---

# 🚀 Fase 11 – Performance & optimización

* [ ] Lazy loading de imágenes (NgOptimizedImage)
* [ ] Imágenes en formato WebP
* [ ] TrackBy en listas
* [ ] Code splitting
* [ ] Angular Universal (SSR)
* [ ] PWA (offline support, service worker)
* [ ] Prefetch de rutas más visitadas

---

# 🔐 Fase 12 – Seguridad

* [ ] Protección de rutas (guards + roles: admin / user)
* [ ] Sanitización de inputs
* [ ] Manejo de errores global (interceptor HTTP)
* [ ] Protección de endpoints backend (roles, middleware)
* [ ] Rate limiting en endpoints públicos (login, registro, newsletter)
* [ ] CSRF protection en formularios
* [ ] Variables de entorno seguras (.env, no exponer secrets en frontend)
* [ ] GDPR / Banner de consentimiento de cookies
* [ ] Política de privacidad y T&C (páginas estáticas)

---

# 📊 Fase 13 – Admin Dashboard

## 🛠️ Panel admin

* [ ] Crear / editar / eliminar productos (con variantes y stock)
* [ ] Gestionar pedidos (cambiar estado → dispara email automático al cliente)
* [ ] Gestión de usuarios (ver, suspender, eliminar, ver estado de expiración)
* [ ] Gestión de suscriptores newsletter (listado + envío simulado de campaña)
* [ ] Vista de logs de emails enviados
* [ ] Gestión de cupones de descuento
* [ ] Métricas básicas (ventas, pedidos, usuarios activos — gráficos con Chart.js / ng2-charts)

---

# 💡 Fase 14 – Features avanzadas (WOW factor)

* [ ] Recomendaciones de productos (mock AI basado en historial de vistas)
* [ ] Generación de factura PDF (jsPDF / Puppeteer en backend)
* [ ] Tracking de pedidos con timeline visual
* [ ] Notificaciones en tiempo real (WebSockets / SSE para cambios de estado de pedido)
* [ ] Búsqueda con IA (mock embeddings o integración con Typesense)
* [ ] Exportar historial de pedidos a CSV

---

# 🧱 Bonus – DevOps & Calidad

## 🐳 DevOps

* [ ] Docker + Docker Compose (app + db + redis + mailhog)
* [ ] CI/CD (GitHub Actions: lint → test → build → deploy)
* [ ] Deploy (Vercel para frontend / Railway o Fly.io para backend)

## 📈 Observabilidad

* [ ] Sentry (frontend error tracking)
* [ ] Logging estructurado en backend (Winston / Pino)
* [ ] Health check endpoint (`/api/health`)

## 📖 Documentación

* [ ] Swagger / OpenAPI para la API REST
* [ ] README detallado con arquitectura, setup y decisiones técnicas
* [ ] Diagrama de arquitectura (C4 o similar)