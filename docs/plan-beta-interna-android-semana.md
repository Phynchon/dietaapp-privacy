# Plan rapido: Beta interna Android (esta semana)

## Objetivo
Publicar una beta interna en Google Play y validar estabilidad minima antes de ampliar rollout.

## Tarea 1: Generar y subir AAB a Internal Testing
- [ ] Confirmar versionCode/versionName de Android antes de compilar.
- [ ] Generar AAB release firmado.
- [ ] Subir AAB a pista Internal Testing en Play Console.

Comandos base:
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

Resultado esperado:
- AAB generado en `android/app/build/outputs/bundle/release/`.
- Build visible en Internal Testing.

## Tarea 2: Smoke test en Android real (2 testers)
- [ ] Instalar build desde Internal Testing.
- [ ] Validar flujo minimo: IMC -> inicio -> check-in diario.
- [ ] Validar paywall actual y restauracion simulada de premium.
- [ ] Confirmar guardado en MySQL (`users`, `program_cycles`, `daily_checkins`).

Resultado esperado:
- Sin bloqueos P0/P1 en alta, navegacion y guardado.

## Tarea 3: Cierre Go/No-Go Android interno
- [ ] Completar `docs/go-no-go-playstore-v1.md` (bloques A y D minimo).
- [ ] Registrar incidencias y decision del dia.
- [ ] Definir accion siguiente: repetir beta o avanzar a Closed Testing.

Resultado esperado:
- Decision documentada y siguiente paso acordado.

## Definicion de hecho (DoD)
- Build en Internal Testing disponible.
- Smoke test ejecutado por 2 personas/dispositivos.
- Decision Go/No-Go interna registrada.
