# AGENTS.md

Backend for the **Cashflow** personal-finance app. NestJS 11 + Prisma v7 (Driver Adapter) on Supabase Postgres, Supabase Auth for JWT verification, Bun as runtime/package manager.

## Quick start

```bash
bun install
bun prisma generate            # required after clone; client emits to ./generated/prisma
bun prisma db push             # or: bun prisma migrate deploy
bun prisma db seed             # uses prisma.config.ts -> bun prisma/seed.ts
bun run start:dev              # nest start --watch on :3000
```

`.env` must define: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`. The Prisma v7 `datasource` block has no `url`; it is resolved via `prisma.config.ts` at runtime.

## Conventions and gotchas

### Prisma v7 — non-default wiring
- `prisma.config.ts` is **required** (load it via `import 'dotenv/config'` at the top). It owns `DATABASE_URL`, schema path, migrations path, and the seed command.
- `PrismaService` (`src/prisma/prisma.service.ts`) does **not** use the standard `new PrismaClient()`; it instantiates a `pg.Pool` + `@prisma/adapter-pg` adapter and passes it to `super({ adapter })`. Do not "simplify" this — it is the v7 Driver Adapter pattern.
- Generated client lives at `generated/prisma/` (gitignored, see `.gitignore` line 58). It is **not** in `node_modules`. If `dist/` or imports break with "cannot find module @prisma/client", run `bun prisma generate` first.
- Schema is at `prisma/schema.prisma`; single migration in `prisma/migrations/20260602185534_init/`.

### Bun, not npm
- Use `bun` / `bunx`, never `npm` / `npx`. Bun executes TypeScript directly.
- If `nest start --watch` watcher hangs on Windows, fall back to `bunx --bun nest start --watch` (see SETUP cashflow.md).

### Auth
- `SupabaseAuthGuard` (`src/auth/supabase-auth/supabase-auth.guard.ts`) validates the JWT via `AuthService.verifyToken(token)` and attaches the Supabase user to `request.user`.
- `@CurrentUser()` decorator (`src/auth/current-user.decorator.ts`) extracts `request.user` in controllers. Use it to get the authenticated user's `id` and `email`.
- `TransactionsController` derives `userId` from the JWT via `@CurrentUser()`, not from client input. The `CreateTransactionDto` does **not** include a `userId` field.
- `AuthService.verifyToken` throws `UnauthorizedException` (clean 401) on invalid tokens or Supabase failures — no stack traces leak to clients.

### Validation
- `main.ts` enables `ValidationPipe({ whitelist: true, transform: true })`. The `transform` option means incoming values are auto-coerced to the DTO types (e.g., string `"150"` → number `150`). Use `@Type(() => Number)` from `class-transformer` on numeric fields.
- `CreateTransactionDto.amount` uses `@Type(() => Number)` to ensure strings from JSON become numbers.
- Do not add fields to DTOs without `@IsOptional()` or `forbidNonWhitelisted` will start stripping them silently.
- `TransactionsService.create` verifies the `categoryId` exists before creating — throws `NotFoundException` if not found.

### Rate limiting
- `@nestjs/throttler` is installed and configured globally (`100 req/min` default). Overrides per controller:
  - `POST /transactions`, `GET /transactions` → 30 req/min
  - `GET /transactions/summary` → 10 req/min
  - `GET /categories` → 30 req/min
- `ThrottlerGuard` is registered as `APP_GUARD` in `app.module.ts`.
- Health endpoint (`GET /health`) uses `@SkipThrottle()`.

### Error handling
- `PrismaExceptionFilter` (`src/prisma/prisma-exception.filter.ts`) catches `PrismaClientKnownRequestError` and maps codes to HTTP responses: P2002→409, P2025→404, P2003→400. Registered globally in `main.ts`.

### Database
- Pool is configured with `max: 10, idleTimeoutMillis: 30000` (`src/prisma/prisma.service.ts`).
- `getSummary` uses `prisma.transaction.groupBy` (database-side aggregation) — no in-memory computation.

### CORS
- `app.enableCors({ origin: 'http://localhost:4200', credentials: true })` — allows the Angular dev server. Add production origins before deploying.

### Dev/Ops
- `app.enableShutdownHooks()` is called in `main.ts` — handles SIGTERM/SIGINT gracefully.
- Health check available at `GET /health` (no auth, no rate limit).

### Module layout
```
src/
  app.{controller,service,module}.ts   # default "Hello World" on GET / — can be removed
  main.ts                              # bootstrap, global ValidationPipe, CORS, shutdown hooks
  prisma/                              # @Global() PrismaModule + PrismaService (adapter) + PrismaExceptionFilter
  auth/                                # AuthModule; supabase-auth/ holds the guard; current-user.decorator.ts
  transactions/                        # controller + service + DTO; guard applied at class level
  categories/                          # controller + service; guard applied at class level
  health/                              # HealthController + HealthModule (GET /health)
test/                                  # e2e specs + jest-e2e.json
prisma/                                # schema.prisma, seed.ts, migrations/
generated/prisma/                      # Prisma client output (gitignored)
```

## Commands

| Task | Command |
|---|---|
| Dev server (watch) | `bun run start:dev` |
| Build | `bun run build` (nest build; deletes `./dist` first via `nest-cli.json`) |
| Run prod build | `bun run start:prod` (`node dist/main`) |
| Lint (auto-fix) | `bun run lint` |
| Format | `bun run format` |
| Unit tests | `bun run test` (Jest, `rootDir: src`, `*.spec.ts`) |
| Watch tests | `bun run test:watch` |
| E2E tests | `bun run test:e2e` (config `test/jest-e2e.json`, `*.e2e-spec.ts`) |
| Coverage | `bun run test:cov` |

## Testing notes
- Unit tests use Jest with real mocks (PrismaService, AuthService). Tests override guards with `overrideGuard(SupabaseAuthGuard).useValue(mockGuard)` to avoid needing a real Supabase connection.
- `moduleNameMapper` in `package.json` maps `src/...` imports for Jest resolution.
- E2E specs spin up the full `AppModule`, so they need a reachable Postgres. The default `test/app.e2e-spec.ts` still expects the scaffolded `GET / -> "Hello World!"`; new e2e specs need to be aware of the JWT guard on `transactions` and `categories` (no token = 401).

## Lint / format
- ESLint flat config (`eslint.config.mjs`) runs `recommendedTypeChecked` with `parserOptions.projectService: true` — type-aware rules; expect them to need a valid `tsconfig.json`.
- Prettier config (`.prettierrc`): `singleQuote: true`, `trailingComma: "all"`, `endOfLine: "auto"`. Prettier errors are wired as ESLint errors.

## Out of repo
- Frontend (`cashflow-ui`, Angular 22) lives in a sibling directory `c:\Users\dil_a\Documents\Program\Personal\cashflow-ui`; consume this API at `http://localhost:3000` with `Authorization: Bearer <supabase-jwt>`. See `PRD-cashflow.md` for the full spec, KPIs, and roadmap.
- Spanish-language onboarding lives in `SETUP cashflow.md`; product spec in `PRD-cashflow.md`. Do not duplicate that content here.
