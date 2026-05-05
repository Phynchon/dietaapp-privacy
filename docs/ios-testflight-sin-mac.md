# iOS sin Mac local: Build cloud + TestFlight

## Objetivo
Instalar DietaApp en iPhone sin tener un Mac local, usando compilacion en la nube y distribucion con TestFlight.

## Requisitos
- Cuenta Apple Developer activa.
- Acceso a App Store Connect.
- Repositorio del proyecto en GitHub (o Git provider compatible).
- iPhone con app TestFlight instalada.

## Opcion recomendada
Usar Codemagic para compilar IPA en entorno macOS cloud y subir a App Store Connect.

Archivo base ya incluido en este repo:
- `codemagic.yaml`

Checklist detallado (clic por clic):
- `docs/codemagic-testflight-checklist.md`

## Paso 1. Preparar identificadores Apple
En Apple Developer:
1. Crear App ID: `com.dietaapp`.
2. Crear certificado iOS Distribution (o usar gestion automatica del proveedor cloud).
3. Crear perfil de aprovisionamiento para App Store.

En App Store Connect:
1. Crear la app nueva con Bundle ID `com.dietaapp`.
2. Definir nombre, idioma y SKU.

## Paso 2. Subir proyecto a Git
1. Confirma que el repo contiene carpeta iOS y sync reciente.
2. Empuja cambios a la rama principal.

Comandos usados en este proyecto:
1. `npm run mobile:ios:sync`
2. Verifica que `ios/App/App.xcworkspace` existe en el repo.

## Paso 3. Configurar workflow en Codemagic
1. Conectar repositorio.
2. Crear workflow iOS desde `codemagic.yaml` (workflow: `ios-testflight`).
3. Build machine: macOS.
4. Build trigger: manual (o push a rama principal).

Grupo de variables requerido en Codemagic:
1. Crear grupo `app_store_credentials`.
2. Configurar integracion App Store Connect en Codemagic (API Key).
3. Cargar certificados/perfiles de firma si no usas firma automatica gestionada.

Build steps minimos:
1. Instalar dependencias: `npm ci`
2. Build web + sync iOS: `npm run mobile:ios:sync`
3. Build IPA (App Store export).

## Paso 4. Conectar App Store Connect API Key
En App Store Connect:
1. Users and Access > Integrations > App Store Connect API.
2. Crear API Key (Issuer ID, Key ID, .p8).

En Codemagic:
1. Cargar Key ID, Issuer ID y archivo .p8.
2. Activar subida automatica a TestFlight.

## Paso 5. Lanzar build
1. Ejecutar workflow.
2. Esperar IPA y subida a App Store Connect.
3. Revisar processing build en TestFlight.

Nota:
- En `codemagic.yaml`, cambia el email de notificacion (`CHANGE_ME@example.com`).

## Paso 6. Instalar en iPhone
1. En App Store Connect, habilitar grupo Internal Testing.
2. Añadir tu Apple ID como tester interno.
3. Abrir TestFlight en iPhone.
4. Instalar build.

## Errores comunes
- Bundle ID no coincide: revisar `appId` en `capacitor.config.json` y app en App Store Connect.
- Firma invalida: revisar certificado y provisioning profile.
- Build no aparece en TestFlight: esperar processing (puede tardar 10-30 min).

## Alternativa temporal (sin IPA)
Si quieres probar ya mismo en iPhone sin TestFlight:
1. Publica la web.
2. Abre en Safari.
3. Compartir > Anadir a pantalla de inicio.

Esto instala la PWA, no la app nativa iOS.
