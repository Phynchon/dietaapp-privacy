# Plan Semanal de Ejecucion v1 - Dieta App

## Objetivo
Pasar de estado actual a lanzamiento controlado con modelo freemium, seguimiento estable en movil y base para monetizacion.

Nota de alcance (2026-05-02):
- Prioridad temporal Android-only para v1.
- iOS queda aplazado hasta nueva decision por requisitos de Apple Developer.

## Semana 1 - Estabilidad y base de medicion

### Producto
- [x] Cerrar alcance exacto de Gratis vs Premium (sin cambios durante 2 semanas).
- [x] Definir 3 pantallas donde aparecera el paywall (sin activarlo aun).
  - Punto 1 (IMC modal): al llegar al bloque de compromiso, el texto destacado Premium es clicable y abre informacion Premium.
  - Punto 2 (Home): entrada no intrusiva a informacion Premium, sin oferta temprana en la segunda pantalla.
  - Punto 3 (Navegacion Links): usuarios free ven pantalla informativa Premium en lugar del panel avanzado.
  - Decision comercial cerrada: 4,99 EUR/mes, prueba de 7 dias, canal Google Play Billing, CTA principal y legal definidos.

Nota de ajuste UX (2026-05-02):
- Se retira la tarjeta/oferta Premium temprana en Home para reducir friccion inicial.
- La pantalla Premium mantiene su funcion informativa con CTA principal y opcion clara de continuar con publicidad.

### App (Frontend/Movil)
- [ ] Revisar que el flujo IMC -> inicio de programa -> check-in diario funciona de punta a punta.
- [ ] Validar que alias, edad y datos de perfil se guardan correctamente tras reinstalar app.
- [ ] Congelar textos v1 de onboarding y mensajes principales.

### Backend
- [ ] Verificar que los endpoints de /users, /programs y /daily-checkins quedan registrados en MySQL sin errores.
- [ ] Confirmar CORS estable para Android segun configuracion actual de Capacitor.
- [ ] Añadir logging de errores con timestamp y ruta para diagnostico rapido.

### Analitica
- [x] Implementar eventos minimos: app_open, imc_completed, program_started, day_checkin_saved.
- [x] Registrar tambien intentos fallidos de sync (sync_error).

### Entregable de semana
- Flujo principal estable y medible en dispositivo Android real.

## Semana 2 - Cuentas y acceso por plan

### Producto
- [ ] Definir reglas finales de acceso:
  - Gratis: contenido base y uso limitado.
  - Premium: tracking completo, estadisticas y sin anuncios.

### App
- [x] Crear estado de plan del usuario (free/premium) en capa de datos.
- [x] Aplicar bloqueos de funciones premium en UI (feature gates).
- [x] Diseñar pantalla de paywall simple (sin pasarela real todavia).

### Backend
- [x] Extender modelo de usuario con campos de plan y estado de suscripcion.
- [x] Exponer endpoint de perfil de cuenta para leer plan actual.

### QA
- [x] Probar escenarios: usuario free, usuario premium, usuario sin red.
- [x] Verificar que no hay perdida de datos al cambiar de plan.

### Entregable de semana
- Sistema de planes visible y funcional en modo simulacion.

## Semana 3 - Monetizacion inicial y cumplimiento

### Producto
- [x] Elegir solo un metodo de cobro v1 (suscripcion mensual).
- [x] Definir precio inicial, prueba (si aplica) y mensaje comercial corto.

### App
- [ ] Integrar compra in-app Android (Google Play Billing) en entorno de pruebas.
- [ ] Activar desbloqueo premium tras compra validada.
- [ ] Manejar restauracion de compra y estado offline temporal (Android).

### Backend
- [ ] Registrar estado premium y fechas clave de suscripcion.
- [ ] Preparar proceso de renovacion/cancelacion segun plataforma.

### Legal
- [ ] Revisar politica de privacidad, terminos y disclaimer de salud.
- [ ] Confirmar textos de consentimiento de datos personales y de salud.

### Entregable de semana
- Premium operativo en entorno de pruebas con flujo de compra completo.

## Semana 4 - Lanzamiento controlado

### Operacion
- [ ] Publicar version cerrada (beta interna o grupo reducido).
- [ ] Monitorizar errores criticos, latencia API y exito de registros.
- [ ] Ejecutar checklist de deploy antes de cada build.

### KPI a revisar diariamente
- [ ] Activacion: imc_completed -> program_started.
- [ ] Retencion inicial: D1 y D7.
- [ ] Conversion a premium.
- [ ] Fallos de sync movil-backend.

### Ajustes rapidos
- [ ] Corregir bloqueos de alta, login o guardado diario en menos de 24h.
- [ ] Ajustar paywall si conversion es baja.

### Entregable de semana
- Lanzamiento v1 en produccion con monitorizacion y protocolo de respuesta.

## Criterios de exito del mes 1
- [ ] Registro y check-in diario estables en Android.
- [ ] Sin perdida de datos en MySQL.
- [ ] Embudo de eventos visible para tomar decisiones.
- [ ] Primeras conversiones premium (aunque sean pocas).

## Lista de riesgos y mitigacion
- Riesgo: vuelve a fallar CORS en movil.
  - Mitigacion: validar origen Android y ejecutar preflight antes de cada release.
- Riesgo: errores silenciosos de sync.
  - Mitigacion: mantener logs en app y backend, con alertas basicas.
- Riesgo: complejidad de pago demasiado pronto.
  - Mitigacion: mantener una sola modalidad de cobro en v1.

## Orden recomendado de ejecucion (resumen)
1. Estabilidad tecnica y medicion.
2. Planes y bloqueos funcionales.
3. Cobro premium.
4. Lanzamiento controlado y mejora continua.
