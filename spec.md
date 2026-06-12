# spec.md — Agentemotor Prueba Técnica

## 1. Cómo entendí el problema

El problema de María no es un problema de almacenamiento. Es un problema de **visibilidad y trazabilidad sobre una ventana de tiempo crítica**.

El regulador colombiano establece que una póliza vencida puede ser renovada por el mismo intermediario dentro de los **30 días siguientes** sin que se trate como nueva contratación. Pasados esos 30 días, el asesor compite en igualdad de condiciones con cualquier otro intermediario, lo que en la práctica significa pérdida del cliente.

Esto convierte el sistema en algo muy específico: **no es un CRUD de pólizas, es un sistema de alertas y trazabilidad de gestión sobre esa ventana de 30 días.**

Lo que María necesita concretamente:
- Ver de un vistazo qué pólizas requieren atención hoy, ordenadas por urgencia real
- Registrar que ya contactó a un cliente (reemplazar la "X" del Excel)
- Registrar cuando una póliza fue renovada (cerrar el ciclo)
- Mantener notas de contexto por póliza (qué le ofreció, qué respondió el cliente)
- Que el sistema funcione sin depender de su memoria ni de un archivo que se puede dañar

---

## 2. Qué decidí construir

### Construido

**Backend — NestJS REST API (puerto 3000)**
- Autenticación JWT con login por correo y contraseña
- Módulo de pólizas con cálculo dinámico de estado en el Service layer
- Módulo de clientes
- Endpoint de KPIs para las tarjetas del dashboard
- Seed automático con datos de prueba usando fechas relativas a hoy

**Frontend — React + Vite + MUI (puerto 5173)**
- Pantalla de login
- Dashboard con dos secciones principales:
  1. **KPI Cards** — 5 tarjetas con conteo por estado
  2. **Tabla de pólizas** — con filtros, toggles de gestión/renovación y campo de notas

### Qué dejé fuera y por qué

| Decisión | Justificación |
|---|---|
| Notificaciones automáticas / emails | Agrega dependencias externas (SMTP, cron jobs). El core del problema es la visibilidad, no la notificación. |
| Historial de intentos de contacto | Un campo de notas por póliza cubre el 80% del caso de uso sin sobre-ingeniería. |
| Múltiples asesores / roles | El caso describe a María como usuaria única. Multi-tenant requiere un modelo de datos diferente. |
| Integración con aseguradoras | Fuera del alcance explícito de la prueba. |
| Tabla de aseguradoras (catálogo) | String libre es suficiente para el MVP. Evita una tabla de configuración que no aporta al flujo central. |
| Docker | Explícitamente prohibido por la prueba. |

---

## 3. Supuestos que tuve que hacer

1. **Una póliza pertenece a un solo cliente.** El caso no menciona pólizas compartidas o co-titulares.

2. **El estado de la póliza se calcula siempre en tiempo real.** No se persiste en la base de datos porque un valor guardado ayer puede ser incorrecto hoy. El Service layer lo calcula en cada consulta usando `expirationDate` y la fecha actual.

3. **Los rangos de alerta son:**
   - **Al día**: vence en más de 10 días
   - **Por vencer**: vence en 6–10 días (alerta temprana)
   - **Crítico**: vence en 0–5 días (acción inmediata)
   - **En ventana**: vencida hace 1–30 días (recuperable, máxima prioridad)
   - **Perdida**: vencida hace más de 30 días (ventana cerrada)

4. **El flujo de gestión tiene una secuencia lógica:** primero `isManaged = true` (se contactó al cliente), luego `isRenewed = true` (renovó). No se puede marcar como renovada sin haber gestionado primero.

5. **Una póliza renovada sale del flujo de alertas.** Una vez marcada como renovada, ya no aparece como urgente independientemente de su fecha de vencimiento.

6. **El seed crea automáticamente el usuario de María** con credenciales conocidas para que el reclutador pueda entrar sin configuración adicional.

7. **No se valida formato de teléfono ni documento de identidad.** Datos de prueba suficientes para demostrar el flujo.

---

## 4. Cómo funciona el sistema — flujos principales

### Flujo 1: Inicio de sesión
```
María abre la app → pantalla de login
→ ingresa maria@agentemotor.com / password123
→ backend valida credenciales, retorna JWT
→ frontend guarda token, redirige al dashboard
```

### Flujo 2: Vista del dashboard
```
Dashboard carga → llama GET /policies con JWT
→ backend consulta todas las pólizas del asesor
→ Service calcula status de cada póliza según fecha actual
→ frontend renderiza KPI cards + tabla
→ María ve de un vistazo qué necesita atención hoy
```

