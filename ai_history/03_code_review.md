# 03 — Code Review, documentación y pruebas pendientes

## Bloque cronológico
Este documento resume el tercer momento de la conversación: cierre técnico, documentación del proyecto, creación de historial de IA y definición de pruebas para los casos críticos.

## 1. Momento de transición
Después de validar backend y frontend, se pasó a documentar el proyecto y preparar los entregables finales de la prueba técnica.

La conversación ya tenía implementados:

- Login funcional.
- Dashboard funcional.
- Backend protegido con JWT.
- Seed operativo.
- Endpoints validados en Postman.
- Conexión frontend-backend mediante Axios.

## 2. Prompt 10 — README.md
Se definió un prompt para crear el archivo `README.md` en la raíz del monorepo.

Estructura solicitada:

1. Cómo correrlo.
2. Decisiones de diseño tomadas y por qué.
3. Qué se dejó fuera y por qué.
4. Qué faltaría si fuera a producción mañana.
5. Tiempo aproximado invertido.
6. Qué se mejoraría de la prueba técnica.
7. Link al video.

## 3. Requisitos del README
El README debía incluir máximo tres comandos:

```bash
npm run install:all
npm run seed
npm run dev
```

También debía incluir:

- Credenciales de acceso.
- URLs de backend y frontend.
- Requisitos previos.
- Nota sobre `.env.example`.

Credenciales documentadas:

```text
maria@agentemotor.com / password123
```

URLs:

```text
Backend: http://localhost:3000
Frontend: http://localhost:5173
```

## 4. Decisiones de diseño que debían quedar documentadas
Se acordó resaltar:

- Status calculado en el service, no persistido en DB.
- Monorepo con scripts orquestadores.
- SQLite + TypeORM + better-sqlite3.
- JWT con usuario creado por seed.
- Filtros de tabla en frontend.
- Regla de negocio: no renovar sin gestionar primero.
- KPIs reutilizan la misma lógica de `findAll()`.

## 5. Elementos dejados fuera del MVP
Se decidió documentar como exclusiones conscientes:

| Funcionalidad fuera | Justificación |
|---|---|
| Notificaciones automáticas | Aumentan complejidad y no son core del MVP |
| Historial de intentos de contacto | Se cubrió inicialmente con campo de notas |
| Multiusuario / roles | El caso se centra en una asesora |
| Integración con aseguradoras | Fuera del alcance de la prueba |
| Catálogo de aseguradoras | String libre es suficiente para MVP |
| Registro de usuarios | El usuario se crea mediante seed |
| Paginación | La carga inicial es pequeña para la prueba |

## 6. Gaps para producción
Se definieron puntos críticos si el sistema pasara a producción:

- Mayor cobertura de tests.
- Manejo de errores más granular en frontend.
- JWT secret real y seguro.
- Migración de SQLite a Postgres.
- Paginación y búsqueda server-side.
- Logging estructurado y monitoreo.
- Refresh tokens.
- Mejor estrategia de auditoría e historial.

## 7. Historial de IA
El usuario solicitó crear una carpeta:

```text
ai_history/
├── 01_planeacion.md
├── 02_implementacion.md
├── 03_code_review.md
```

La intención fue dejar evidencia cronológica del uso de IA durante la construcción del proyecto, separando planeación, implementación y revisión/documentación.

## 8. Tests pendientes identificados
Quedó pendiente crear 2-3 tests del caso más crítico.

Se identificó como caso más crítico:

```text
No se puede marcar una póliza como renovada si antes no fue gestionada.
```

La razón: si esta regla falla, el sistema podría convertirse en un Excel digital con botones, sin garantizar trazabilidad real de contacto.

## 9. Prompt 11 — Tests del caso crítico
Se definió crear `policies.service.spec.ts` con tres pruebas unitarias usando Jest.

### Test 1 — No renovar sin gestionar
Debe validar que:

- Si `isManaged` es false.
- Y se intenta marcar `isRenewed` como true.
- El service lanza `BadRequestException`.
- El repositorio no ejecuta `save()`.

### Test 2 — Límite de ventana de 30 días
Debe validar:

- Vencida hace 30 días sigue en `EN_VENTANA`.
- Vencida hace 31 días pasa a `PERDIDA`.

Este test protege el límite regulatorio más importante del caso.

### Test 3 — Renovación válida
Debe validar:

- Si la póliza ya está gestionada.
- Se puede marcar como renovada.
- El estado resultante es `RENOVADA`.
- `RENOVADA` tiene prioridad sobre la fecha de vencimiento.

## 10. Tipo de pruebas acordadas
Se acordó que serían pruebas unitarias del service:

- Sin base de datos real.
- Sin endpoints HTTP.
- Con repositorio mockeado.
- Usando fechas relativas.

Decisión resaltada: probar el service es suficiente porque ahí vive la regla de negocio; no era necesario hacer e2e para este entregable mínimo.

## 11. Verificación recomendada
Además de correr los tests, se sugirió una verificación manual:

```text
Invertir temporalmente la condición del IF en update()
y confirmar que el Test 1 falla.
```

Esto demuestra que el test no es decorativo, sino que realmente protege la lógica de negocio.

## 12. Resultado de esta fase
La fase de code review/documentación dejó definidos:

- README operativo.
- Historial de IA por bloques cronológicos.
- Pendiente claro de pruebas críticas.
- Criterios de producción futura.
- Argumentos defendibles para entrevista técnica.

## 13. Puntos clave para defender en revisión técnica
1. El core del sistema está en la lógica de fechas y renovación, no en el CRUD.
2. Los estados se calculan dinámicamente para evitar datos obsoletos.
3. La regla de renovar después de gestionar protege la trazabilidad comercial.
4. El seed con fechas relativas hace la prueba reproducible.
5. Los tests propuestos cubren los límites de negocio más importantes.
6. Lo que quedó fuera fue una decisión de alcance, no un olvido.
