# API Endpoints

> Documentación generada automáticamente a partir del código fuente.
> Última actualización: 2026-06-23

## Información general

| Campo | Valor |
| ------ | ------ |
| Base URL | http://localhost:3000 |
| Prefijo | — (sin prefijo global) |
| Autenticación | JWT Bearer Token (Supabase) |
| Content-Type | application/json |
| Rate limiting global | 100 req/min |

---

## Cómo obtener un token válido

Los endpoints protegidos requieren un JWT de Supabase en el header `Authorization`.

1. Autentica al usuario en tu frontend con Supabase Auth (`supabase.auth.signInWithPassword`, `signInWithOAuth`, etc.)
2. Supabase devuelve un `access_token` (JWT)
3. Pásalo como header: `Authorization: Bearer <access_token>`

> **Nota**: No hay endpoint de login propio en esta API. La autenticación se delega completamente a Supabase.

---

## Resumen de endpoints

| Método | Ruta | Descripción | Auth | Rate limit |
| ------ | ------ | ------ | :------: | ------ |
| GET | `/` | Mensaje de bienvenida | ❌ | 100/min |
| GET | `/health` | Health check del servidor | ❌ | Sin límite |
| GET | `/categories` | Listar todas las categorías | ✅ | 30/min |
| POST | `/transactions` | Crear una transacción | ✅ | 30/min |
| GET | `/transactions` | Listar transacciones del usuario | ✅ | 30/min |
| GET | `/transactions/summary` | Resumen financiero (ingresos, gastos, balance) | ✅ | 10/min |

---

## Detalle por recurso

### App

#### GET `/`

**Descripción**: Mensaje de bienvenida del servidor. Endpoint por defecto del scaffold de NestJS.

**Autenticación**: Pública

**Respuesta exitosa** (`200`):
```
Hello World!
```

**Ejemplo con curl**:
```bash
curl -X GET http://localhost:3000/
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | GET |
| URL | http://localhost:3000/ |
| Auth | — |

**Probar en Bruno**:
```
get {
  url: http://localhost:3000/
}
```

---

### Health

#### GET `/health`

**Descripción**: Verifica que el servidor está activo y respondiendo. No requiere autenticación ni tiene rate limiting.

**Autenticación**: Pública

**Respuesta exitosa** (`200`):
```json
{
  "status": "ok",
  "timestamp": "2026-06-23T14:30:00.000Z"
}
```

**Ejemplo con curl**:
```bash
curl -X GET http://localhost:3000/health
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | GET |
| URL | http://localhost:3000/health |
| Auth | — |

**Probar en Bruno**:
```
get {
  url: http://localhost:3000/health
}
```

---

### Categories

#### GET `/categories`

**Descripción**: Retorna todas las categorías disponibles (ingresos y gastos). Útil para poblar selects/dropdowns en el frontend.

**Autenticación**: Requerida (JWT Bearer)

**Rate limit**: 30 req/min

**Respuesta exitosa** (`200`):
```json
[
  {
    "id": "clx1abc123",
    "name": "Indriver",
    "type": "INCOME"
  },
  {
    "id": "clx2def456",
    "name": "Gasolina",
    "type": "EXPENSE"
  },
  {
    "id": "clx3ghi789",
    "name": "Alimentación",
    "type": "EXPENSE"
  }
]
```

**Errores**:
| Código | Descripción |
| ------ | ------ |
| 401 | Token inválido, expirado o no proporcionado |
| 429 | Rate limit excedido (30 req/min) |

**Ejemplo con curl**:
```bash
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer <token>"
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | GET |
| URL | http://localhost:3000/categories |
| Auth | Bearer Token → `<token>` |

**Probar en Bruno**:
```
get {
  url: http://localhost:3000/categories
}

auth:bearer {
  token: <token>
}
```

---

### Transactions

#### POST `/transactions`

**Descripción**: Crea una nueva transacción (ingreso o gasto) para el usuario autenticado. El `userId` se obtiene automáticamente del JWT, no se envía en el body.

**Autenticación**: Requerida (JWT Bearer)

**Rate limit**: 30 req/min

**Body** (`application/json`):
| Campo | Tipo | Requerido | Descripción |
| ------ | ------ | :------: | ------ |
| `amount` | number | ✅ | Monto de la transacción (debe ser positivo) |
| `type` | string | ✅ | Tipo: `"INCOME"` o `"EXPENSE"` |
| `status` | string | ✅ | Estado: `"RECEIVED"` o `"PENDING"` |
| `categoryId` | string | ✅ | ID de la categoría (debe existir en la DB) |
| `description` | string | ❌ | Descripción opcional de la transacción |
| `date` | string | ✅ | Fecha en formato ISO 8601 (`"2026-06-15"`) |

**Ejemplo de body**:
```json
{
  "amount": 150.00,
  "type": "INCOME",
  "status": "RECEIVED",
  "categoryId": "clx1abc123",
  "description": "Pago por viaje Indriver",
  "date": "2026-06-20"
}
```

**Respuesta exitosa** (`201`):
```json
{
  "id": "clx9xyz789",
  "amount": "150.00",
  "type": "INCOME",
  "status": "RECEIVED",
  "categoryId": "clx1abc123",
  "userId": "auth0|abc123",
  "description": "Pago por viaje Indriver",
  "date": "2026-06-20T00:00:00.000Z",
  "createdAt": "2026-06-23T14:30:00.000Z",
  "updatedAt": "2026-06-23T14:30:00.000Z"
}
```

**Errores**:
| Código | Descripción |
| ------ | ------ |
| 400 | Body inválido — campos faltantes, tipos incorrectos o `categoryId` con FK inexistente |
| 401 | Token inválido, expirado o no proporcionado |
| 404 | Categoría no encontrada (`categoryId` no existe) |
| 409 | Conflicto de unicidad (P2002) |
| 429 | Rate limit excedido (30 req/min) |

**Ejemplo con curl**:
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 150.00,
    "type": "INCOME",
    "status": "RECEIVED",
    "categoryId": "clx1abc123",
    "description": "Pago por viaje Indriver",
    "date": "2026-06-20"
  }'
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | POST |
| URL | http://localhost:3000/transactions |
| Auth | Bearer Token → `<token>` |
| Body | raw / JSON → `{"amount":150.00,"type":"INCOME","status":"RECEIVED","categoryId":"clx1abc123","description":"Pago por viaje Indriver","date":"2026-06-20"}` |

**Probar en Bruno**:
```
post {
  url: http://localhost:3000/transactions
  body: json {
    "amount": 150.00,
    "type": "INCOME",
    "status": "RECEIVED",
    "categoryId": "clx1abc123",
    "description": "Pago por viaje Indriver",
    "date": "2026-06-20"
  }
}

