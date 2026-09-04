// Los valores de la pizarra de escritura.
//
// Son los números a mover si el trazo sale demasiado fino para escribir con el
// dedo o demasiado gordo para que quepa un kana entero en la casilla.
export const KANA_BOARD = {
  // Grosor del pincel, en fracción del lado corto de la pizarra. Va en fracción y
  // no en píxeles porque la pizarra encoge y crece con el libro: un grosor fijo
  // que se lee bien a pantalla completa tacha la casilla entera en un móvil.
  //
  // Con este valor, en una pizarra de 250 px el trazo sale de unos 14 px, que es
  // más o menos lo que deja un rotulador escribiendo un kana de ese tamaño.
  brushRatio: 0.055,

  // Color de la tinta si el token no se puede leer.
  //
  // No es un valor de diseño: lo normal es que salga de `--color-ink`, y esto
  // solo evita que la pizarra pinte en negro por defecto —o en nada— si alguna
  // vez el estilo no ha llegado todavía cuando se monta. Si se cambia el token,
  // hay que cambiar también esta copia.
  fallbackInk: '#2c1f0e',

  // Lo mínimo que tiene que recorrer un trazo para contar como trazo, en fracción
  // del lado de la pizarra. Por debajo se descarta sin corregirlo.
  //
  // Existe porque apoyar el dedo un instante generaba un trazo, y eso no solo
  // ensucia: gasta uno de los trazos del kana y descuadra la corrección de todos
  // los siguientes. Un 4 % del lado es un roce; el trazo más corto de un kana
  // recorre bastante más.
  minStroke: 0.04,
}

// Los números con los que se juzga un trazo escrito a mano.
//
// Son los que hay que mover si el ejercicio corrige demasiado duro o demasiado
// blando. Ver `strokeMatch.ts` para qué hace cada uno.
export const STROKE_MATCH = {
  // En cuántos puntos se reparte cada trazo antes de compararlo. Con menos, una
  // curva se aplana y deja de distinguirse de una recta; con muchos más no se
  // gana precisión y se compara de más.
  samples: 32,

  // Distancia media a partir de la cual el parecido es cero, con los dos trazos
  // ya centrados y escalados —que caben en un círculo de radio 0,5—.
  //
  // Bajarlo aprieta la corrección: la misma raya torcida saca menos nota. Es el
  // número a tocar primero si las notas salen todas altas o todas bajas.
  tolerance: 0.35,

  // Cuántos puntos tiene que sacar la comparación del revés por encima de la
  // normal para avisar de que el trazo va en sentido contrario.
  //
  // Sin este margen, un trazo casi simétrico se declararía invertido por puro
  // ruido la mitad de las veces.
  reversedMargin: 12,

  // Con cuánto se queda un trazo hecho en sentido contrario. La forma puede estar
  // perfecta, pero el sentido es parte de lo que se aprende: sin penalización,
  // escribir al revés sacaba el pleno.
  //
  // A 1 se deja de penalizar y solo queda el aviso.
  reversedPenalty: 0.5,

  // Por debajo de esta diagonal, un trazo se considera un punto y no se escala:
  // dividir por su tamaño daría infinito y la nota saldría sin calcular.
  minDiagonal: 1e-6,
}
