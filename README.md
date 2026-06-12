# Agentemotor — Sistema de Gestión de Renovaciones

## 1. Cómo correrlo

**Requisitos:** Node.js 18+

```bash
# 1. Instalar dependencias de backend y frontend
npm run install:all

# 2. Crear la base de datos y poblarla con datos de prueba
npm run seed

# 3. Levantar backend y frontend en paralelo
npm run dev
```

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173
- **Credenciales:** `maria@agentemotor.com` / `password123`

> Si el backend no arranca, verificar que exista el archivo `src/backend/.env`. Hay un `.env.example` en esa carpeta — copiar y renombrar:
> ```bash
> cp src/backend/.env.example src/backend/.env
> ```

---

## 2. Decisiones de diseño

**Status calculado en el Service, no persistido en DB.**
El estado de una póliza (`CRITICO`, `EN_VENTANA`, etc.) es una función del tiempo: `f(expirationDate, today)`. Un campo persistido en base de datos se vuelve mentira al día siguiente sin un job de sincronización. Calcularlo en cada consulta garantiza que siempre refleja la realidad sin mantenimiento adicional.

**Monorepo con scripts orquestadores.**
Backend y frontend en la misma raíz con `concurrently` en el `package.json` raíz. Permite ejecutar todo el proyecto con 3 comandos sin Docker ni configuración adicional, que es exactamente lo que requiere la prueba.

**SQLite + TypeORM + better-sqlite3.**
Cero dependencias externas para la base de datos. El archivo `.db` se crea automáticamente con el seed. Para producción real esto migra a Postgres, pero para evaluar la prueba elimina fricciones de setup.

**JWT con seed automático del usuario.**
La autenticación está incluida porque los datos de cartera de un asesor son sensibles por naturaleza. El seed crea el usuario de María automáticamente para que el evaluador pueda entrar sin configuración adicional.

**Filtros de la tabla en frontend, no en backend.**
Con el volumen actual (~16 pólizas de seed, ~500 reales de María) el filtrado en memoria es instantáneo y evita endpoints adicionales. El backend expone los datos completos una vez; el frontend filtra localmente. En producción con miles de registros esto cambiaría a búsqueda server-side.

**Regla de negocio: Renovado requiere Gestionado primero.**
Refleja el flujo real: María primero contacta al cliente (`isManaged`) y luego confirma la renovación (`isRenewed`). Esta secuencia está validada en el backend (400 si se intenta saltarla) y reforzada en el frontend (switch deshabilitado con tooltip explicativo).

**KPIs reutilizan la lógica de `findAll()`.**
El endpoint `GET /policies/kpis` no tiene lógica propia de conteo — llama al mismo método que lista las pólizas y agrupa los resultados. Esto garantiza que los números de las cards siempre coincidan con lo que muestra la tabla, sin riesgo de inconsistencia.

---

## 3. Qué dejé fuera

| Funcionalidad | Justificación |
|---|---|
| Notificaciones automáticas / emails | Requiere dependencias externas (SMTP, cron jobs). El core del problema es visibilidad, no notificación. |
| Historial de intentos de contacto (`ContactAttempt`) | Un campo de notas por póliza cubre el 80% del caso sin sobre-ingeniería. `ContactAttempt` sería el siguiente paso natural si el producto evoluciona. |
| Multi-usuario / roles | El caso describe a María como usuaria única. Multi-tenant requiere un modelo de datos diferente (FK de Policy a User). |
| Integración con aseguradoras | Fuera del alcance explícito de la prueba. |
| Catálogo de aseguradoras | String libre es suficiente para el MVP. Evita una tabla de configuración que no aporta al flujo central. |
| Endpoint de registro de usuarios | No es parte del flujo descrito. El acceso se gestiona vía seed. |
| Paginación en la tabla | Con el volumen actual (≤500 pólizas) no es necesaria. La búsqueda por nombre en frontend es suficiente. |

---

## 4. Si fuera a producción mañana

- **Tests:** Cobertura actual cubre el caso de negocio crítico (regla Gestionado/Renovado). Faltaría cobertura de los otros endpoints, casos borde de fechas y tests de integración end-to-end.
- **Secretos reales:** El `JWT_SECRET` actual es un string de desarrollo. En producción necesita rotación, variables de entorno gestionadas por el proveedor cloud y nunca en el repositorio.
- **SQLite → Postgres:** SQLite no maneja concurrencia de escritura. Con más de un usuario simultáneo o un proceso de seed/migración en background, Postgres es obligatorio.
- **Paginación y búsqueda server-side:** Con la cartera real de 280+ clientes de María la tabla sigue siendo manejable, pero por encima de ~2.000 pólizas el filtrado en frontend deja de ser viable.
- **Logging estructurado y monitoreo:** Sin logs estructurados (JSON) no hay forma de depurar errores en producción. Faltaría integrar algo como Pino + una plataforma de observabilidad.
- **Refresh tokens:** El JWT actual expira en 7 días sin posibilidad de renovación silenciosa. María tendría que loguearse de nuevo cada semana.
- **Confirmación antes de acciones irreversibles:** Desactivar "Gestionado" en una póliza que ya estaba en proceso debería pedir confirmación, no ejecutarse al primer click.
- **Manejo de errores más granular en frontend:** Actualmente el Snackbar muestra el mensaje del backend tal cual. En producción convendría mapear errores a mensajes comprensibles para el usuario.

---

## 5. Tiempo aproximado

Revisando el momento en que inicie el desarrollo de la prueba con el primer mensaje a Claude fue a las 3.15 pm, en el momento que estoy construyendo este readme.md son las 7.20 pm, lo que me llevaría un tiempo aproximado de 4 horas.



---

## 6. Qué mejoraría de esta prueba técnica

En terminos generales fue una prueba muy entretenida y retadora, más que mejorar, como reflexión me gustó que se deba evidencia el uso de la IA para el proceso, en este sentido, ya que me he enfocado en aprender a identificar y entender el problema y a dar instrucciones claras a la IA que utilice en ese momento. 



## Video

[Link al video — completar]
