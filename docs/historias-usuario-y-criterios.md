# Historias de Usuario y Criterios de Aceptacion - v1

## HU-01 Bienvenida y acceso al flujo
Como usuario, quiero abrir la app y pulsar Vamos alla para iniciar el proceso.

Criterios de aceptacion:
- Dado que entro en la app, cuando veo la bienvenida, entonces existe accion visible Vamos alla.
- Dado que pulso Vamos alla, entonces avanzo a la pantalla de IMC.

## HU-02 Decision tras ver IMC
Como usuario, quiero elegir seguir, cerrar por ahora o abandonar, para decidir mi compromiso.

Criterios de aceptacion:
- Dado que estoy en pantalla IMC, cuando selecciono una opcion, entonces se muestra el pop-up correspondiente.
- Dado que elijo cerrar por ahora, entonces puedo volver al menu o cambiar nivel.
- Dado que elijo abandonar, entonces vuelvo a inicio tras confirmar el mensaje.

## HU-03 Mensaje de reflexion
Como usuario indeciso, quiero recibir un mensaje de apoyo para no abandonar por impulso.

Criterios de aceptacion:
- Dado que elijo opcion 2.a o 2.b, entonces se muestra el texto de reflexion definido por negocio.
- Dado que cierro el pop-up, entonces no se inicia automaticamente el programa.

## HU-04 Mensaje de abandono
Como usuario que decide salir, quiero cerrar el flujo con un mensaje amable.

Criterios de aceptacion:
- Dado que elijo opcion 3, entonces se muestra el texto de despedida exacto aprobado.
- Dado que confirmo, entonces termino el flujo sin crear programa activo.

## HU-05 Compromiso al iniciar reto
Como usuario motivado, quiero ver un mensaje de compromiso antes de comenzar.

Criterios de aceptacion:
- Dado que elijo seguir (1.a, 1.b, 1.c), entonces se muestra el pop-up motivacional.
- Dado que acepto continuar, entonces paso al bloque Antes de empezar.

## HU-06 Educacion previa en pasos cortos
Como usuario, quiero leer recomendaciones practicas en pantallas breves para entender como sostener el cambio.

Criterios de aceptacion:
- El bloque educativo se divide en 3 pantallas maximo.
- Cada pantalla tiene boton Siguiente y boton Salir.
- La ultima pantalla finaliza con pregunta Seguimos? y acciones Si/No.

## HU-07 Seleccion de fecha de inicio
Como usuario, quiero elegir cuando empezar para adaptarlo a mi situacion.

Criterios de aceptacion:
- Dado que confirmo seguir, entonces la app ofrece hoy, manana o +1 a +7 dias.
- Dado que elijo una fecha valida, entonces queda guardada como fecha oficial de inicio.
- Dado que confirmo fecha, entonces se muestra aviso de recordatorio el dia anterior.

## HU-08 Ficha de usuario
Como usuario, quiero registrar mis datos basicos para personalizar el programa.

Criterios de aceptacion:
- Alias, altura y peso son obligatorios.
- IMC se calcula automaticamente con altura y peso.
- Si no concedo permisos de avisos, el flujo sigue en modo manual.

## HU-09 Seguimiento diario de hitos
Como usuario, quiero marcar mis comidas y resultados diarios para medir adherencia.

Criterios de aceptacion:
- Existen hitos de desayuno, almuerzo, comida, merienda y cena.
- Se puede guardar total calorias y observaciones.
- Ayunos es opcional.

## HU-10 Carga en bloque al final del dia
Como usuario sin avisos, quiero completar el dia de una vez para evitar interrupciones.

Criterios de aceptacion:
- Puedo completar hitos en una sola accion al final del dia.
- El sistema marca la fecha de carga y la fecha real del dia reportado.

## HU-11 Continuidad por 56 dias
Como usuario, quiero mantener una progresion clara para completar el reto.

Criterios de aceptacion:
- Se registra dia 1 a dia 56 sin saltos de identificador.
- El estado del programa cambia a completed al finalizar el dia 56.

## HU-12 Cambio de dieta sin perdida de historial
Como usuario, quiero cambiar de dieta sin perder mis datos anteriores.

Criterios de aceptacion:
- Dado que cambio de dieta, entonces se conserva historial previo.
- Se registra fecha de cambio y dietas implicadas.
- El contador de progresion continua por defecto.

## HU-13 Notificaciones de inicio y comidas
Como usuario con permisos, quiero recibir avisos utiles en momentos clave.

Criterios de aceptacion:
- Se envia aviso 24h antes del inicio.
- Se generan avisos segun horarios configurados.
- Si permisos son denegados, se informa estado no activo y alternativa manual.

## HU-14 Proteccion de datos y control del usuario
Como usuario, quiero saber y controlar como se usan mis datos.

Criterios de aceptacion:
- Existe consentimiento explicito para datos personales.
- Existe accion para borrar datos locales del perfil.
- La app muestra politica de privacidad accesible.
