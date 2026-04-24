# Especificacion Funcional v1 - Dieta App

## 1. Objetivo
Definir la primera version funcional del flujo de inicio de programa, seguimiento diario y continuidad de progreso en Dieta App.

## 2. Alcance de v1
Incluye:
- Onboarding con decision del usuario tras ver su IMC.
- Inicio de reto hoy, manana o fecha futura dentro de 1 a 7 dias.
- Mensajeria motivacional contextual (pop-up por decision).
- Alta de ficha de usuario.
- Seguimiento diario de hitos y calorias durante 56 dias.
- Soporte de cambio de dieta sin perder progreso.
- Persistencia local de datos.

No incluye en v1:
- Backend de consultas en tiempo real.
- Panel de control administrativo.
- Integraciones medicas externas.

## 3. Flujo principal (pantalla a pantalla)
### 3.1 Bienvenida
- El usuario abre la app.
- Lee texto inicial y pulsa Vamos alla.

### 3.2 IMC y decision
- La app muestra calculo de IMC y nivel sugerido.
- El usuario elige:
  - Seguir la dieta.
  - Cerrar por ahora.
  - Abandonar.

### 3.3 Comportamiento por decision
#### Caso 2.a y 2.b (Cerrar por ahora)
Mostrar pop-up:
De acuerdo. Puedes pensarlo un poco mas. Tambien puedes cambiar de nivel si te es mas comodo. Y puedes probar para ver hasta donde llegas.

Acciones:
- Boton principal: Volver al menu principal.
- Boton secundario: Cambiar nivel ahora.

#### Caso 3 (Abandonar)
Mostrar pop-up:
Gracias por visitarme. Te estare esperando en el mismo sitio.

Accion:
- Cerrar flujo y volver a pantalla inicial.

#### Caso 1.a, 1.b y 1.c (Seguir)
Mostrar pop-up de compromiso:
Muy bien. Vas a comenzar un reto importante. Seguro que puedes hacerlo. Intenta ajustarte a la dieta lo mas posible (puedes cambiar ingredientes con la tabla adjunta) y piensa que es para siempre. Mira los consejos y pide ayuda cuando la necesites.

Luego mostrar bloque Antes de empezar, dividido en 3 pantallas cortas:
1. Objetivos sostenibles y deficit moderado.
2. Estructura de comidas y enfoque en saciedad.
3. Factores de exito (sueno, estres, caminar, continuidad).

Cierre del bloque:
- Pregunta final: Seguimos?
- Botones: Si / No.

## 4. Inicio de programa
Si el usuario pulsa Si:
1. La app propone fecha de comienzo:
   - Hoy.
   - Manana.
   - Otro dia (selector: +1 a +7 dias).
2. Confirmada la fecha, mostrar:
   - Fecha fijada.
   - Mensaje: No te preocupes, yo te avisare el dia anterior.
3. Crear ficha de usuario.

## 5. Ficha de usuario (v1)
Campos:
- Alias.
- Pais.
- Edad.
- Genero.
- Altura.
- Peso.
- IMC.
- Permiso para alertas de horario de comidas.
- Horarios personales de comida (si aplica).

Validaciones minimas:
- Alias obligatorio.
- Altura y peso obligatorios para IMC.
- Edad minima 18 (configurable).
- Si no hay permiso de alertas, el sistema activa modo seguimiento manual.

## 6. Seguimiento diario (56 dias)
Para cada dia del ciclo:
- Dia y hora de inicio.
- Ayunos (opcional, puede quedar vacio).
- Hitos diarios: desayuno, almuerzo, comida, merienda, cena.
- Total calorias del dia.
- Calorias consumidas y ahorradas (estimacion respecto al objetivo).
- Observaciones.

Regla de uso sin avisos:
- El usuario puede completar hitos al final del dia en un solo bloque.
- Se permite completar de forma retroactiva al dia siguiente (ventana configurable).

## 7. Cambio de dieta sin perder progreso
- Si el usuario cambia de dieta/nivel, se conserva historial previo.
- Se registra evento de cambio con fecha, dieta origen y dieta destino.
- La progresion de 56 dias continua por defecto.
- Opcion configurable futura: reiniciar contador de 56 dias.

## 8. Reglas de notificaciones (v1)
- Aviso de preparacion: 24 horas antes de la fecha de inicio.
- Avisos de comidas segun horarios definidos por usuario.
- Si no hay permisos:
  - Mostrar estado No activo.
  - Recordar que puede habilitar avisos desde ajustes.

## 9. Estados y persistencia
Estados minimos del programa:
- pending_start: fecha fijada aun no iniciada.
- active: programa en curso.
- paused: interrupcion temporal.
- completed: ciclo de 56 dias finalizado.
- dropped: abandono voluntario.

Persistencia v1:
- Local (storage del dispositivo).
- Sincronizacion remota fuera de alcance v1.

## 10. Criterios de calidad funcional
- El flujo principal puede completarse sin bloqueos en movil.
- Todos los pop-ups se muestran en el caso correcto.
- Fecha de inicio queda guardada de forma consistente.
- Seguimiento diario permite guardar sin avisos activados.
- Cambio de dieta no elimina datos historicos.
