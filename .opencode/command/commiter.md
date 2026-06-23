---
description: Revisa cambios pendientes, los agrupa en commits semánticos (Conventional Commits en español) y ejecuta git add + git commit. NUNCA hace push.
agent: build
---

Revisa todos los cambios pendientes en el repositorio, **agrúpalos en commits semánticos** coherentes y genera los mensajes de commit siguiendo **Conventional Commits**, con nombres y descripciones en **español**. Luego ejecuta los commits.

---

## Pasos

### 1. Revisar el estado del repositorio

Ejecuta:

```bash
git status --short
git diff --stat
git diff
git log --oneline -10
```

Analiza:
- Archivos **modificados**, **añadidos** o **eliminados**
- Historial reciente para mantener coherencia
- Clasifica cada cambio por área: lógica de negocio, configuración, tests, documentación, etc.

### 2. Auditoría de seguridad — OBLIGATORIO

**Antes de proponer cualquier commit**, revisa el diff completo en busca de:

- Tokens, API keys, secrets o contraseñas hardcodeados
- Archivos `.env` o similares que no estén en `.gitignore`
- Variables de entorno con valores reales expuestos

Si detectas **cualquier** dato sensible, muestra:

```
⚠️  ALERTA DE SEGURIDAD
━━━━━━━━━━━━━━━━━━━━━━
Se detectaron posibles datos sensibles en los siguientes archivos:

  - <archivo>: <descripción>

ACCIÓN REQUERIDA: Elimina estos datos del staging antes de commitear.
No se generarán mensajes de commit hasta que se resuelva.
━━━━━━━━━━━━━━━━━━━━━━
```

**No continúes al paso 3 hasta que el diff esté limpio.**

### 3. Agrupar cambios en commits semánticos

Agrupa archivos en **commits independientes y coherentes**:

- **Un commit por responsabilidad**: lógica ≠ docs ≠ tests ≠ config
- **Un commit por feature/fix**: múltiples features/fixes van separados
- **Dependencias juntas**: lock files con su `chore(deps)` o commit que los originó
- **Migraciones de BD con su schema**: juntos
- **Archivos generados con su origen**: mismo commit

Si **todos** los cambios pertenecen a una sola responsabilidad, un solo commit es correcto.

### 4. Clasificar el tipo de cada commit

| Tipo       | Cuándo usarlo                                              |
|------------|------------------------------------------------------------|
| `feat`     | Nueva funcionalidad para el usuario final                  |
| `fix`      | Corrección de un bug                                       |
| `refactor` | Cambio de código sin funcionalidad nueva ni bug fix        |
| `chore`    | Tareas de mantenimiento, dependencias, configs             |
| `docs`     | Solo cambios en documentación                              |
| `test`     | Añadir o corregir tests                                    |
| `perf`     | Mejora de rendimiento                                      |
| `style`    | Formato, espacios — sin cambio de lógica                   |
| `ci`       | Cambios en CI/CD                                           |
| `build`    | Cambios en sistema de build o dependencias externas        |
| `revert`   | Revertir commit anterior                                   |

### 5. Identificar el scope de cada commit

Scope opcional pero recomendado. Infiere de:
- Carpeta principal donde ocurren los cambios (ej. `auth`, `transactions`, `prisma`)
- Módulo, paquete o componente afectado
- Si son transversales a todo el proyecto, omite el scope

### 6. Ejecutar los commits

**⛔ NUNCA hagas `git push`. Solo `git add` y `git commit`.**

Formato del mensaje:

```
<tipo>(<scope>): <descripción corta en español>

<cuerpo en español — opcional>
```

Reglas:
- Descripción en **minúsculas**, **español**, modo **imperativo**
- Máximo **72 caracteres** en la primera línea
- Cuerpo explica el **qué y por qué**, no el cómo
- Breaking change: `BREAKING CHANGE: <descripción>` en footer

Para cada commit:

```bash
git add <archivos>
git commit -m "<tipo>(<scope>): <descripción>" -m "<cuerpo>"
```

### 7. Resumen final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ COMMITS REALIZADOS (N en total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. tipo(scope): descripción
   Archivos: ...

⚠️  No se hizo push. Ejecuta `git push` cuando estés listo.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Si algún commit falla, detente y muestra el error.
