# Checklist clic por clic: Codemagic + TestFlight (sin Mac local)

Estado: PAUSADO temporalmente (2026-05-02)
- Motivo: prioridad de lanzamiento Android-only.
- Reanudar este checklist cuando se reactive alcance iOS.

## Resultado esperado
Al terminar este checklist tendras una build instalada en tu iPhone desde TestFlight.

## 0) Pre-check rapido (2 minutos)
1. Verifica que el repositorio tiene estos archivos:
- codemagic.yaml
- ios/App/App.xcworkspace
2. Verifica Bundle ID del proyecto:
- com.dietaapp
3. Haz push de la rama principal (main).

## 1) Apple Developer: App ID
1. Entra a Apple Developer > Certificates, Identifiers and Profiles.
2. Ve a Identifiers > +.
3. Elige App IDs > App.
4. Description: DietaApp.
5. Bundle ID: com.dietaapp (Explicit).
6. Guarda.

## 2) App Store Connect: crear app
1. Entra a App Store Connect > My Apps.
2. Pulsa + > New App.
3. Platform: iOS.
4. Name: DietaApp.
5. Primary Language: Spanish (o la que prefieras).
6. Bundle ID: com.dietaapp.
7. SKU: dietaapp-ios-001 (o similar unico).
8. Create.

## 3) App Store Connect: API Key para Codemagic
1. App Store Connect > Users and Access > Integrations.
2. Pestaña App Store Connect API > +.
3. Name: codemagic-ci.
4. Access: Admin (o App Manager con permisos de build).
5. Descarga el archivo .p8 (guardalo bien, solo se descarga una vez).
6. Copia estos datos:
- Issuer ID
- Key ID
- Archivo .p8

## 4) Codemagic: conectar repo
1. Entra a Codemagic.
2. Add application.
3. Conecta tu proveedor Git (GitHub).
4. Selecciona el repo DietApp.
5. Elige configuracion por codemagic.yaml.
6. Asegura que aparece el workflow ios-testflight.

## 5) Codemagic: integrar App Store Connect
1. En Codemagic, abre Team settings > Integrations > App Store Connect.
2. Add integration.
3. Rellena:
- Issuer ID
- Key ID
- Sube el archivo .p8
4. Guarda la integracion.

## 6) Codemagic: crear grupo de variables
1. En Codemagic, abre Team settings > Environment variables.
2. Crea grupo nuevo llamado app_store_credentials.
3. Si tu flujo usa firma manual, agrega variables/certificados aqui.
4. Si usas firma automatica de Codemagic, deja este grupo solo para credenciales necesarias.

## 7) Codemagic: ajustar workflow
1. En el repo, edita codemagic.yaml.
2. Reemplaza CHANGE_ME@example.com por tu email real.
3. Confirma que la rama objetivo es main.
4. Haz commit y push.

## 8) Lanzar primera build
1. En Codemagic, abre tu app > workflow ios-testflight.
2. Pulsa Start new build.
3. Branch: main.
4. Espera a que termine en verde.

## 9) Verificar subida a TestFlight
1. Abre App Store Connect > My Apps > DietaApp > TestFlight.
2. Espera estado Processing.
3. Cuando termine, la build aparecera para testing interno.

## 10) Activar testing interno
1. App Store Connect > TestFlight > Internal Testing.
2. Crea o usa grupo interno.
3. Agrega tu Apple ID como tester.
4. Asigna la build al grupo.

## 11) Instalar en iPhone
1. Instala app TestFlight desde App Store.
2. Inicia sesion con tu Apple ID tester.
3. Abre TestFlight y selecciona DietaApp.
4. Pulsa Install.

## 12) Si algo falla
- Build falla en signing:
1. Revisa App ID y Bundle ID (deben coincidir).
2. Revisa permisos de la API Key en App Store Connect.
3. Revisa certificados/perfiles de aprovisionamiento.

- Build no aparece en TestFlight:
1. Espera 10-30 min de processing.
2. Revisa en Codemagic si realmente subio a App Store Connect.

- Error de metadata inicial en App Store Connect:
1. Completa datos minimos de la app (categoria, privacidad, etc.) y reintenta.

## Valores concretos de este proyecto
- Bundle ID: com.dietaapp
- Workspace iOS: ios/App/App.xcworkspace
- Scheme iOS: App
- Workflow: ios-testflight