### Flujo 3: Gestión de una póliza
```
María identifica póliza crítica en la tabla
→ activa toggle "Gestionado" → PATCH /policies/:id
→ backend actualiza isManaged = true, registra updatedAt
→ toggle "Renovado" se habilita
→ si el cliente acepta: activa toggle "Renovado"
→ póliza sale del flujo de alertas
→ María escribe nota: "Ofreció SURA por $180.000, acepta renovar"
→ PATCH /policies/:id actualiza notes
```

### Flujo 4: Filtrado de la tabla
```
María quiere ver solo las pólizas en ventana crítica
→ selecciona filtro "En ventana" en el selector de estado
→ tabla se filtra en frontend (sin llamada adicional al backend)
→ vista enfocada en lo urgente
```

---

## 5. Modelo de datos

### Entidad: User
```typescript
id            UUID (PK)
email         string (unique)
password      string (bcrypt hash)
name          string
createdAt     Date
```

### Entidad: Client
```typescript
id            UUID (PK)
name          string
phone         string
email         string (nullable)
createdAt     Date
```

### Entidad: Policy
```typescript
id             UUID (PK)
clientId       UUID (FK → Client)
insurer        string
type           enum: AUTO | HOGAR | VIDA | OTRO
expirationDate Date
isManaged      boolean (default: false)
isRenewed      boolean (default: false)
notes          string (nullable)
createdAt      Date
updatedAt      Date
```

### Campo calculado: status (no persiste en DB)
```
Calculado en PolicyService en cada consulta:

daysUntilExpiry = differenceInDays(expirationDate, today)

RENEWED     → isRenewed = true (independiente de fecha)
AL_DIA      → daysUntilExpiry > 10
POR_VENCER  → daysUntilExpiry entre 6 y 10
CRITICO     → daysUntilExpiry entre 0 y 5
EN_VENTANA  → daysUntilExpiry entre -30 y -1
PERDIDA     → daysUntilExpiry < -30
```

### Relaciones
```
User    (1) ── sin relación directa con Policy en este MVP
Client  (1) ──── (N) Policy
```

> Nota: En producción, Policy tendría una FK a User (el asesor que la gestiona). Para el MVP de un solo asesor, no es necesario y simplifica el modelo.

---

## 6. Endpoints expuestos

### Auth
```
POST /auth/login
  body: { email, password }
  response: { access_token }
```

### Policies (todas requieren JWT)
```
GET    /policies              → lista todas las pólizas con status calculado + datos del cliente
GET    /policies/kpis         → conteo por estado para las KPI cards
PATCH  /policies/:id          → actualiza isManaged, isRenewed, notes
```

### Clients (todas requieren JWT)
```
GET    /clients               → lista todos los clientes
POST   /clients               → crea un cliente nuevo
```

---

## 7. Trade-offs considerados

### Status calculado vs. persistido
**Elegí calculado.** Un campo `status` en la base de datos se vuelve mentira con el tiempo sin un job de sincronización. Calcularlo en el Service garantiza que siempre refleja la realidad. El costo es una operación de fecha por póliza en cada consulta — aceptable para el volumen de este MVP.

### Filtros en frontend vs. backend
**Elegí frontend** para los filtros de la tabla. Con 280 clientes y ~500 pólizas el volumen es manejable en memoria. Evita endpoints adicionales y hace la experiencia más fluida (filtrado instantáneo sin llamadas de red). En producción con miles de registros, esto cambiaría.

### Notas en Policy vs. tabla ContactAttempt
**Elegí notas en Policy.** Un campo de texto libre cubre el caso de uso principal (contexto de qué se habló) sin la complejidad de manejar un historial de intentos. María necesita saber el último estado de la conversación, no un log completo. Si el producto evoluciona, ContactAttempt sería el siguiente paso natural.

### Autenticación incluida
**Elegí incluirla** porque el stack lo contempla explícitamente (NestJS + JWT) y porque en producción los datos de cartera de un asesor son sensibles. El seed crea el usuario automáticamente para no agregar fricción al evaluador.

### Monorepo simple
**Un solo repositorio** con `backend/` y `frontend/` como subcarpetas, con scripts en el `package.json` raíz usando `concurrently`. Permite ejecutar todo el proyecto con 3 comandos sin Docker ni configuración adicional.

---

## 8. Decisión más difícil

La decisión que más tiempo tomó fue **dónde vive la lógica de los rangos de alerta**.

La opción común es poner los 5 estados como un `enum` en la base de datos y actualizarlo con un cron job. Es lo que haría alguien que viene del mundo Excel — una columna más.

La opción correcta es reconocer que el estado **no es un dato, es una función del tiempo**. `f(expirationDate, today) → status`. Mañana la misma póliza tendrá un estado diferente sin que nadie la toque. Eso no puede vivir en la base de datos.

Ubicar esta lógica en el Service layer, y solo ahí, es lo que hace que el sistema sea confiable sin mantenimiento.
