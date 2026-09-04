// Los tiempos del trazado mnemotécnico. Todo en segundos, que es lo que espera
// GSAP.
//
// La pasada cuenta una historia en cinco tiempos, y se dispara con el botón de
// la hoja — no arranca sola ni se repite:
//
//   1. dibujar   el kana se traza sobre la ilustración
//   2. hold      queda todo junto, para que se vea la asociación
//   3. fade      la ilustración se va y el trazo pasa a tinta
//   4. alone     el kana se queda solo en la hoja
//   5. reset     vuelve la ilustración y el trazo se borra
//
// El quinto tiempo deja la hoja como estaba, así que al terminar se puede volver
// a pulsar y verlo otra vez desde el principio.
//
// Son los números a mover si el ejercicio va rápido o se hace pesado.
export const KANA_STROKE = {
  // 1 — Lo que tarda CADA trazo en dibujarse.
  strokeDuration: 0.9,
  // Cuánto se solapa el siguiente trazo con el anterior. Encadenados con un
  // poco de solape se leen como una mano escribiendo; separados del todo, como
  // tres animaciones sueltas.
  strokeStagger: 0.75,

  // 2 — Con la ilustración y el kana a la vez.
  holdTogether: 1,

  // 3 — La ilustración se desvanece y el trazo se vuelve tinta.
  fadeDuration: 1,

  // 4 — El kana solo sobre el papel. Es el momento que hay que recordar, así que
  // es la pausa más larga del ciclo.
  holdAlone: 3,

  // 5 — Vuelta al principio: reaparece la ilustración y el trazo se retira.
  resetDuration: 0.6,

  // El trazo mientras está sobre la ilustración y cuando se queda solo. No salen
  // de un token porque son dos estados de la MISMA línea y GSAP necesita
  // interpolar entre ellos: sobre el dibujo tiene que brillar, sobre el papel
  // tiene que ser tinta.
  strokeColorOverImage: '#f0c96a',
  strokeColorAlone: '#2c1f0e',
}
