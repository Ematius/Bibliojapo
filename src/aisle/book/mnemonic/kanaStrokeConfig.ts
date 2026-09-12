// Los tiempos del trazado mnemotécnico, en segundos. La pasada cuenta una historia en cinco
// tiempos —dibujar, esperar juntos, fundir, esperar solo y volver al principio— y se
// dispara con el botón de la hoja: no arranca sola ni se repite.
//
// Son los números a mover si el ejercicio va rápido o se hace pesado.
export const KANA_STROKE = {
  strokeDuration: 0.9,
  // Cuánto se solapa el siguiente trazo con el anterior: encadenados se leen como una mano
  // escribiendo; separados del todo, como tres animaciones sueltas.
  strokeStagger: 0.75,

  holdTogether: 1,

  fadeDuration: 1,

  // El kana solo sobre el papel. Es el momento que hay que recordar, así que es la pausa más
  // larga del ciclo.
  holdAlone: 3,

  resetDuration: 0.6,

  // No salen de un token porque son dos estados de la MISMA línea y GSAP tiene que
  // interpolar entre ellos: sobre el dibujo brilla, sobre el papel es tinta.
  strokeColorOverImage: '#f0c96a',
  strokeColorAlone: '#2c1f0e',
}
