// El contenido de la guía del vestíbulo. Dato, no JSX: se cambia aquí sin tocar el componente.

export const HALL_GUIDE = {
  image: '/images/hallways/LibraryExplanation.webp',
  imageAlt:
    'Tu biblioteca de japonés en tres pasos: 1. Empieza poco a poco, 2. Todo se reutiliza, 3. Construye tu base.',
  title: 'Tu biblioteca de japonés',
  detailsLabel: 'Explicación detallada',
  sections: [
    {
      paragraphs: [
        'Bibliojapo es un método de estudio progresivo diseñado para aprender japonés desde cero con un objetivo claro: avanzar hacia el JLPT N5 entendiendo y utilizando lo aprendido desde el primer momento.',
        'En lugar de memorizar hiragana, katakana, kanji y vocabulario como listas separadas, cada bloque introduce pocos elementos nuevos y los reutiliza inmediatamente en palabras y frases reales. Todo lo que aparece en una lección se construye únicamente con contenido que ya has aprendido, por lo que cada paso se apoya en el anterior.',
        'Por ejemplo, si en un primer bloque aprendes い, え y は, puedes empezar a reconocer palabras como いえ y construir una frase como いえはいい (“la casa está bien”). Más adelante, cuando aprendes nuevos caracteres como そ o れ, no empiezas desde cero: reutilizas lo anterior en expresiones como それはいい (“eso está bien”).',
        'Lo mismo ocurre con el vocabulario. Una palabra aprendida en un bloque puede volver a aparecer varias lecciones después dentro de una frase nueva. Así, en lugar de hacer sesiones separadas de repaso, el propio avance te obliga a recordar y usar lo anterior.',
        'A medida que progresas, el sistema va ampliando las combinaciones posibles. Primero lees palabras sencillas, después frases más completas y, cuando aparecen nuevas partículas y estructuras, puedes expresar ideas cada vez más naturales.',
        'El recorrido comienza con hiragana, continúa con katakana y kanji, y termina ampliando el vocabulario y la comprensión de estructuras básicas del japonés. El objetivo no es solo reconocer caracteres, sino aprender a leerlos, relacionarlos con palabras reales y utilizarlos dentro de frases con significado.',
      ],
    },
    {
      heading: '1. Empieza poco a poco',
      paragraphs: [
        'Aprender japonés suele empezar por una de sus partes más mecánicas: memorizar caracteres. En Bibliojapo ese proceso se ralentiza a propósito. En lugar de intentar aprender decenas de hiraganas de golpe, cada bloque introduce solo unos pocos y empieza a sacarles partido desde el primer momento.',
        'Por ejemplo, el primer bloque comienza únicamente con las cinco vocales y は. Son muy pocos caracteres, pero cambiando su posición y combinándolos entre sí ya puedes empezar a reconocer distintas palabras y utilizarlas dentro de frases sencillas. Así, mientras el aprendizaje del silabario avanza despacio, tu vocabulario, tu lectura y tu comprensión auditiva avanzan mucho más rápido.',
        'La idea es sencilla: no esperar a conocer todo el hiragana para empezar a utilizar japonés. Cada carácter nuevo aumenta las combinaciones posibles y, con ellas, aparecen nuevas palabras y nuevas frases.',
        'El hiragana cuenta con 46 caracteres básicos, además de sus transformaciones con dakuten, handakuten y caracteres pequeños. Aprender todas esas formas requiere tiempo. Pero ese tiempo no se dedica únicamente a memorizar símbolos: se aprovecha para aprender japonés real. Al terminar este primer recorrido, el objetivo no es simplemente poder pronunciar los caracteres que aparecen en una pantalla, sino reconocer alrededor de 218 palabras y haber trabajado 88 frases, según la estructura completa de esta fase.',
        'En otras palabras: cuando terminas hiragana, no solo sabes leer hiragana. Ya has empezado a entender qué estás leyendo.',
      ],
    },
    {
      heading: '2. Todo se reutiliza',
      paragraphs: [
        'Aprender tantas palabras podría convertirse rápidamente en otra lista que memorizar. Por eso Bibliojapo no funciona mediante bloques aislados que se estudian y después se abandonan.',
        'Cada nuevo bloque mezcla lo nuevo con lo que ya conoces. Una palabra aprendida al principio puede reaparecer varias lecciones después formando una frase distinta. Un hiragana que conociste como primer carácter de una palabra puede aparecer después en medio de otra o al final de una frase. El contexto cambia continuamente, pero el conocimiento anterior sigue estando presente.',
        'Esto convierte el propio avance en una forma de repaso.',
        'En lugar de hacer:',
        'aprender → memorizar → repasar → volver a memorizar',
        'el recorrido se parece más a:',
        'aprender → utilizar → volver a encontrar → recordar → ampliar',
        'Cuanto más avanzas, mayor es el número de combinaciones posibles. Los caracteres anteriores se mezclan con los nuevos, las palabras conocidas aparecen en frases diferentes y las frases van ganando complejidad.',
        'De esta manera, el hiragana, el katakana y más adelante los kanji se van asentando por exposición y uso continuo, no solamente porque hayas repetido el mismo carácter decenas de veces.',
        'El objetivo es pasar de la sensación de “tengo que acordarme de esto” a otra mucho más natural: “esto ya lo he visto, sé cómo suena y sé dónde lo he utilizado”.',
      ],
    },
    {
      heading: '3. Construye tu base',
      paragraphs: [
        'Ese mismo sistema continúa después del hiragana. El recorrido avanza por katakana y después por kanji, reutilizando constantemente el vocabulario y las estructuras que ya has aprendido.',
        'Por eso estos tres primeros grandes pasillos no sirven únicamente para aprender sistemas de escritura. Mientras aprendes a reconocerlos, también estás acumulando una parte importante del vocabulario básico del japonés.',
        'Siguiendo la distribución actual del contenido de Bibliojapo, al completar:',
        'Hiragana + Katakana + Kanji',
        'habrás trabajado aproximadamente el 58 % del vocabulario contemplado en el recorrido hacia el JLPT N5.',
        'Y todavía queda un último pasillo. Allí ya no necesitas detenerte tanto en aprender nuevos alfabetos: puedes concentrarte en ampliar y organizar el 42 % restante del vocabulario, reutilizando todo lo construido anteriormente.',
        'El resultado es una progresión en la que primero construyes las piezas fundamentales y, poco a poco, puedes dedicar cada vez más atención a comprender, escuchar, reconocer palabras y utilizar frases completas.',
      ],
    },
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
