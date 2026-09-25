export const SCENE_PAN = {
  // En fracción de lo que se ve. Menos de una pantalla: dejando a la vista un trozo de lo
  // anterior se entiende que uno se ha movido y no que ha cambiado de sitio.
  stepRatio: 0.7,
  durationSeconds: 0.55,
  ease: 'power2.out',

  // Lo que tiene que sobrar de escena, en fracción del ancho visible, para que haya flechas
  // y arrastre. Por debajo son ruido: en un escritorio apaisado sobran unos píxeles.
  minRangeRatio: 0.1,

  // A partir de cuánto sobra, también en fracción del ancho visible, la escena aterriza
  // donde diga `landing` en vez de donde la deje el CSS. Sobrando MÁS DEL DOBLE de lo que
  // cabe, la franja que se ve es tan estrecha que el centro del dibujo casi nunca tiene
  // nada: es el móvil de pie. Por debajo manda el centrado, que reparte mejor.
  landingRangeRatio: 2,

  // Sin este margen, el temblor del dedo al tocar un cartel contaría como arrastre y se
  // tragaría la pulsación.
  dragThresholdPx: 8,
} as const
