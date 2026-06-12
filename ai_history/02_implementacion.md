# 02 — Implementación del proyecto Agentemotor

## Bloque cronológico
Este documento resume el segundo momento de la conversación: implementación guiada por prompts para GitHub Copilot, validación por módulos y conexión completa entre backend y frontend.

## 1. Metodología de trabajo definida
Se estableció un ciclo de trabajo iterativo:

```text
Chat de arquitectura
        ↓
Prompt estructurado para GitHub Copilot con @workspace
        ↓
Implementación en VS Code
        ↓
Validación del resultado
        ↓
Corrección o avance al siguiente módulo
```

Cada prompt debía tener:

- Contexto.
- Tarea.
- Restricciones.
- Resultado esperado.

Decisión resaltada: los prompts se hicieron muy explícitos para evitar que Copilot agregara librerías, archivos o decisiones no acordadas.

## 2. Prompt 1 — Scaffolding del monorepo
Se implementó la estructura base:

```text
agentemotor/
├── package.json
├── .gitignore
├── backend/
└── frontend/
```

Backend:

- NestJS.
- TypeScript.
- TypeORM.
- better-sqlite3.
- JWT.
- Passport.
- ConfigModule.
- bcryptjs.
- class-validator.

Frontend:

- React.
- Vite.
- TypeScript.
- Material UI.
- Axios.
- React Router.

Validación realizada:

- `npm run dev` levantó backend y frontend.
- Backend en `localhost:3000`.
- Frontend en `localhost:5173`.
- Warnings de Windows relacionados con `EPERM` fueron considerados benignos.

## 3. Prompt 2 — Entidades TypeORM y configuración de base de datos
Se crearon las entidades:

- `UserEntity`
- `ClientEntity`
- `PolicyEntity`

También se configuró:

- `ConfigModule.forRoot({ isGlobal: true })`
- `TypeOrmModule.forRootAsync`
- SQLite con `better-sqlite3`
- `synchronize: true`
- `ValidationPipe` global
- CORS para el frontend

Validación realizada:

- El backend arrancó sin errores.
- Se creó el archivo `agentemotor.db`.

Corrección aplicada:

Las entidades generaron advertencias de TypeScript por propiedades no inicializadas. Se corrigió usando el operador `!` en las propiedades decoradas por TypeORM.

Ejemplo:

```ts
@Column()
name!: string;
```

## 4. Prompt 3 — AuthModule y UsersModule
Se implementó autenticación JWT completa.

Archivos principales:

- `users.module.ts`
- `users.service.ts`
- `auth.module.ts`
- `auth.service.ts`
- `auth.controller.ts`
- `jwt.strategy.ts`
- `jwt-auth.guard.ts`
- `login.dto.ts`

Decisiones importantes:

- No se creó endpoint de registro.
- El usuario se crea desde el seed.
- El login es público.
- Las demás rutas se protegen con JWT.

Validación realizada:

- `POST /auth/login` con usuario inexistente devolvió `401 Unauthorized`.
- Ese resultado fue correcto porque aún no existía usuario en base de datos.

## 5. Prompt 4 — ClientsModule
Se implementó el módulo de clientes con patrón:

```text
Controller → Service → Repository
```

Endpoints creados:

- `GET /clients`
- `GET /clients/:id`
- `POST /clients`

Validación realizada:

- `GET /clients` sin token devolvió `401 Unauthorized`.
- Esto confirmó que el guard estaba funcionando.

## 6. Prompt 5 — PoliciesModule
Se implementó el módulo central del sistema.

Elementos principales:

- `policies.service.ts`
- `policies.controller.ts`
- `policies.module.ts`
- `update-policy.dto.ts`

Lógica crítica implementada:

```ts
if (isRenewed) return RENOVADA;
if (daysUntilExpiry > 10) return AL_DIA;
if (daysUntilExpiry >= 6) return POR_VENCER;
if (daysUntilExpiry >= 0) return CRITICO;
if (daysUntilExpiry >= -30) return EN_VENTANA;
return PERDIDA;
```

