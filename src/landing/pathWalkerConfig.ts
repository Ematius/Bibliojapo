// La caminante del sendero: el único elemento de interfaz del valle.
export const PATH_WALK_IMAGE = '/images/silueta-caminando.webp'

// El recorrido, en fracciones [0, 1] de la ILUSTRACIÓN —no de la ventana, o la figura
// camina por donde no hay camino—. `x` e `y` marcan los PIES: anclarla por la base es lo
// que la mantiene pisando el suelo al encoger con la distancia.
//
// En un móvil el encuadre está puesto en la biblioteca, así que el arranque del camino
// cae fuera de cuadro y la figura entra por el borde izquierdo a media marcha.
//
// Por debajo de y = 0.90 el camino queda tapado por el primer plano de flores y la
// figura se vería flotando sobre el desenfoque.
export const PATH_WALK = {
  from: { x: 0.429, y: 0.88, height: 0.250 },
  to: { x: 0.655, y: 0.715, height: 0.075 },
}

// Ritmo del paseo. `holdSeconds` es la pausa en negro antes de reaparecer abajo: sin
// ella el bucle se lee como un salto y no como otra persona que pasa. `bobPx` va
// dentro de la escala, así que se encoge con la figura al alejarse.
export const PATH_WALK_LOOP = {
  travelSeconds: 9,
  fadeSeconds: 1.1,
  holdSeconds: 0.6,
  stepSeconds: 0.62,
  bobPx: 3,
}
