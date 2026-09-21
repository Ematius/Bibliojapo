// El contenido de la guía del vestíbulo. Dato, no JSX: se cambia aquí sin tocar el componente.

export const HALL_GUIDE = {
  image: '/images/outsite/ExplicacionBiblioteca.webp',
  imageAlt:
    'Tu biblioteca de japonés en tres pasos: 1. Empieza poco a poco, 2. Todo se reutiliza, 3. Construye tu base.',
  title: 'Tu biblioteca de japonés',
  detailsLabel: 'Explicación detallada',
  paragraphs: [
    'Noken5 es un método de estudio progresivo diseñado para aprender japonés desde cero con un objetivo claro: avanzar hacia el JLPT N5 entendiendo y utilizando lo aprendido desde el primer momento.',
    'En lugar de memorizar hiragana, katakana, kanji y vocabulario como listas separadas, cada bloque introduce pocos elementos nuevos y los reutiliza inmediatamente en palabras y frases reales. Todo lo que aparece en una lección se construye únicamente con contenido que ya has aprendido, por lo que cada paso se apoya en el anterior.',
    'Por ejemplo, si en un primer bloque aprendes い, え y は, puedes empezar a reconocer palabras como いえ y construir una frase como いえはいい (“la casa está bien”). Más adelante, cuando aprendes nuevos caracteres como そ o れ, no empiezas desde cero: reutilizas lo anterior en expresiones como それはいい (“eso está bien”).',
    'Lo mismo ocurre con el vocabulario. Una palabra aprendida en un bloque puede volver a aparecer varias lecciones después dentro de una frase nueva. Así, en lugar de hacer sesiones separadas de repaso, el propio avance te obliga a recordar y usar lo anterior.',
    'A medida que progresas, el sistema va ampliando las combinaciones posibles. Primero lees palabras sencillas, después frases más completas y, cuando aparecen nuevas partículas y estructuras, puedes expresar ideas cada vez más naturales.',
    'El recorrido comienza con hiragana, continúa con katakana y kanji, y termina ampliando el vocabulario y la comprensión de estructuras básicas del japonés. El objetivo no es solo reconocer caracteres, sino aprender a leerlos, relacionarlos con palabras reales y utilizarlos dentro de frases con significado.',
  ],
  // Cuándo vuelve a salir. La primera vez sale siempre; esto decide las siguientes.
  choiceLabel: 'Volver a mostrar esta guía',
  choices: [
    { mode: 'never', label: 'Nunca' },
    { mode: 'always', label: 'Siempre' },
  ],
  closeLabel: 'Entendido',
  reopenLabel: 'Guía de la biblioteca',
} as const

// La entrada y la salida de la ventana. Ver `useHallGuideReveal`.
export const HALL_GUIDE_REVEAL = {
  inSeconds: 0.45,
  outSeconds: 0.3,
  riseRem: 1.5,
  ease: 'power3.out',
  easeOut: 'power2.in',
}
