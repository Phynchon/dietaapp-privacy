# Tablero de Ejecucion v1 - Dieta App

## Como usar este tablero
- Mover tareas de To Do -> Doing -> Done.
- Mantener maximo 3 tareas en Doing al mismo tiempo.
- Cerrar cada dia con al menos 1 tarea en Done.

## To Do

### Semana 1 - Estabilidad y medicion
- [ ] Validar flujo completo: IMC -> inicio -> check-in diario en Android real.
- [ ] Verificar guardado correcto de alias y edad tras reinstalacion.
- [ ] Confirmar inserciones en MySQL de users, program_cycles y daily_checkins.
- [ ] Confirmar CORS operativo para el origen Android usado en produccion.

### Semana 2 - Planes y acceso
- [ ] Definir reglas funcionales finales por plan.
- [x] Crear estado de plan de usuario (free/premium).
- [x] Aplicar bloqueos premium en UI (feature gates).
- [x] Implementar pantalla de paywall en modo simulacion.
- [x] Extender backend para devolver plan actual del usuario.

### Semana 3 - Monetizacion
- [x] Elegir suscripcion mensual como cobro v1.
- [ ] Integrar compra in-app Android (Google Play Billing) en entorno de pruebas.
- [ ] Activar desbloqueo premium tras compra validada.
- [ ] Implementar restauracion de compra (Android).
- [ ] Revisar textos legales y consentimiento de datos.

### Semana 4 - Lanzamiento controlado
- [ ] Publicar beta cerrada.
- [ ] Monitorizar errores criticos y latencia de API.
- [ ] Revisar diariamente conversion, retencion y fallos de sync.
- [ ] Corregir incidencias criticas en menos de 24h.
- [ ] Ejecutar decision Go/No-Go con docs/go-no-go-playstore-v1.md antes de produccion.

## Doing
- [ ] Publicar AAB en Internal Testing (ver `docs/plan-beta-interna-android-semana.md`).
- [ ] Ejecutar smoke test Android con 2 testers/dispositivos.
- [ ] Cerrar decision Go/No-Go interno Android del dia.


## Done
- [x] Corregida sincronizacion movil-backend para guardar registros en MySQL.
- [x] Corregido origen Android para evitar bloqueo CORS en produccion.
- [x] Creado checklist tecnico de deploy.
- [x] Redactado plan de lanzamiento freemium v1.
- [x] Redactado plan semanal de ejecucion v1.
- [x] Cierre comercial v1 definido: 4,99 EUR/mes + 7 dias de prueba + Google Play Billing.
- [x] Definidos e implementados 3 puntos de aparicion de paywall.
- [x] Implementados eventos minimos: app_open, imc_completed, program_started, day_checkin_saved.
- [x] Implementado evento sync_error para fallos de sincronizacion.
- [x] Creado checklist Go/No-Go para decision de publicacion en Play Store.

## KPI diarios (seguimiento rapido)
- [ ] Activacion: imc_completed -> program_started
- [ ] Retencion: D1, D7
- [ ] Conversion premium
- [ ] Errores de sync

## Ritual diario recomendado (15 minutos)
1. Elegir 1-3 tareas de To Do y moverlas a Doing.
2. Ejecutar trabajo tecnico del dia.
3. Mover completadas a Done.
4. Revisar KPI diarios y anotar bloqueos.

## Arranque (2026-05-01)
- [x] Flujo IMC Premium ajustado: acceso desde texto clicable y opcion de continuar gratis.
- [x] Vista de informacion Premium separada del panel avanzado.
- [x] Definidos e implementados 3 puntos de aparicion de paywall en app.
- [x] Cerrar definicion comercial final de activacion Premium (copy, CTA y canal de alta).

## Actualizacion (2026-05-02)
- [x] Decision de alcance temporal: Android-only para v1; iOS aplazado hasta nueva decision.
- [x] Eliminada oferta premium temprana en la segunda pantalla de inicio para reducir friccion inicial.
- [x] Separacion visual aplicada entre CTA superior "Prueba Premium 7 dias gratis" y texto legal "Luego 4,99 EUR/mes...".
- [x] Especificacion funcional actualizada con estos ajustes UX en docs/especificacion-funcional-v1.md.
- [x] Validacion visual en web local (localhost):
	- Segunda pantalla sin tarjeta/oferta premium temprana.
	- Pantalla Premium con separacion clara entre el boton superior y el texto legal inmediatamente inferior.
- [x] Validacion UX Premium en Android real (dispositivo 62c7fd6e):
	- Segunda pantalla sin oferta premium temprana.
	- Pantalla Premium con CTA "Prueba Premium 7 dias gratis" separado del texto legal.
	- Boton inferior se mantiene como "No, seguire con publicidad".
- [x] Semana 2 (App) iniciada en codigo:
	- Persistencia local del plan `free/premium` en `dieta.userPlan`.
	- Activacion de plan Premium en flujo de consentimiento (modo simulacion actual).
	- Feature gate en Consejos: usuarios free no ven items premium y reciben CTA "Ver Premium".
- [x] Semana 2 (Backend + Sync) implementada en codigo:
	- API de plan por usuario: `GET /users/:id/plan` y `PUT /users/:id/plan`.
	- Sincronizacion de plan app-backend con hidratacion inicial por `userId` y fallback local.
	- Esquema SQL actualizado con `user_plan` y `plan_updated_at`.
- [x] Semana 2 (QA) validada en web local:
	- Escenario premium: hidratacion de plan desde backend confirmada (`userPlan` pasa de `free` local a `premium` remoto tras recarga).
	- Escenario free: se mantiene bloqueo de consejos premium y CTA "Ver Premium" visible.
	- Escenario sin red: backend detenido, app operativa y plan local `free` conservado sin bloqueo de uso.
