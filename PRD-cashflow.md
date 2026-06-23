# PRD — Control de Flujo de Caja Personal
**Versión:** 1.0 · **Estado:** Borrador aprobado

---

## 1. Problema Real

Las apps de finanzas personales asumen ingresos fijos. Para hogares con ingresos variables (transporte, freelance, ventas), el problema concreto es:

> **No saber cuánto dinero hay disponible hoy, cuánto falta cobrar, y cuánto se está gastando.**

---

## 2. Objetivo en 30 Días

Una sola frase:

> Registrar cada ingreso y gasto, ver los totales del período, e identificar patrones para tomar decisiones de ahorro.

---

## 3. Usuarios

Multi-usuario con autenticación real via **Supabase Auth** (email + contraseña).
Cada usuario solo ve sus propias transacciones. El JWT de Supabase se valida en el backend en cada petición.

---

## 4. Stack Técnico

| Capa | Tecnología | Hosting gratuito |
|---|---|---|
| Frontend | Angular 22 · Standalone Components · Signals · TailwindCSS | Vercel |
| Backend | NestJS · Prisma v7 · @supabase/supabase-js | Render (free tier) |
| Base de datos | PostgreSQL | Supabase |
| Autenticación | Supabase Auth (email + contraseña) | Supabase |

**Advertencia conocida:** Render free tier tiene cold start de 30–60 s tras inactividad.
Mitigación: aceptado en MVP. Resolver en V1 con keep-alive o migración a Railway.

---

## 5. Fases de Construcción

### Fase 0 — Backend funcional (Completado ✅)
Objetivo: tener datos reales antes de escribir una línea de Angular.

- [x] Entorno: Node, NestJS CLI, Prisma v7 con Driver Adapter (`@prisma/adapter-pg`), conexión Supabase
- [x] Modelo de datos mínimo (User, Category, Transaction)
- [x] CRUD de transacciones
- [x] Endpoint de resumen por período/usuario (`/transactions/summary`)
- [x] Validación con Apidog
- [x] Repositorio de GitHub creado y código inicial subido (`cashflow-api`)

### Fase 0.5 — Autenticación Backend (Completado ✅)
- [x] Instalar `@supabase/supabase-js` en el backend
- [x] Crear `AuthModule` con `AuthService` y `SupabaseAuthGuard`
- [x] `AuthService.verifyToken()` valida JWT con `supabase.auth.getUser(token)`
- [x] `SupabaseAuthGuard` extrae el Bearer token del header `Authorization`
- [x] Guard aplicado a `TransactionsController` y `CategoriesController`
- [x] Rutas devuelven `401 Unauthorized` sin token válido (verificado en Apidog)

### Fase 1 — Frontend Angular (En Progreso 🔄)
- [x] Inicializar proyecto Angular 22 (`cashflow-ui`) con bun
- [x] Maqueta visual generada con Google Stitch (dark mode, paleta verde esmeralda)
- [ ] Configurar TailwindCSS con la paleta de colores de Stitch
- [ ] Instalar `@supabase/supabase-js` en el frontend
- [ ] Pantalla de Login con Supabase Auth
- [ ] Pantalla de Registro con Supabase Auth
- [ ] Guard de rutas en Angular (redirige al login si no hay sesión)
- [ ] Interceptor HTTP que adjunta el JWT en cada petición al backend
- [ ] Pantalla Dashboard con datos reales del backend
- [ ] Formulario Nueva Transacción conectado al backend
- [ ] Historial de transacciones con filtros

### Fase 2 — V1 post-validación
- [ ] Multi-hogar
- [ ] Metas de ahorro
- [ ] Presupuestos por categoría
- [ ] Alertas
- [ ] PWA instalable

---

