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

Por ahora: **un solo usuario**, sin autenticación compleja.
La arquitectura soportará multi-usuario en V1, pero el MVP no lo requiere.

---

## 4. Stack Técnico

| Capa | Tecnología | Hosting gratuito |
|---|---|---|
| Frontend | Angular 20 · Standalone Components · Signals · TailwindCSS | Vercel |
| Backend | NestJS · Prisma ORM | Render (free tier) |
| Base de datos | PostgreSQL | Supabase |

**Advertencia conocida:** Render free tier tiene cold start de 30–60 s tras inactividad.
Mitigación: aceptado en MVP. Resolver en V1 con keep-alive o migración a Railway.

---

## 5. Fases de Construcción

### Fase 0 — Backend funcional (3–5 días)
Objetivo: tener datos reales antes de escribir una línea de Angular.

- [ ] Entorno: Node, NestJS CLI, Prisma, conexión Supabase
- [ ] Modelo de datos mínimo
- [ ] CRUD de transacciones
- [ ] Endpoint de resumen por período
- [ ] Validación con Thunder Client / Postman

### Fase 1 — Frontend mínimo (1–2 semanas)
- [ ] Formulario de registro de transacción
- [ ] Lista de transacciones con filtros básicos
- [ ] Dashboard con KPIs
- [ ] Autenticación JWT (al final, no al inicio)

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

1. Modelo Prisma + migración inicial
2. CRUD transacciones (NestJS)
3. Endpoint dashboard/summary
4. Frontend: formulario + lista
5. Frontend: dashboard
6. Autenticación JWT
7. Categorías editables
8. Módulo pendientes/vouchers

> **Principio:** El valor del proyecto está en el flujo financiero, no en el login.
> Un dashboard financiero funcional con Angular + NestJS + Prisma tiene más peso en portafolio que features secundarias sin profundidad de dominio.

---

## 11. Próximo Paso Inmediato

Configurar el entorno de desarrollo:

```bash
# Node (recomendado: v20 LTS)
node --version

# NestJS CLI
npm i -g @nestjs/cli

# Verificar
nest --version
```

Luego: crear el proyecto NestJS y conectar Supabase antes de cualquier otra cosa.
