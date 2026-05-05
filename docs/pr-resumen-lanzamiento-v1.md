# PR - Lanzamiento v1 (Resumen)

## Titulo sugerido
Lanzamiento v1: mejoras app, backend tracking, mobile pipeline y documentacion operativa

## Descripcion corta
Este PR consolida mejoras funcionales de la app (navegacion por dia de programa y ajustes de copy/fecha), evolucion de backend para tracking y admin, ajustes de configuracion mobile (Capacitor + Codemagic), y documentacion de ejecucion para despliegue y go/no-go.

## Descripcion completa
### 1) App (UX, flujo y textos)
- Navegacion alineada al dia de programa desde el popup de modo free.
- Cabecera y fecha del menu ajustadas al dia de programa.
- Eliminacion de mensajes de inicio no deseados en contexto de uso.
- Actualizacion de copy UI y textos localizados.

### 2) Datos e i18n
- Actualizacion de consejos y menus en ES/EN/FR/DE.
- Ajustes de cache de traduccion y consistencia de datos.

### 3) Backend y tracking
- Cambios en rutas admin/tracking.
- Actualizacion de scripts SQL de tracking.
- Nuevos scripts de soporte para migracion, seed, limpieza y pruebas de endpoints.

### 4) Mobile y pipeline
- Ajustes de configuracion nativa Android/iOS con Capacitor.
- Incorporacion de configuracion Codemagic para flujo de build/deploy.

### 5) Documentacion y orden de repo
- Nuevas guias/checklists de ejecucion y lanzamiento en docs.
- Limpieza de artefactos locales y orden de documentos sueltos.
- Reglas de ignore mejoradas para evitar ruido en el arbol de trabajo.

## Riesgos y mitigacion
- Riesgo: regresiones por volumen de cambios en app/i18n.
- Mitigacion: build de produccion validado y cambios separados en commits tematicos.

## Validacion realizada
- Build frontend en produccion ejecutado correctamente.
- Commits agrupados por dominio: cleanup, app, backend, mobile, docs.

## Commits incluidos
- f35263f chore(cleanup): tidy root docs and ignore temp local artifacts
- d96acbc feat(app): align program-day menu navigation and labels
- 425a603 feat(backend): add plan tracking updates and maintenance scripts
- 04a8210 feat(app): update UI copy, i18n menus, tracking sync and web config
- f638188 chore(mobile): update capacitor native project and codemagic config
- d47d0ac docs: add launch planning and deployment guidance