También se implementó:

- `findAll()` con pólizas enriquecidas.
- `getKpis()` reutilizando `findAll()`.
- `update()` con regla de negocio.

Regla validada:

```text
No renovar sin gestionar primero.
```

Ajuste de idioma:

Se decidió dejar los estados en español para mantener consistencia:

- RENOVADA
- AL_DIA
- POR_VENCER
- CRITICO
- EN_VENTANA
- PERDIDA

Validación realizada:

- `GET /policies` sin token devolvió `401 Unauthorized`.
- `GET /policies/kpis` sin token devolvió `401 Unauthorized`.

## 7. Prompt 6 — Seed
Se creó un script standalone `seed.ts` usando TypeORM directamente, sin contexto NestJS.

El seed generó:

- Usuario María.
- 15 clientes.
- 16 pólizas.
- Fechas dinámicas relativas a `new Date()`.

Credenciales generadas:

```text
maria@agentemotor.com / password123
```

Distribución de pólizas:

- 3 AL_DIA.
- 3 POR_VENCER.
- 3 CRITICO.
- 4 EN_VENTANA.
- 2 PERDIDA.
- 1 RENOVADA.

Validación realizada:

- `npm run seed` ejecutó correctamente.
- `POST /auth/login` generó token JWT.
- Con token se pudieron consultar clientes, pólizas y KPIs.

## 8. Prompt 7 — Base del frontend
Se implementó la base de la aplicación frontend.

Archivos principales:

- `types/index.ts`
- `services/api.ts`
- `components/PrivateRoute.tsx`
- `pages/LoginPage.tsx`
- `pages/DashboardPage.tsx`
- `App.tsx`
- `main.tsx`

Funcionalidades:

- Axios con `VITE_API_URL`.
- Interceptor para enviar Bearer token.
- Login con Material UI.
- Rutas protegidas.
- Token en localStorage.

Validación realizada:

- Login con María funcionó end-to-end.
- El frontend llamó correctamente la API.
- Después de iniciar sesión redirigió al dashboard.

## 9. Prompt 8 — KPI Cards y Dashboard
Se construyó la primera parte del dashboard.

Componentes:

- `KpiCard.tsx`
- `DashboardPage.tsx`

KPI cards definidas:

- En Ventana.
- Crítico.
- Por Vencer.
- Al Día.
- Perdidas.

Decisión resaltada:

No se incluyó una card de RENOVADA porque una renovación es un resultado positivo, no una alerta que requiera gestión inmediata.

Validación esperada:

- KPIs muestran valores reales del seed.
- Click en una card activa/desactiva filtro visual.
- Cerrar sesión limpia token y redirige a login.

## 10. Prompt 9 — Tabla de pólizas
Se implementó la tabla principal de gestión.

Funcionalidades esperadas:

- Mostrar todas las pólizas.
- Filtrar por card activa.
- Mostrar badges por estado.
- Switch de gestionado.
- Switch de renovado.
- Campo de notas persistente.
- Actualización de KPIs después de cambios.

Decisiones de UX:

- Las filas críticas o en ventana sin gestionar tienen una señal visual de urgencia.
- El switch de renovado se deshabilita hasta que la póliza esté gestionada.
- Las notas se guardan al perder foco para evitar exceso de botones.

## 11. Resultado de esta fase
La implementación dejó construido:

- Backend funcional con autenticación, clientes, pólizas, KPIs y seed.
- Frontend funcional con login, dashboard, cards, tabla y acciones.
- Integración completa mediante Axios y JWT.
- Validaciones principales realizadas con Postman y navegador.

## 12. Riesgos controlados durante la implementación
1. Copilot podía inventar estructura: se mitigó con prompts restrictivos.
2. TypeScript estricto podía fallar en entidades: se corrigió con `!`.
3. Sin seed no era posible probar auth: se implementó seed antes de validar endpoints protegidos.
4. Los estados podían volverse inconsistentes: se centralizó la lógica en el service.
5. Frontend y backend podían divergir: se definieron tipos y enums equivalentes.
