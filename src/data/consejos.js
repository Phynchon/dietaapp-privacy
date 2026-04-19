const normalizeConsejoText = (text) =>
  text
    .replace(/\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\s(),.-]{2,}:)/g, '\n\n$1')
    .replace(/\s+(\d{1,2}[.-])/g, '\n$1')
    .replace(/\s{2,}/g, ' ')
    .trim()

export const consejos = [
  {
    id: 1,
    title: '1. Ir a la compra',
    text: 'PLANIFICAR: Debes planificar los menús con antelación para saber lo que hay que comprar. El orden es fundamental en la alimentación. La planificación nos ayudará ha hacer una dieta variada y mas saludable. LISTA DE COMPRA: Hacer siempre la lista de compra antes de salir de casa. Compre alimentos de temporada. Con ello se evitan compras innecesarias, se ahorra en dinero, no se tiran alimentos y no se come demás COMPRAR DESPUES DE HABER COMIDO: No ir a la compra con hambre. Ir siempre después de comer. Si vas con hambre comprarás alimentos calóricos que NO necesitas o que no debes tomar. NO COMPRE DE MAS: Comprar sólo lo necesario para cada día. Si compra en exceso comerá en exceso. Ayuda a no tener alimentos en casa que nos incitan al picoteo. NO ALMACENE: No almacenar comida en casa, sobre todo alimentos fáciles de comer (chocolates, fritos de bolsa, frutos secos, bollería industrial, etc. ) COCINE TODO DE UNA VEZ, y congele en raciones pequeñas lo que no se vaya a consumir. Es una forma de mantener la seguridad alimentaria y tener orden en las comidas. EVITE TENTACIONES: Evitar pasar por los pasillos de snacks y bollería, así se evitarán tentaciones de alimentos que suelen aportar muchas calorías y no nos beneficia. IR CON EL DINERO JUSTO, Así comprarásólo lo que hay en la lista y evitará comprar en exceso y ahorrará dinero LEA LAS ETIQUETAS DE LOS ALIMENTOS: Leer el etiquetado de los alimentos, así se conocerá la composición de los alimentos y podrá elegir mejor, también nos informarán de la caducidad y las normas de conservación de estos NO UTILICE CARROS GRANDES. En grandes superficies, hacer la compra con una cesta en lugar de un carro, así cogeremos sólo lo imprescindible',
  },
  {
    id: 2,
    title: '2. Cocinar saludable',
    text: 'COMIDA TRADICIONAL. La comida tradicional suele aportar muchos nutrientes necesarios en una alimentación normal. Hoy en día existen alimentos preparados, o precocinados que nos ayudan como pasta o legumbres ya cocidas. POCA GRASA. La grasa aporta muchas calorías. Hay que aprender a cocinar sin añadir mucha grasa a los guisos. Mide el aceite por cucharadas. Evita freír. FRUTA Y VERDURA. La fruta y verdura nos aportan grandes cantidades de fibra, vitaminas y pocas calorías. Utilizarlas en crudo o cocinadas enriquece las comidas y ayuda a mantener el peso. Se deben tomar diariamente 4 o 5 raciones 2 o 3 de fruta 2 o 3 de verdura LACTEOS DESNATADOS. Todos los lácteos debemos tomarlos siempre desnatados independientemente de la edad. Nos aportan todos los nutrientes pero sin grasa saturada. CACHARROS PEQUEÑOS. Utilizar siempre cacharros pequeños ayuda a controlar la cantidad, y evita pasarse y que sobre. RACIONES ADECUADAS. Siempre cocinar raciones de acuerdo a los comensales. No cocinar de mas. Siempre se lo comerá al que menos le conviene. CACHARROS ANTIADHERENTES. Nos ayudan a cocinar con menos grasa, y evitan fritos. SI AL MICROONDAS- NO A LA FREIDORA. Cocinar en el microondas es rápido limpio y permite cocinar sin grasa, es ideal para hacer dieta. La freidora, aparte de aportar muchas calorías a la dieta, recalienta mucho el aceite y pueden aparecer grasas toxica. PLANCHA, VAPOR, HORNEADO. Son formas de cocinar, sencillas, sabrosas que no precisan grasa. Muy recordables en dietas de adelgazamiento POCA SAL Y MAS CONDIMENTOS. Sal lo menos posible. Si se pueden utilizar condimentos (hierbas, pimienta, limón, etc.)',
  },
  {
    id: 3,
    title: '3. Elegir los alimentos',
    text: 'Resumen general sobre cómo elegir mejor los alimentos dentro de una dieta equilibrada.',
  },
  {
    id: 4,
    title: '4. Alimentos que sí debes tomar',
    text: 'Cereales: Todos (pan, pasta, arroz, harinas), preferiblemente integrales. Deben tomarse a diario en desayuno y comida. Legumbres: Tomar dos o tres veces por semana, en guiso o ensalada, en cantidad moderada y sin grasa. Lácteos: Siempre desnatados y en cantidades moderadas. Proteínas: Carnes magras, aves, huevos y pescados de todo tipo. Grasas: Solo aceite de oliva, mejor virgen, sin pasarse de 3-5 cucharadas al día. Bebidas: Agua como líquido principal; infusiones, café o té con edulcorante; zumos naturales; vino tinto moderado solo cuando corresponda.',
  },
  {
    id: 5,
    title: '5. Alimentos a evitar',
    text: 'Evitar azúcares y bollería, chocolates, caramelos y helados. Reducir grasas como mantequilla, nata, tocino, mayonesa, fritos de bolsa y quesos grasos. Evitar fritos en general y sustituir por plancha, vapor, horno o microondas. Reducir al máximo sal, embutidos grasos y bebidas alcohólicas o azucaradas.',
  },
  {
    id: 6,
    title: '6. Comer saludable',
    text: 'Comer variado en pequeñas cantidades, priorizar comida casera, incluir fruta y verdura a diario, tomar proteínas magras, usar aceite de oliva sin abuso, preferir cereales integrales, evitar exceso de dulces y grasas, moderar sal y bebidas azucaradas, y mantener hidratación con agua.',
  },
  {
    id: 7,
    title: '7. Buenos hábitos',
    text: 'Planificar menús, no almacenar alimentos calóricos visibles, desayunar diariamente, servir platos ya racionados, comer en plato pequeño, masticar despacio, repartir la ingesta en 4 o 5 comidas, evitar picoteo entre horas y aumentar actividad física diaria.',
  },
  {
    id: 8,
    title: '8. Evitar exceso de peso',
    text: 'Mantener orden en comidas, no saltarse el desayuno, evitar picar entre horas, limitar alimentos que favorecen atracones, priorizar fruta/verdura/cereales integrales/proteínas magras, evitar ultraprocesados, cocinar con técnicas bajas en grasa y aumentar actividad física cotidiana.',
  },
  {
    id: 9,
    title: '9. Confeccionar un menú',
    text: 'Construir un menú variado y apetecible: verdura diaria, fruta diaria, cereales mejor integrales, proteínas bajas en grasa en cada comida, legumbres 2-3 veces por semana, pescado 3 veces por semana, aceite de oliva con moderación, lácteos desnatados y poca sal/azúcar.',
  },
  {
    id: 10,
    title: '10. Cambiar alimentos por otros',
    text: 'Usar equivalencias de raciones entre proteínas, cereales, frutas y verduras, lácteos y grasas para intercambiar alimentos sin desajustar cantidades ni calorías de la dieta.',
  },
  {
    id: 11,
    title: '11. Controlar la ansiedad por comida',
    text: 'No saltarse comidas, comer despacio, hacer 4-5 comidas al día, evitar picoteo, usar alternativas como fruta o lácteos desnatados para el dulce, retirar alimentos de riesgo de la vista, buscar actividades alternativas ante ansiedad y pedir ayuda profesional si hay atracones.',
  },
  {
    id: 12,
    title: '12. Calorías de bebidas',
    text: 'Comparativa de calorías en bebidas frecuentes para elegir opciones con menor aporte energético: agua, refrescos zero/light, cerveza sin alcohol o infusiones frente a alcoholes, refrescos azucarados y bebidas dulces.',
  },
  {
    id: 13,
    title: '13. Comer en familia',
    text: 'Comer en familia mejora hábitos, educación alimentaria y adherencia. Mantener desayuno completo, fomentar fruta/verdura/legumbres/pescado, limitar ultraprocesados, evitar usar comida como premio y reforzar actividad física diaria.',
  },
  {
    id: 14,
    title: '14. Preparar tapas ligeras',
    text: 'Recetas de tapas ligeras con verduras, frutas, marisco y lácteos bajos en grasa para picar con control calórico sin perder variedad ni sabor.',
  },
  {
    id: 15,
    title: '15. Equivalencias caseras',
    text: 'Guía de medidas domésticas: vaso, cucharadas, puñados y porciones para estimar gramos y mililitros sin báscula y controlar mejor la ingesta diaria.',
  },
  {
    id: 16,
    title: '16. Evitar el estreñimiento',
    text: 'No automedicarse con laxantes, mantener horarios regulares, beber al menos 2 litros de agua, hacer ejercicio diario, tomar fruta con piel lavada, verdura en comidas principales, integrales y legumbres con frecuencia, y lácteos fermentados.',
  },
  {
    id: 17,
    title: '17. Alternativas bajas en calorías',
    text: 'Sustituciones prácticas: cambiar desayunos, picoteo, meriendas y comidas de alta densidad calórica por alternativas más ligeras y equilibradas.',
  },
  {
    id: 18,
    title: '18. Diferenciar los lácteos',
    text: 'Cómo elegir lácteos según lactosa, grasa y necesidades: priorizar desnatados, revisar porciones, diferenciar bebidas vegetales de lácteos y entender el impacto calórico de leche, yogur y quesos.',
  },
].map((consejo) => ({
  ...consejo,
  text: normalizeConsejoText(consejo.text),
  anchor: `consejo-${consejo.id}`,
}))