## 6. Modelo de Datos (Prisma)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Category {
  id           String          @id @default(cuid())
  name         String
  type         TransactionType
  transactions Transaction[]
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  status      TransactionStatus
  categoryId  String
  category    Category        @relation(fields: [categoryId], references: [id])
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  description String?
  date        DateTime
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum TransactionStatus {
  RECEIVED
  PENDING
}
```

**Decisiones explícitas:**
- `amount` usa `Decimal`, no `Float` — evita errores de punto flotante en dinero
- `date` separado de `createdAt` — permite registrar con fecha real del evento
- `Category` es una entidad, no un enum — editable sin migrations

---

## 7. KPIs del Dashboard

| KPI | Fórmula |
|---|---|
| Disponible hoy | Ingresos RECEIVED − Gastos RECEIVED |
| Pendiente por cobrar | Suma de ingresos PENDING |
| Proyectado | Disponible + Pendiente |
| Gastos del período | Suma gastos por rango de fechas |
| Rentabilidad transporte | Ingresos transporte − Gasolina − Mantenimiento |
| Variación vs mes anterior | % de cambio en balance neto |

---

## 8. Arquitectura de Carpetas

### Backend (NestJS)
```
src/
 ├─ auth/
 ├─ users/
 ├─ categories/
 ├─ transactions/
 └─ dashboard/
```

### Frontend (Angular)
```
src/
 ├─ core/          # guards, interceptors, services globales
 ├─ shared/        # componentes reutilizables
 ├─ features/
 │   ├─ auth/
 │   ├─ dashboard/
 │   ├─ transactions/
 │   └─ categories/
 └─ layouts/
```

---

## 9. Requerimientos No Funcionales

| Requerimiento | Criterio |
|---|---|
| Carga inicial | < 3 s en conexión móvil normal |
| Diseño | Mobile-first, dark mode obligatorio |
| Accesibilidad | WCAG AA básico |
| Portabilidad | Sin lógica de negocio acoplada al proveedor de BD |

---

## 10. Orden de Construcción Recomendado

1. **[x] Modelo Prisma + migración inicial**
2. **[x] CRUD transacciones (NestJS)**
3. **[x] Endpoint dashboard/summary**
4. **[x] Autenticación backend con Supabase Auth Guard**
5. **[/] Frontend: setup TailwindCSS + Supabase Auth (Login/Registro)**
6. **[ ] Frontend: Guard de rutas + Interceptor HTTP con JWT**
7. **[ ] Frontend: Dashboard con datos reales**
8. **[ ] Frontend: Formulario de transacción + historial**
9. **[ ] Categorías editables**
10. **[ ] Módulo pendientes/vouchers**

> **Principio:** El valor del proyecto está en el flujo financiero, no en el login.
> Un dashboard financiero funcional con Angular + NestJS + Prisma tiene más peso en portafolio que features secundarias sin profundidad de dominio.

---

## 11. Próximo Paso Inmediato

Desarrollo del frontend Angular (`cashflow-ui`):

### Contexto del proyecto frontend
- **Ruta local:** `c:\Users\dil_a\Documents\Program\Personal\cashflow-ui`
- **Framework:** Angular 22, standalone components, bun como package manager
- **Estilos:** TailwindCSS con paleta personalizada generada por Google Stitch (dark mode, acento verde esmeralda `#10B981`)
- **Diseño:** Maqueta HTML completa disponible del panel de Stitch (nombre del proyecto: FinControl)

### Backend disponible en:
- `http://localhost:3000` (desarrollo local)
- Requiere header `Authorization: Bearer <token>` en todas las rutas
- Endpoints: `POST /transactions`, `GET /transactions?userId=`, `GET /transactions/summary?userId=`, `GET /categories`

### Credenciales Supabase (frontend):
- Instalar `@supabase/supabase-js` en cashflow-ui
- Usar `SUPABASE_URL` y `SUPABASE_ANON_KEY` (mismas del backend, disponibles en el `.env` del backend)
- En Angular, las env vars van en `src/environments/environment.ts`
