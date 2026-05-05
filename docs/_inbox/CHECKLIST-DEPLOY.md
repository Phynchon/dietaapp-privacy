# Checklist Deploy Movil + MySQL

## 1) API publica y base de datos

- [x] Abrir https://api.lalecturainfinita.es/health
- [x] Confirmar respuesta: {"ok":true,"db":"up"}

## 2) URL de backend en build de produccion

- [x] Revisar [/.env.production](.env.production)
- [x] Confirmar que VITE_API_BASE_URL apunta a: https://api.lalecturainfinita.es

## 3) Esquema de Android (Capacitor)

- [x] Revisar [capacitor.config.json](capacitor.config.json)
- [x] Confirmar androidScheme = "http" (si CORS permite http://localhost)

## 4) CORS en backend (Hostinger)

- [x] Confirmar CORS_ORIGIN con al menos:
  - http://localhost:4173
  - http://localhost
  - capacitor://localhost
- [x] Si androidScheme = "https", agregar tambien:
  - https://localhost

## 5) Build y despliegue Android

- [x] Ejecutar: npm run build
- [x] Ejecutar: npx cap sync android
- [x] Ejecutar: npx cap run android

## 6) Prueba funcional minima en movil

- [x] Crear usuario nuevo en la app
- [x] Guardar check-in diario
- [x] Verificar registros en MySQL (users, program_cycles, daily_checkins)

Evidencia (2026-05-01):
- Alias: Maite
- users.id: 84b39d6b-0a8c-4fbb-8e6f-7eba885922cb
- program_cycles.id: 4b26f105-90b5-46f4-a531-0241a5092eb9
- daily_checkins: 2 registros (day_number 1 y 2)

## 7) Diagnostico rapido si no guarda

- [ ] Revisar logs de la app (console/logcat)
- [ ] Buscar mensajes:
  - Program start sync failed
  - Daily check-in sync failed
- [ ] Revisar codigo HTTP y detalle de error devuelto por backend

## 8) Validacion de datos

- [x] Confirmar alias y edad correctos en formulario
- [x] Confirmar IDs en BD con formato UUID (36 caracteres)

## 9) Regla de oro para evitar regresiones

- [ ] No cambiar androidScheme ni CORS sin probar de nuevo el alta de usuario desde movil
- [ ] Antes de publicar APK, repetir este checklist completo
