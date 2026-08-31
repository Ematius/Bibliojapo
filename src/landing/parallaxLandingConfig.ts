// Capas de fondo de la escena, ordenadas de la más profunda a la más cercana.
// El orden del array es también el orden de apilado en el DOM.
export const SCENE_LAYERS = [
  { id: 'valley', src: '/images/Landing2/1.png' },
  { id: 'library', src: '/images/Landing2/2.png' },
  { id: 'meadow', src: '/images/Landing2/3.png' },
] as const

// Las gotas van aparte del resto de capas porque su marcado es distinto: se
// duplican para poder encadenar el ascenso en bucle.
export const DROPS_LAYER_SRC = '/images/Landing2/4.png'

// Franja de flores en primer plano. Va la última de todas, incluso por delante
// de las gotas, así que tampoco entra en el array de capas de fondo.
export const FOREGROUND_LAYER_SRC = '/images/Landing2/5.png'

// Barrido lateral de cámara.
//
// El tiempo es único para todas las capas —una cámara arranca y para de golpe,
// no plano a plano— y lo que cambia de una a otra es solo cuánto recorren: eso
// es lo que se lee como profundidad. Si cada capa llevara su propia duración se
// descorrelacionarían y volverían a parecer objetos moviéndose por su cuenta.
export const CAMERA_PAN = {
  durationSeconds: 17,
  ease: 'sine.inOut',

  // Recorrido total de cada capa, en porcentaje de su propio ancho, repartido a
  // ambos lados de la posición de partida. Crece con la cercanía: el valle casi
  // no se mueve y el primer plano de flores es el que más viaja.
  //
  // El signo marca la dirección: positivo va de izquierda a derecha y negativo
  // al revés. El prado y el primer plano van enfrentados a propósito, para que
  // se crucen en vez de acompañarse.
  //
  // La biblioteca comparte recorrido exacto con el prado: está apoyada en ese
  // mismo terreno, así que cualquier diferencia entre ambas se vería como el
  // edificio deslizándose sobre la ladera.
  //
  // Ninguna amplitud puede pasar del margen que le da su `--layer-overscan` en
  // el SCSS, o al desplazarse dejaría ver el borde de la imagen.
  amplitude: {
    valley: 0.7,
    library: 3.2,
    meadow: 3.2,
    drops: 7,
    foreground: -8,
  },
} as const

// Lo que tarda un ciclo completo de gotas en recorrer la pantalla de abajo
// arriba. Cuanto más alto, más lento y más flotante el ascenso.
export const DROPS_RISE = { durationSeconds: 24 } as const
