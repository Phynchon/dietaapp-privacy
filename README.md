# Dieta App

Aplicación React + Vite con un shell PWA listo para un menú diario, lista de ingredientes y preferencias de comidas.

## Comandos

- `npm run dev` - Inicia el servidor de desarrollo (normalmente en http://localhost:5173)
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter
- `npm run clean` - Limpia dist y caché de Vite
- `npm run clean:cache` - Limpia solo la caché de Vite
- `npm run mobile:ios:sync` - Genera build web y sincroniza proyecto iOS de Capacitor
- `npm run mobile:ios:open` - Abre el proyecto iOS en Xcode (solo macOS)
- `npm run mobile:ios` - Ejecuta sync + open para iOS


## Entornos (Dev y Produccion)

Frontend (Vite):
- Desarrollo: `.env.development` (usa `VITE_API_BASE_URL=http://localhost:4000`)
- Produccion: `.env.production` (usa el backend publico)
- `.env` queda solo para valores comunes (por ejemplo timeout)

Backend (Express):
- Desarrollo: `backend/.env.development`
- Produccion: `backend/.env.production`
- `backend/.env` se mantiene como fallback para variables no definidas

Nota:
- Si compilas Android (`npm run build` + sync de Capacitor), la URL de API queda embebida en el bundle segun el modo de build. Para produccion, revisa siempre `.env.production` antes de generar APK/AAB.

## Iniciar el Servidor

```bash
npm run dev
```

Si quieres evitar cache agresiva durante pruebas y desactivar el service worker automaticamente:

```bash
npm run dev:nocache
```

El servidor se abrirá automáticamente en tu navegador en `http://localhost:4173`.
Esta app usa `strictPort: true`, así que si el puerto 4173 está ocupado el arranque fallará hasta que lo liberes.

## Detener el Servidor

Para detener el servidor de desarrollo, presiona `Ctrl + C` en la terminal donde está corriendo.

**Importante:** Siempre detén el servidor correctamente antes de cerrar la terminal para evitar que los puertos queden ocupados.

## Solución de Problemas

### Modo automático sin caché

Para no borrar cache manualmente cada vez, usa estos comandos:

```bash
# Desarrollo sin cache HTTP + sin service worker
npm run dev:nocache

# Preview sin cache HTTP + sin service worker (en 4173)
npm run preview:nocache
```

Esto activa el modo `nocache`, que:
- desactiva/desregistra el service worker,
- aplica cabeceras `Cache-Control: no-store` en Vite.

### La página no carga o muestra contenido antiguo

1. **Detén todos los servidores activos:**
   - Presiona `Ctrl + C` en todas las terminales con servidores corriendo
   
2. **Limpia el caché del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Application" → "Storage"
   - Click en "Clear site data"
   - O simplemente presiona `Ctrl + Shift + Delete` y limpia caché

3. **Limpia el caché de Vite:**
   ```bash
   npm run clean:cache
   ```

4. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

### Puerto ocupado

Si ves un error de que el puerto está ocupado:

```bash
# Verificar qué proceso usa el puerto 4173
netstat -ano | findstr :4173

# Matar el proceso (reemplaza PID con el número del proceso)
taskkill /PID <PID> /F
```

También puedes ejecutar `clean-ports.ps1` para liberar procesos de Node y puertos usados por la app.

### El service worker causa problemas

En modo desarrollo, el service worker se desactiva automáticamente para evitar problemas de caché. Solo se activa en producción (después de `npm run build`).

Para desregistrar manualmente el service worker:
1. Abre DevTools (F12)
2. Ve a Application → Service Workers
3. Click en "Unregister"

## Notas

- Las preferencias se guardan en `localStorage`
- El service worker **NO** se activa en modo desarrollo para evitar problemas de caché
- El service worker se registra solo en producción usando `public/sw.js`
- El servidor se configura para abrir automáticamente el navegador

## Version iOS (Capacitor)

Estado actual del proyecto:
- Plataforma iOS de Capacitor presente y sincronizada.
- Assets web copiados en `ios/App/App/public`.

Flujo recomendado (en macOS):
1. Ejecutar `npm run mobile:ios:sync`.
2. Ejecutar `npm run mobile:ios:open`.
3. En Xcode, seleccionar un simulador o dispositivo real.
4. Ejecutar Build/Run.

Notas importantes:
- Desde Windows puedes dejar el proyecto iOS preparado y sincronizado, pero la compilacion y firma final requieren Xcode en macOS.
- Si cambias variables de entorno de frontend, repite `npm run mobile:ios:sync` antes de compilar en Xcode.

## Documentacion de Producto

- Especificacion funcional v1: `docs/especificacion-funcional-v1.md`
- Historias de usuario y criterios de aceptacion: `docs/historias-usuario-y-criterios.md`
- Modelo de datos inicial (local y MySQL): `docs/modelo-datos-local-mysql-v1.md`
- Guia iOS sin Mac local (build cloud + TestFlight): `docs/ios-testflight-sin-mac.md`
- Plan rapido beta interna Android (semana actual): `docs/plan-beta-interna-android-semana.md`
