# Cashflow API 💰

Este es el backend oficial de **Cashflow App** (aplicación de control de flujo de caja). Está construido sobre **NestJS**, utilizando **Prisma v7** como ORM, **Supabase (PostgreSQL)** como base de datos y **Bun** como entorno de ejecución y gestor de paquetes.

---

## 🚀 Tecnologías

El stack del backend está compuesto por:

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **ORM**: [Prisma](https://www.prisma.io/) (v7) con Driver Adapter para PostgreSQL (`@prisma/adapter-pg`)
- **Base de datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Validación**: `class-validator` y `class-transformer`

---

## 🛠️ Requisitos previos

- Tener instalado [Bun](https://bun.sh/).
- Una instancia de base de datos PostgreSQL (recomendado: proyecto en Supabase).

---

## ⚙️ Configuración del Entorno

1. Copia el archivo de ejemplo o crea un archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL="postgres://postgres.xxxx:your-password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable"
   ```
   > ⚠️ **Nota sobre Prisma v7**: La URL de conexión se gestiona dinámicamente a través de `prisma.config.ts`, y se lee automáticamente de la variable `DATABASE_URL` del entorno.

---

## 📥 Instalación

Clona el repositorio e instala las dependencias utilizando Bun:

```bash
bun install
```

---

## 🗄️ Base de Datos y Prisma

### 1. Aplicar Migraciones
Aplica las migraciones de Prisma para configurar la estructura de base de datos en Supabase:

```bash
bun prisma db push
```

### 2. Poblar Base de Datos (Seed)
Ejecuta el script de semilla para poblar la base de datos con categorías por defecto y un usuario de prueba:

```bash
bun prisma db seed
```
*Esto generará un usuario (`dilan@test.com`) y categorías por defecto como `Indriver`, `EasyCar`, `Freelance`, `Gasolina`, `Alimentación`, `Arriendo`, `Servicios`, `Mantenimiento`.*

---

## 🚦 Servidor de Desarrollo

Inicia el servidor en modo de escucha activa (watch mode):

```bash
bun run start:dev
```

El servidor estará disponible en: [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentación de la API

La API cuenta con los siguientes endpoints expuestos en el puerto `3000`:

### 1. Transacciones (`/transactions`)

#### **Crear una Transacción**
* **Método:** `POST`
* **Ruta:** `/transactions`
* **Cuerpo (JSON):**
  ```json
  {
    "amount": 150.50,
    "type": "INCOME",
    "status": "RECEIVED",
    "categoryId": "cuid_de_la_categoria",
    "userId": "cuid_del_usuario",
    "description": "Pago de servicio Freelance",
    "date": "2026-06-03T12:00:00.000Z"
  }
  ```
  *(Nota: `type` acepta `INCOME` | `EXPENSE`. `status` acepta `RECEIVED` | `PENDING`)*
* **Respuesta (201 Created):** Retorna el objeto de la transacción creada.

#### **Obtener Transacciones del Usuario**
* **Método:** `GET`
* **Ruta:** `/transactions?userId=cuid_del_usuario`
* **Respuesta (200 OK):** Lista de transacciones del usuario ordenada por fecha.

#### **Resumen Financiero del Usuario**
* **Método:** `GET`
* **Ruta:** `/transactions/summary?userId=cuid_del_usuario`
* **Respuesta (200 OK):**
  ```json
  {
    "totalIncome": 1500.00,
    "totalExpense": 450.50,
    "balance": 1049.50
  }
  ```

---

### 2. Categorías (`/categories`)

#### **Obtener Todas las Categorías**
* **Método:** `GET`
* **Ruta:** `/categories`
* **Respuesta (200 OK):** Lista de todas las categorías disponibles con su respectivo tipo (`INCOME` o `EXPENSE`).

---

## 🧪 Pruebas (Tests)

```bash
# Pruebas unitarias
bun run test

# Pruebas E2E
bun run test:e2e

# Cobertura de pruebas
bun run test:cov
```
