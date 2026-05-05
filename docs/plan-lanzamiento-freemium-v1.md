# Plan de Lanzamiento Freemium v1 - Dieta App

## 1. Objetivo
Definir un lanzamiento realista de Dieta App con dos niveles de acceso:
- Gratis con anuncios y funciones limitadas.
- Premium con seguimiento completo y experiencia sin anuncios.

Este plan prioriza salir rapido, validar demanda y reducir complejidad tecnica en la primera etapa.

## 2. Propuesta de valor por plan

### 2.1 Plan Gratis (sin registro obligatorio)
Incluye:
- Menus y consejos.
- Calculadora IMC y seleccion de nivel calorico.
- Uso basico de la app.
- Publicidad.

No incluye:
- Seguimiento historico completo en servidor.
- Estadisticas privadas avanzadas.
- Avisos y recomendaciones personalizadas premium.

### 2.2 Plan Premium (con registro)
Incluye:
- Cuenta con email y contrasena.
- Seguimiento diario completo (persistente).
- Avisos personalizados.
- Consejos diarios personalizados.
- Panel privado de estadisticas.
- Sin anuncios.

## 3. Recomendacion comercial para el arranque
En v1 comercial, lanzar solo una modalidad de pago para simplificar:
- Suscripcion mensual.

Decision cerrada (2026-05-01):
- Precio: 4,99 EUR/mes.
- Prueba gratis: 7 dias.
- Canal de alta y gestion: solo Google Play Billing.
- CTA principal: "Prueba Premium 7 dias gratis".
- Texto legal junto al CTA: "Luego 4,99 EUR/mes. Cancela cuando quieras.".
- CTA secundario: "No, seguire con publicidad".

Dejar pago unico para v2 cuando haya datos reales de uso y conversion.

## 4. Flujo de usuario recomendado (v1)

### 4.1 Primer uso
1. Seleccion de idioma.
2. IMC y nivel sugerido.
3. Inicio en modo gratis sin bloquear el acceso.

### 4.2 Activacion
1. Tras 2-3 dias de uso, mostrar el valor del seguimiento.
2. Invitar a crear cuenta para guardar progreso y activar estadisticas.

### 4.3 Monetizacion
1. Mostrar paywall al intentar usar funciones premium.
2. Mostrar paywall despues de que el usuario vea valor (no en la primera pantalla).

## 5. Reglas de acceso (funcionales)
- Sin registro: acceso a contenido base y herramientas iniciales.
- Con registro gratuito (si se habilita en v1.1): progreso corto o limitado.
- Premium activo: acceso completo a tracking, estadisticas y avisos.

Nota:
- El alias puede mantenerse como campo visible para la experiencia, pero la identidad tecnica debe ser email + id unico.
- El alias unico no debe bloquear el alta en v1.

## 6. Eventos de producto a medir desde el dia 1

### 6.1 Embudo de activacion
- app_open
- imc_completed
- diet_selected
- program_started
- day_checkin_saved

### 6.2 Embudo de monetizacion
- paywall_viewed
- paywall_cta_clicked
- subscription_started
- subscription_renewed
- subscription_canceled

### 6.3 Retencion
- d1_active
- d7_active
- d30_active
- streak_days

## 7. Metricas clave de negocio (KPIs)
- Activacion: porcentaje de usuarios que completan IMC e inician programa.
- Retencion: D1, D7 y D30.
- Conversion a pago: porcentaje de usuarios que pasan a premium.
- Churn mensual: porcentaje que cancela premium.
- ARPU: ingreso medio por usuario.

## 8. Definicion de estadisticas del usuario (v1)
- Calorias consumidas segun cumplimiento diario.
- Calorias estimadas sin plan.
- Deficit calorico acumulado estimado.
- Perdida de peso estimada.
- Peso real reportado por usuario.

Recomendacion:
- Todas las estimaciones deben mostrarse como orientativas y no medicas.

## 9. Cumplimiento legal minimo para lanzamiento
- Politica de privacidad actualizada con analitica y suscripciones.
- Terminos de uso con condiciones de cancelacion.
- Disclaimer de salud: no sustituye consejo medico.
- Consentimiento explicito para datos personales y de salud.

## 10. Roadmap sugerido

### Fase 1 (2-4 semanas)
- Gratis + seguimiento base ya operativo.
- Registro estable y persistencia correcta.
- Metrica de eventos minima.
- Paywall informativo sin cobro real (opcional para test).

### Fase 2 (4-8 semanas)
- Suscripcion mensual activa.
- Bloqueo premium por funcionalidades.
- Dashboard privado de progreso.

### Fase 3
- Evaluar pago unico segun datos de conversion y churn.
- Mejorar personalizacion de avisos y recomendaciones.

## 11. Criterios de salida a produccion (Go/No-Go)
Go si se cumple:
- Alta, login y guardado diario sin errores criticos.
- Sincronizacion movil-backend estable.
- CORS y API validados en Android.
- Healthcheck backend estable y BD operativa.
- Embudo de eventos disponible.

No-Go si ocurre:
- Perdida de datos de seguimiento.
- Caidas frecuentes de API.
- Fallos repetidos en alta/registro desde movil.

## 12. Decision recomendada para Dieta App hoy
- Lanzar con modelo freemium simple.
- Mantener infraestructura actual mientras cumpla rendimiento.
- Priorizar validacion de uso real antes de escalar costes (VPS o arquitectura mas compleja).
