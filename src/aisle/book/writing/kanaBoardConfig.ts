// Los valores de la pizarra de escritura: los números a mover si el trazo sale demasiado
// fino para el dedo o demasiado gordo para que quepa un kana en la casilla.
export const KANA_BOARD = {
  // Grosor del pincel, en fracción del lado corto. En fracción y no en píxeles porque la
  // pizarra encoge con el libro: un grosor fijo tacha la casilla entera en un móvil.
  brushRatio: 0.055,

  // Solo por si `--color-ink` no ha llegado todavía cuando se monta. Si se cambia el token,
  // hay que cambiar también esta copia.
  fallbackInk: '#2c1f0e',

  // Lo mínimo que tiene que recorrer un trazo para contar como tal, en fracción del lado.
  // Sin esto, apoyar el dedo un instante gasta uno de los trazos del kana y descuadra la
  // corrección de todos los siguientes.
  minStroke: 0.04,
}

// Los números con los que se juzga un trazo a mano: los que hay que mover si el ejercicio
// corrige demasiado duro o demasiado blando. Ver `strokeMatch.ts`.
export const STROKE_MATCH = {
  // En cuántos puntos se reparte cada trazo antes de compararlo. Con menos, una curva se
  // aplana y deja de distinguirse de una recta.
  samples: 32,

  // Distancia media a partir de la cual el parecido es cero, con los dos trazos ya centrados
  // y escalados. Bajarlo aprieta la corrección: es el número a tocar primero si las notas
  // salen todas altas o todas bajas.
  tolerance: 0.35,

  // Cuánto tiene que ganar la comparación del revés para avisar del sentido contrario. Sin
  // margen, un trazo casi simétrico se declararía invertido por puro ruido.
  reversedMargin: 12,

  // Con cuánto se queda un trazo hecho al revés. Sin penalización sacaba el pleno, y el
  // sentido es parte de lo que se aprende. A 1 se deja de penalizar y solo queda el aviso.
  reversedPenalty: 0.5,

  // Por debajo de esta diagonal un trazo es un punto y no se escala: dividir por su tamaño
  // daría infinito.
  minDiagonal: 1e-6,
}
