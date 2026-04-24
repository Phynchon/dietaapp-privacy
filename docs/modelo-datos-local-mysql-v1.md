# Modelo de Datos Inicial - Local y MySQL (v1)

## 1. Enfoque por fases
- Fase A (v1): almacenamiento local en dispositivo.
- Fase B: sincronizacion opcional con backend MySQL.
- Fase C: panel de control y consultas avanzadas.

## 2. Entidades funcionales
- Usuario
- Programa
- SeguimientoDiario
- HitoDiario
- CambioDieta
- PreferenciasAviso
- HistorialNotificacion

## 3. Esquema local sugerido
Puede implementarse con almacenamiento estructurado local.

### 3.1 user_profile
- id (string, uuid)
- alias (string, requerido)
- country (string)
- age (number)
- gender (string)
- height_cm (number, requerido)
- weight_kg (number, requerido)
- imc (number, calculado)
- created_at (datetime)
- updated_at (datetime)

### 3.2 user_preferences
- user_id (string, fk user_profile.id)
- notifications_enabled (boolean)
- breakfast_time (string HH:mm, nullable)
- lunch_time (string HH:mm, nullable)
- meal_time (string HH:mm, nullable)
- snack_time (string HH:mm, nullable)
- dinner_time (string HH:mm, nullable)
- updated_at (datetime)

### 3.3 program_cycle
- id (string, uuid)
- user_id (string, fk user_profile.id)
- diet_level (string: 1400 | 1600 | 1800 | 2000)
- start_date (date)
- start_datetime (datetime)
- status (string: pending_start | active | paused | completed | dropped)
- planned_days (number, default 56)
- current_day_index (number, 1..56)
- notify_day_before_sent (boolean)
- created_at (datetime)
- updated_at (datetime)

### 3.4 daily_tracking
- id (string, uuid)
- program_id (string, fk program_cycle.id)
- day_number (number, 1..56)
- tracking_date (date)
- fasting_done (boolean, nullable)
- total_calories (number, nullable)
- calories_target (number, nullable)
- calories_delta (number, nullable)
- notes (string, nullable)
- completion_mode (string: realtime | end_of_day | retroactive)
- recorded_at (datetime)
- updated_at (datetime)

### 3.5 daily_milestone
- id (string, uuid)
- daily_tracking_id (string, fk daily_tracking.id)
- meal_type (string: desayuno | almuerzo | comida | merienda | cena)
- completed (boolean)
- completed_at (datetime, nullable)

### 3.6 diet_change_event
- id (string, uuid)
- program_id (string, fk program_cycle.id)
- previous_diet_level (string)
- new_diet_level (string)
- change_date (date)
- keep_progress (boolean, default true)
- reason (string, nullable)

### 3.7 notification_log
- id (string, uuid)
- program_id (string, fk program_cycle.id)
- notification_type (string: day_before | meal_reminder)
- scheduled_for (datetime)
- delivered_at (datetime, nullable)
- status (string: scheduled | delivered | failed | skipped_no_permission)

## 4. Esquema MySQL sugerido (sincronizacion)
Crear tablas equivalentes a las entidades locales con claves primarias UUID y campos de auditoria:
- created_at
- updated_at
- deleted_at (soft delete opcional)

Indices minimos recomendados:
- program_cycle: (user_id, status), (start_date)
- daily_tracking: (program_id, day_number), (tracking_date)
- daily_milestone: (daily_tracking_id, meal_type)
- notification_log: (program_id, scheduled_for), (status)

## 5. Contrato minimo API (fase B)
- POST /users
- PUT /users/{id}
- POST /programs
- PATCH /programs/{id}
- POST /programs/{id}/daily-tracking
- POST /programs/{id}/diet-changes
- GET /programs/{id}/timeline

## 6. Reglas de negocio clave
- Un usuario puede tener varios programas historicos, pero solo 1 activo.
- Day number es correlativo y no se reutiliza dentro del mismo programa.
- Cambio de dieta conserva program_id y seguimiento salvo reinicio explicito.
- Si notificaciones estan desactivadas, notification_log registra skipped_no_permission.

## 7. Privacidad y seguridad (minimo viable)
- Consentimiento explicito antes de guardar datos personales.
- Cifrado en transito (HTTPS) cuando exista backend.
- Cifrado de copias de seguridad.
- Posibilidad de borrado total de datos por usuario.
