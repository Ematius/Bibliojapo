// La caminante del sendero: el único elemento de interfaz del valle.
//
// Es una figura de línea que recorre el camino de losas hacia la biblioteca y
// se desvanece al llegar, para reaparecer abajo y volver a empezar. Sustituye a
// los tres galones que había antes: la pose ya es de marcha, así que el gesto
// de «sígueme» no hay que sugerirlo con símbolos.
export const PATH_WALK_IMAGE = '/images/silueta-caminando.webp'

// ── AQUÍ SE COLOCA EL RECORRIDO ────────────────────────────────────────────
// Fracciones [0, 1] de la ventana. `x` e `y` marcan los PIES de la figura, no
// su centro: anclarla por la base es lo que la mantiene pisando el camino
// cuando cambia de tamaño con la distancia.
//
//   x        0.5 es el centro de la pantalla.
//   y        1 es el borde inferior. Subir el número la baja.
//   height   altura de la figura, en fracción del alto de la ventana.
//
// `from` es el punto más cercano al espectador y `to` el más lejano, ya al pie
// de la escalinata: por eso la altura cae a la mitad de uno a otro. Esa caída
// es toda la perspectiva que hay — no hay cálculo de profundidad, solo dos
// tamaños y una interpolación entre ellos.
//
// Al ir en porcentaje de la VENTANA y no de la ilustración, en pantallas muy
// distintas a 16:9 la escena se recorta y el sendero se desplaza un poco
// respecto al recorrido. Si te cuadra mal en tu monitor, estos seis valores son
// los que hay que tocar.
// ───────────────────────────────────────────────────────────────────────────
// Medido sobre la escena en reposo, con el barrido de cámara parado: las losas
// entran por abajo a la izquierda del centro y suben hacia la derecha hasta la
// terraza de la casa. En ese tramo el camino es casi recto —a media altura se
// desvía menos de 0.01 de la línea que une los dos extremos—, así que un
// trayecto recto basta y no hace falta curva.
//
// Por debajo de 0.90 el camino queda tapado por el primer plano de flores, y la
// figura, que va por delante de todas las capas, se vería flotando sobre el
// desenfoque. De ahí que el paseo no empiece más abajo.
//
// Las alturas salen de la línea de horizonte, hacia y = 0.58: el tamaño en
// perspectiva crece con la distancia a esa línea, y la razón entre ambas
// (0.30 y 0.135) es la que fija que la figura llegue arriba a menos de la mitad.
export const PATH_WALK = {
  from: { x: 0.429, y: 0.88, height: 0.250 },
  to: { x: 0.655, y: 0.715, height: 0.075 },
}

// Ritmo del paseo, en segundos.
//
//   travelSeconds  lo que tarda en recorrer el sendero entero.
//   fadeSeconds    entrada y salida. La salida se solapa con el final del
//                  trayecto, así que se desvanece caminando, no parada.
//   holdSeconds    pausa en negro antes de reaparecer abajo. Sin ella el bucle
//                  se lee como un salto y no como otra persona que pasa.
//   stepSeconds    ciclo completo de bamboleo: un sube y baja por zancada.
//   bobPx          cuánto sube y baja al caminar, a tamaño natural. Se encoge
//                  con la figura al alejarse, porque va dentro de la escala.
export const PATH_WALK_LOOP = {
  travelSeconds: 9,
  fadeSeconds: 1.1,
  holdSeconds: 0.6,
  stepSeconds: 0.62,
  bobPx: 3,
}
