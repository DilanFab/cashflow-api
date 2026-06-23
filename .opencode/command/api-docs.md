---
description: Escanea el proyecto API, extrae todos los endpoints y genera API_Endpoints.md con documentación y ejemplos de prueba con curl.
---

# API Docs — Generador de documentación de endpoints

## Objetivo

Analizar el código fuente de un proyecto API, identificar **todos los endpoints** expuestos y generar un archivo `API_Endpoints.md` en la raíz del proyecto con documentación completa y ejemplos de prueba listos para usar.

---

## Pasos

### 1. Detectar el framework y la estructura del proyecto

Revisa los archivos del proyecto para identificar:

- **Framework**: NestJS, Express, Fastify, Hono, Koa, Spring Boot, Django, FastAPI, etc.
- **Punto de entrada**: `main.ts`, `app.ts`, `index.ts`, `server.ts`, etc.
- **Prefijo global de ruta**: si existe un prefijo como `/api`, `/api/v1`, etc.
- **Puerto por defecto**: en qué puerto corre el servidor
- **Archivos de rutas/controllers**: dónde están definidos los endpoints

---

### 2. Extraer todos los endpoints

Para cada endpoint, extrae la siguiente información:

- **Método HTTP**: GET, POST, PUT, PATCH, DELETE
- **Ruta completa**: incluyendo prefijos, parámetros de ruta y versiones
- **Descripción**: qué hace el endpoint — infiérelo del nombre del método, comentarios o decoradores
- **Parámetros de ruta**: `:id`, `:slug`, etc.
- **Query params**: parámetros de URL opcionales u obligatorios
- **Body esperado**: campos del DTO/schema/body con sus tipos y si son requeridos u opcionales
- **Headers requeridos**: Authorization, Content-Type, custom headers, etc.
- **Autenticación**: si el endpoint requiere auth (JWT, API key, sesión, público)
- **Rate limiting**: si tiene límites especiales configurados
- **Respuesta exitosa**: código HTTP esperado y estructura de la respuesta
- **Errores comunes**: códigos de error documentados o inferidos (400, 401, 404, 409, etc.)

---

### 3. Generar el archivo `API_Endpoints.md`

Crea el archivo `API_Endpoints.md` **en la raíz del proyecto** con la siguiente estructura:

```markdown
# API Endpoints

> Documentación generada automáticamente a partir del código fuente.
> Última actualización: <fecha actual YYYY-MM-DD>

## Información general

| Campo | Valor |
| ------ | ------ |
| Base URL | http://localhost:<puerto> |
| Prefijo | <prefijo si existe> |
| Autenticación | <tipo: JWT Bearer, API Key, etc.> |
| Content-Type | application/json |

---

## Resumen de endpoints

| Método | Ruta | Descripción | Auth |
| ------ | ------ | ------ | ------ |
| GET | /ruta | Descripción corta | ✅ |
| POST | /ruta | Descripción corta | ❌ |
| ... | ... | ... | ... |

---

## Detalle por recurso

### <Nombre del recurso>

#### <MÉTODO> `<ruta completa>`

**Descripción**: <qué hace>

**Autenticación**: <requerida/pública>

**Parámetros de ruta**:
| Parámetro | Tipo | Descripción |
| ------ | ------ | ------ |
| id | string | ID del recurso |

**Query params**:
| Parámetro | Tipo | Requerido | Descripción |
| ------ | ------ | ------ | ------ |
| page | number | No | Número de página |

**Body** (`application/json`):
```json
{
  "campo": "valor",
  "otrocampo": 123
}
```

**Respuesta exitosa** (`200`):
```json
{
  "id": "...",
  "campo": "valor"
}
```

**Errores**:
| Código | Descripción |
| ------ | ------ |
| 401 | No autorizado — token inválido o ausente |
| 404 | Recurso no encontrado |

**Ejemplo con curl**:
```bash
curl -X <MÉTODO> http://localhost:<puerto>/<ruta> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"campo": "valor"}'
```

**Probar en Postman / Apidog**:
| Campo | Valor |
| ------ | ------ |
| Método | <MÉTODO> |
| URL | http://localhost:<puerto>/<ruta> |
| Auth | Bearer Token → <token> |
| Body | raw / JSON → {"campo": "valor"} |

**Probar en Bruno**:
```
<método> {
  url: http://localhost:<puerto>/<ruta>
  body: json {
    "campo": "valor"
  }
}

auth:bearer {
  token: <token>
}
```

---
```

---

### 4. Reglas de generación

- **Agrupa los endpoints por recurso/módulo** (ej. Transactions, Categories, Auth, Users)
- **Ordena dentro de cada grupo**: GET (listado) → GET (detalle) → POST → PUT/PATCH → DELETE
- **Genera valores de ejemplo realistas** en los body y respuestas — no uses `"string"` o `"number"`, usa datos que tengan sentido (ej. `"Salario mensual"`, `150.00`, `"2025-01-15"`)
- **Incluye el curl completo** para cada endpoint, con todos los headers necesarios
- **Si el endpoint requiere auth**, incluye el header `Authorization: Bearer <token>` y añade una nota al inicio del archivo explicando cómo obtener un token válido
- **No inventes endpoints** — documenta solo lo que existe en el código
- **Si hay un endpoint de health check** o similar público, ponlo al inicio como sección separada

---

### 5. Verificación final

Antes de guardar el archivo:

- Verifica que **todas las rutas** encontradas en controllers/routers estén documentadas
- Verifica que los **tipos de los campos** coincidan con los DTOs/schemas del código
- Verifica que no haya **tokens, secrets o datos sensibles reales** en los ejemplos — usa siempre placeholders como `<token>`, `<api-key>`
- Confirma que los **códigos HTTP** de respuesta sean los correctos según el código

---

### 6. Presentar el resultado

Después de generar el archivo, muestra un resumen:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 API_Endpoints.md GENERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Archivo: API_Endpoints.md (raíz del proyecto)

Recursos documentados:
  - <Recurso 1>: N endpoints
  - <Recurso 2>: N endpoints
  ...

Total: N endpoints documentados

⚠️  Recuerda reemplazar <token> con un token válido antes de probar los curl.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
