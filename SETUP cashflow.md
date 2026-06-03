# SETUP — Entorno de Desarrollo (Windows 11 · Bun)
**Proyecto:** Control de Flujo de Caja  
**Stack:** NestJS · Prisma · PostgreSQL (Supabase)

---

## Prerequisitos del sistema

| Herramienta | Verificar en PowerShell |
|---|---|
| Node.js 20 LTS | `node --version` |
| Bun | `bun --version` |
| Git | `git --version` |

Si Bun no está instalado todavía:
```powershell
npm install -g bun
```

---

## Paso 1 — Instalar NestJS CLI

Abrir PowerShell **como administrador**:

```powershell
bun install -g @nestjs/cli
nest --version
```

> Si aparece el error `running scripts is disabled on this system`:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
> Luego volver a intentar.

---

## Paso 2 — Crear el proyecto backend

PowerShell normal (ya no necesita administrador):

```powershell
nest new cashflow-api
```

Cuando pregunte el package manager, elegir **bun**.

```powershell
cd cashflow-api
```

---

## Paso 3 — Instalar Prisma

```powershell
bun add -d prisma
bun add @prisma/client
bunx prisma init
```

Esto crea:
```
cashflow-api/
 ├─ prisma/
 │   └─ schema.prisma
 └─ .env
```

---

## Paso 4 — Crear la base de datos en Supabase

1. Ir a [supabase.com](https://supabase.com) → crear cuenta
2. **New project** → nombre: `cashflow`
3. Región: **South America (São Paulo)**
4. Asignar contraseña al proyecto y guardarla

Esperar ~2 minutos, luego:

5. **Settings → Database**
6. **Connection string → URI**
7. Copiar la cadena completa

---

## Paso 5 — Configurar la conexión

Abrir `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres"
```

> `.env` nunca debe subirse a Git.
> Verificar que esté en `.gitignore` — NestJS lo incluye por defecto.

---

## Paso 6 — Definir el schema Prisma

Reemplazar todo el contenido de `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  id          String            @id @default(cuid())
  amount      Decimal           @db.Decimal(12, 2)
  type        TransactionType
  status      TransactionStatus
  categoryId  String
  category    Category          @relation(fields: [categoryId], references: [id])
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  description String?
  date        DateTime
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
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

---

## Paso 7 — Ejecutar la migración inicial

```powershell
bunx prisma migrate dev --name init
```

**Verificar:** Supabase → **Table Editor** — deben aparecer las tablas `User`, `Category`, `Transaction`.

---

## Paso 8 — Integrar Prisma en NestJS

### Generar el módulo Prisma

```powershell
nest g module prisma
nest g service prisma
```

### `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
```

---

## Paso 9 — Verificar que todo funciona

```powershell
bun run start:dev
```

Debes ver:
```
[Nest] LOG  Starting Nest application...
[Nest] LOG  Nest application successfully started
```

Servidor corriendo en `http://localhost:3000`.

> Si el hot reload falla o el watcher no detecta cambios, usar:
> ```powershell
> bunx --bun nest start --watch
> ```

---

## Paso 10 — Seed inicial

Crear `prisma/seed.ts`:

```typescript
import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'tu@email.com',
      name: 'Tu Nombre',
    },
  });

  const categories = [
    { name: 'Uber',                  type: TransactionType.INCOME },
    { name: 'Transporte Ejecutivo',  type: TransactionType.INCOME },
    { name: 'Freelance',             type: TransactionType.INCOME },
    { name: 'Gasolina',              type: TransactionType.EXPENSE },
    { name: 'Alimentación',          type: TransactionType.EXPENSE },
    { name: 'Arriendo',              type: TransactionType.EXPENSE },
    { name: 'Servicios',             type: TransactionType.EXPENSE },
    { name: 'Mantenimiento',         type: TransactionType.EXPENSE },
  ];

  await prisma.category.createMany({ data: categories });

  console.log('Seed completado. Usuario:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Agregar en `package.json` al mismo nivel que `"scripts"`:

```json
"prisma": {
  "seed": "bun prisma/seed.ts"
}
```

Ejecutar:

```powershell
bunx prisma db seed
```

> El seed falla si lo corres dos veces — el email ya existe.
> Eso es correcto, significa que `@unique` funciona.

---

## Herramienta recomendada para probar la API

**Thunder Client** — extensión de VS Code:

1. `Ctrl+Shift+X` en VS Code
2. Buscar "Thunder Client"
3. Instalar

Permite hacer peticiones HTTP sin salir del editor.

---

## Referencia rápida: npm → bun

| npm | bun |
|---|---|
| `npm install` | `bun install` |
| `npm install paquete` | `bun add paquete` |
| `npm install -D paquete` | `bun add -d paquete` |
| `npm run start:dev` | `bun run start:dev` |
| `npx prisma ...` | `bunx prisma ...` |
| `npx ts-node archivo.ts` | `bun archivo.ts` |

> Bun ejecuta TypeScript directamente — no necesitas `ts-node`.

---

## Estado al terminar este setup

| Componente | Estado |
|---|---|
| Bun como package manager | ✅ |
| NestJS corriendo en localhost:3000 | ✅ |
| PostgreSQL en Supabase conectado | ✅ |
| Tablas creadas con migración | ✅ |
| Categorías base sembradas | ✅ |
| PrismaService disponible globalmente | ✅ |

---

## Siguiente paso

```powershell
nest g module transactions
nest g controller transactions
nest g service transactions
```

Primeros endpoints a construir:
```
POST /transactions
GET  /transactions
GET  /dashboard/summary
```