auth:bearer {
  token: <token>
}
```

---

#### GET `/transactions`

**Descripción**: Lista todas las transacciones del usuario autenticado, ordenadas por fecha descendente. Incluye la relación con la categoría.

**Autenticación**: Requerida (JWT Bearer)

**Rate limit**: 30 req/min

**Respuesta exitosa** (`200`):
```json
[
  {
    "id": "clx9xyz789",
    "amount": "150.00",
    "type": "INCOME",
    "status": "RECEIVED",
    "categoryId": "clx1abc123",
    "userId": "auth0|abc123",
    "description": "Pago por viaje Indriver",
    "date": "2026-06-20T00:00:00.000Z",
    "createdAt": "2026-06-23T14:30:00.000Z",
    "updatedAt": "2026-06-23T14:30:00.000Z",
    "category": {
      "id": "clx1abc123",
      "name": "Indriver",
      "type": "INCOME"
    }
  },
  {
    "id": "clx8uvw456",
    "amount": "45.50",
    "type": "EXPENSE",
    "status": "RECEIVED",
    "categoryId": "clx2def456",
    "userId": "auth0|abc123",
    "description": "Gasolina full tank",
    "date": "2026-06-18T00:00:00.000Z",
    "createdAt": "2026-06-18T10:00:00.000Z",
    "updatedAt": "2026-06-18T10:00:00.000Z",
    "category": {
      "id": "clx2def456",
      "name": "Gasolina",
      "type": "EXPENSE"
    }
  }
]
```

**Errores**:
| Código | Descripción |
| ------ | ------ |
| 401 | Token inválido, expirado o no proporcionado |
| 429 | Rate limit excedido (30 req/min) |

**Ejemplo con curl**:
```bash
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer <token>"
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | GET |
| URL | http://localhost:3000/transactions |
| Auth | Bearer Token → `<token>` |

**Probar en Bruno**:
```
get {
  url: http://localhost:3000/transactions
}

auth:bearer {
  token: <token>
}
```

---

#### GET `/transactions/summary`

**Descripción**: Retorna un resumen financiero del usuario autenticado: total de ingresos, total de gastos y balance (ingresos - gastos). La agregación se realiza a nivel de base de datos con `groupBy`.

**Autenticación**: Requerida (JWT Bearer)

**Rate limit**: 10 req/min

**Respuesta exitosa** (`200`):
```json
{
  "totalIncome": 1500.00,
  "totalExpense": 850.50,
  "balance": 649.50
}
```

**Errores**:
| Código | Descripción |
| ------ | ------ |
| 401 | Token inválido, expirado o no proporcionado |
| 429 | Rate limit excedido (10 req/min) |

**Ejemplo con curl**:
```bash
curl -X GET http://localhost:3000/transactions/summary \
  -H "Authorization: Bearer <token>"
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | GET |
| URL | http://localhost:3000/transactions/summary |
| Auth | Bearer Token → `<token>` |

**Probar en Bruno**:
```
get {
  url: http://localhost:3000/transactions/summary
}

auth:bearer {
  token: <token>
}
```

---

## Errores globales

### Errores de Prisma (PrismaExceptionFilter)

Los errores conocidos de Prisma se mapean automáticamente a códigos HTTP:

| Código Prisma | HTTP | Descripción |
| ------ | ------ | ------ |
| P2002 | 409 Conflict | Violación de restricción única (ej. email duplicado) |
| P2025 | 404 Not Found | Registro no encontrado al actualizar/eliminar |
| P2003 | 400 Bad Request | Violación de foreign key (ej. `categoryId` inexistente) |
| Otro | 500 Internal Server Error | Error inesperado de base de datos |

**Ejemplo de respuesta de error**:
```json
{
  "statusCode": 404,
  "message": "An operation failed because it depends on one or more records that were required but not found."
}
```

### Errores de validación (ValidationPipe)

Cuando el body no cumple con el DTO, NestJS retorna `400 Bad Request`:

```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number",
    "type must be one of the following values: INCOME, EXPENSE"
  ],
  "error": "Bad Request"
}
```

### Errores de autenticación

| Código | Descripción |
| ------ | ------ |
| 401 | `Token no proporcionado` — Header `Authorization` ausente |
| 401 | `Token inválido o expirado` — JWT no válido o expirado según Supabase |
| 401 | `Error al verificar el token` — Error interno al contactar Supabase |

### Rate limiting

Cuando se excede el límite de requests:

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```
