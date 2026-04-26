# Dieta App

Aplicación React + Vite con un shell PWA listo para un menú diario, lista de ingredientes y preferencias de comidas.

## Comandos

- `npm run dev` - Inicia el servidor de desarrollo (normalmente en http://localhost:5173)
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter
- `npm run clean` - Limpia dist y caché de Vite
- `npm run clean:cache` - Limpia solo la caché de Vite


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

El servidor se abrirá automáticamente en tu navegador en `http://localhost:4173`.
Esta app usa `strictPort: true`, así que si el puerto 4173 está ocupado el arranque fallará hasta que lo liberes.

## Detener el Servidor

Para detener el servidor de desarrollo, presiona `Ctrl + C` en la terminal donde está corriendo.

**Importante:** Siempre detén el servidor correctamente antes de cerrar la terminal para evitar que los puertos queden ocupados.

## Solución de Problemas

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

## Documentacion de Producto

- Especificacion funcional v1: `docs/especificacion-funcional-v1.md`
- Historias de usuario y criterios de aceptacion: `docs/historias-usuario-y-criterios.md`
- Modelo de datos inicial (local y MySQL): `docs/modelo-datos-local-mysql-v1.md`
