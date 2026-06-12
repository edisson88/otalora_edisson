# 01 — Planeación del proyecto Agentemotor

## Bloque cronológico
Este documento resume el primer momento de la conversación: la comprensión del caso, definición del problema, alcance funcional, modelo de datos, arquitectura técnica y decisiones iniciales antes de implementar.

## 1. Lectura del problema
La prueba técnica se interpretó como un caso de gestión de renovación de pólizas para una asesora que actualmente controla cerca de 260 clientes mediante Excel.

La conclusión principal fue que el sistema no debía ser un CRUD simple de pólizas, sino una herramienta tipo dashboard para priorizar la gestión comercial según fechas de vencimiento y riesgo de pérdida del cliente.

## 2. Problema central identificado
El problema de negocio se definió como la gestión de una ventana de tiempo crítica:

- Pólizas vigentes o próximas a vencer: permiten gestión preventiva.
- Pólizas vencidas entre 1 y 30 días: todavía son recuperables.
- Pólizas vencidas por más de 30 días: se consideran perdidas o fuera de la ventana de gestión.

La decisión importante fue entender que el valor del sistema está en mostrar urgencias y trazabilidad, no solo en almacenar datos.

## 3. Enfoque funcional acordado
Se definió una aplicación web con:

- Login para la asesora.
- Dashboard principal.
- KPI cards o flashcards con conteos por estado.
- Tabla de pólizas con filtros.
- Acciones rápidas para marcar una póliza como gestionada y luego renovada.
- Campo de notas para registrar contexto de contacto con el cliente.

## 4. Estados definidos para las pólizas
Se acordó que el estado no estaría guardado en la base de datos, sino calculado dinámicamente en la API a partir de la fecha de vencimiento y la bandera de renovación.

Estados definidos:

| Estado | Lógica |
|---|---|
| AL_DIA | Vence en más de 10 días |
| POR_VENCER | Vence entre 6 y 10 días |
| CRITICO | Vence entre 0 y 5 días |
| EN_VENTANA | Vencida entre 1 y 30 días |
| PERDIDA | Vencida hace 31 días o más |
| RENOVADA | Póliza marcada como renovada |

Decisión resaltada: `status` es una función del tiempo, no un dato estático. Por eso se calcula en el service y no se persiste.

## 5. Flujo de negocio validado
Se definió una secuencia obligatoria:

```text
Póliza vigente / por vencer / crítica / en ventana
        ↓
Gestionada: la asesora ya contactó al cliente
        ↓
Renovada: solo si previamente fue gestionada
```

Regla de negocio clave:

```text
No se puede marcar una póliza como renovada si antes no fue marcada como gestionada.
```

Esta regla se validaría en backend y también se reflejaría visualmente en frontend.

## 6. Modelo de datos definido
Se acordaron tres entidades principales:

### User
Representa a la asesora que ingresa al sistema.

Campos principales:

- id
- email
- password hasheada
- name
- createdAt

### Client
Representa al cliente de la asesora.

Campos principales:

- id
- name
- phone
- email opcional
- createdAt

### Policy
Representa la póliza asociada a un cliente.

Campos principales:

- id
- insurer
- type: AUTO, HOGAR, VIDA, OTRO
- expirationDate
- isManaged
- isRenewed
- notes
- clientId
- createdAt
- updatedAt

Relación definida:

```text
Client 1 ─── N Policy
```

## 7. Decisiones técnicas iniciales
Stack acordado:

| Capa | Tecnología |
|---|---|
| Backend | NestJS + TypeScript |
| Frontend | React + Vite + TypeScript |
| UI | Material UI |
| Base de datos | SQLite |
| ORM | TypeORM |
| Auth | JWT |
| Persistencia local | Archivo `agentemotor.db` |

## 8. Justificación de SQLite
Se eligió SQLite porque la prueba técnica no permitía depender de servicios cloud ni credenciales externas.

Ventajas para este caso:

- No requiere servidor de base de datos.
- Funciona con un archivo local.
- Facilita la evaluación por parte del reclutador.
- Permite ejecutar el proyecto con pocos comandos.

## 9. Seed dinámico
Se decidió que el archivo `.db` no se entregaría directamente. En su lugar, se generaría mediante un script `seed.ts`.

El seed debía crear:

- Usuario de prueba para María.
- Clientes realistas.
- Pólizas con fechas relativas a la fecha actual.

Decisión resaltada: usar fechas dinámicas evita que la prueba se dañe si el reclutador la ejecuta semanas o meses después.

## 10. Estructura del monorepo
Se validó una estructura simple:

```text
agentemotor/
├── package.json
├── backend/
└── frontend/
```

Scripts principales definidos:

```bash
npm run install:all
npm run seed
npm run dev
```

Decisión resaltada: el monorepo permite que el evaluador instale, cargue datos y ejecute todo desde la raíz.

## 11. Variables de entorno acordadas
Backend:

```env
PORT=3000
JWT_SECRET=agentemotor_secret_key
DB_PATH=./agentemotor.db
```

Frontend:

```env
VITE_API_URL=http://localhost:3000
```

## 12. Resultado de esta fase
La fase de planeación dejó definidos:

- El dominio del problema.
- El alcance del MVP.
- Los estados de negocio.
- El modelo de datos.
- La arquitectura técnica.
- La estrategia de autenticación.
- La estructura del monorepo.
- El criterio de documentación inicial mediante `spec.md`.

## 13. Decisiones más importantes para defender
1. El sistema no es un CRUD, es un dashboard de gestión de renovaciones.
2. El estado de la póliza se calcula en la API, no se guarda en base de datos.
3. La renovación exige gestión previa.
4. SQLite se usa por simplicidad, portabilidad y restricciones de la prueba.
5. El seed usa fechas dinámicas para mantener vigente el caso.
6. El monorepo reduce fricción para evaluación.
