# Go No-Go Play Store v1 - Dieta App

## Objetivo
Tomar decision de publicacion en 5 minutos con criterios claros.

## Alcance actual
- Este documento aplica a lanzamiento Android (Google Play).
- iOS queda fuera de alcance temporal en v1 por requisitos de Apple Developer.

## Como usar (orden recomendado)
1. Validar checklist tecnico de deploy.
2. Marcar cada bloque de este documento.
3. Tomar decision segun regla final (GO / NO-GO).

## Bloque A - Tecnico (obligatorio)
- [ ] Build release OK (AAB y APK generados sin errores).
- [ ] Instalacion release en Android real OK.
- [ ] Flujo minimo estable: IMC -> inicio -> check-in diario.
- [ ] Sync backend OK (alta usuario + check-in guardan en MySQL).
- [ ] Sin errores criticos bloqueantes en pruebas del dia.
- [ ] Crash-free estimado mayor o igual a 99% en testers.

## Bloque B - Producto y monetizacion (obligatorio)
- [ ] 3 puntos de aparicion de paywall validados en app.
- [ ] Flujo gratis sigue disponible sin bloqueo accidental.
- [ ] Copy comercial final aplicado (4,99 EUR/mes + 7 dias trial).
- [ ] Canal definido para cobro: Google Play Billing.
- [ ] Si Billing real no esta activo, no publicar a produccion.

## Bloque C - Legal y tienda (obligatorio)
- [ ] Politica de privacidad accesible y actualizada.
- [ ] Textos legales de oferta y suscripcion revisados.
- [ ] Ficha Play Store completa (descripcion, capturas, icono, categoria).
- [ ] Clasificacion de contenido y formulario de datos completados.
- [ ] Correo de soporte y URL de contacto verificados.

## Bloque D - Operacion de lanzamiento (recomendado)
- [ ] Release subida a Internal Testing.
- [ ] Feedback de testers revisado por al menos 48h.
- [ ] Sin incidencias P0/P1 abiertas.
- [ ] Plan de rollout gradual definido (10% -> 50% -> 100%).

## Regla de decision
- GO: Todos los checks de A, B y C completados, y D sin bloqueos graves.
- NO-GO: Falta al menos 1 check de A, B o C; o existe incidencia P0/P1 abierta.

## Plan de salida recomendado
1. Internal Testing hoy.
2. Closed Testing en 3-7 dias.
3. Produccion con 10-20% cuando no haya bloqueos.
4. Escalar a 50% y 100% en 48-72h si no hay regresiones.

## Registro de decision
- Fecha: 2026-05-01
- Responsable: Equipo Dieta App
- Decision final: NO-GO (provisional)
- Motivo principal: Pendiente activar y validar Google Play Billing real en entorno de pruebas y completar checklist de Play Console.
- Riesgos aceptados: Se pospone salida a produccion para evitar publicar sin monetizacion validada extremo a extremo.

## Estado actual (2026-05-01)

### Bloque A - Tecnico
- [x] Build release OK (AAB y APK generados sin errores).
- [x] Instalacion release en Android real OK.
- [x] Flujo minimo estable: IMC -> inicio -> check-in diario.
- [x] Sync backend OK (alta usuario + check-in guardan en MySQL).
- [ ] Sin errores criticos bloqueantes en pruebas del dia.
- [ ] Crash-free estimado mayor o igual a 99% en testers.

### Bloque B - Producto y monetizacion
- [x] 3 puntos de aparicion de paywall validados en app.
- [x] Flujo gratis sigue disponible sin bloqueo accidental.
- [x] Copy comercial final aplicado (4,99 EUR/mes + 7 dias trial).
- [x] Canal definido para cobro: Google Play Billing.
- [x] Si Billing real no esta activo, no publicar a produccion.

### Bloque C - Legal y tienda
- [ ] Politica de privacidad accesible y actualizada.
- [ ] Textos legales de oferta y suscripcion revisados.
- [ ] Ficha Play Store completa (descripcion, capturas, icono, categoria).
- [ ] Clasificacion de contenido y formulario de datos completados.
- [ ] Correo de soporte y URL de contacto verificados.

### Bloque D - Operacion de lanzamiento
- [ ] Release subida a Internal Testing.
- [ ] Feedback de testers revisado por al menos 48h.
- [ ] Sin incidencias P0/P1 abiertas.
- [ ] Plan de rollout gradual definido (10% -> 50% -> 100%).

## Evidencia tecnica de sincronizacion (2026-05-01)
- Alias validado: Maite
- users.id: 84b39d6b-0a8c-4fbb-8e6f-7eba885922cb
- users.created_at: 2026-04-27T09:57:42.000Z
- program_cycles.id: 4b26f105-90b5-46f4-a531-0241a5092eb9
- program_cycles.user_id: 84b39d6b-0a8c-4fbb-8e6f-7eba885922cb
- program_cycles.diet_level: 1800
- daily_checkins: 2 registros
- checkin 1: day_number=1, recorded_at=2026-04-27T09:57:46.000Z
- checkin 2: day_number=2, recorded_at=2026-04-28T07:48:38.000Z

## Evidencia UX Premium (2026-05-02)
- Entorno validado: web local (Vite dev, http://localhost:4173/).
- Resultado 1: en la segunda pantalla (home) no aparece oferta premium temprana.
- Resultado 2: en pantalla Premium, el boton "Prueba Premium 7 dias gratis" aparece visualmente separado del texto legal "Luego 4,99 EUR/mes...".
- Verificacion Android real (dispositivo 62c7fd6e): OK.
- Metodo de evidencia Android: despliegue con `npx cap run android` + captura de jerarquia UI (`adb uiautomator dump`).
- Evidencia Android capturada en:
	- android/window_dump_after_enter.xml
	- android/window_dump_premium.xml
