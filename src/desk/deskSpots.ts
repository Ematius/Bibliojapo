// Dónde se posa cada objeto sobre la mesa, medido una sola vez. Es el hermano de
// `shelfGrid.ts`, pero sin rejilla que repartir: son tres cosas puestas a conciencia, no una
// colección que crece, así que cada una dice su sitio y basta.
//
// Los números salen de medir `escritorio.webp` (1672 × 941) por su perfil de luminancia, no
// de ajustar a ojo.
//
// Todo en fracciones [0, 1] de la ILUSTRACIÓN, no de la ventana: es lo que mantiene cada
// objeto sobre su trozo de madera cuando la escena se recorta.

// La tapa. No se usa para colocar —cada objeto trae su sitio— sino para saber si un sitio es
// razonable: fuera de esto, el objeto se sale de la mesa.
export const DESK_SURFACE = {
  backY: 0.5,
  frontY: 0.894,
  // A los lados no manda el borde de la mesa, que se sale del dibujo, sino lo que ya hay
  // puesto: el tintero ocupa hasta 0,13 y el paño empieza en 0,88.
  left: 0.14,
  right: 0.86,
} as const

export interface DeskSpot {
  // Centro y no borde: al cambiarle el tamaño crece hacia los dos lados y no se desplaza.
  x: number
  // Donde el objeto TOCA la madera. Anclar por la base es lo que lo mantiene apoyado al
  // cambiarle el tamaño, igual que un tomo en su balda.
  //
  // Ojo: los recortes traen algo de margen transparente por debajo —un 5 % en la caja y en el
  // carné—, así que el objeto se apoya un pelo más arriba de lo que dice este número.
  baseY: number
  // Ancho, en fracción del ancho de la escena. El alto sale de la proporción del recorte.
  width: number
}

// Los tres objetos, y cada uno es una puerta. El reparto no es simétrico a propósito: la luz
// entra por la ventana de la izquierda, así que lo que más se usa va donde da la luz.
//
// Ninguno llega a los bordes de `DESK_SURFACE`: el que se pega a un borde es el primero que
// se pierde cuando la escena se recorta en una pantalla estrecha.
export const DESK_SPOTS = {
  // La hoja de estudio, la protagonista: en el centro, delante, y la más grande.
  sheet: { x: 0.45, baseY: 0.88, width: 0.40 },
  // La caja de los juegos, un poco más al fondo para que no compita con la hoja.
  box: { x: 0.80, baseY: 0.90, width: 0.2 },
  // El carné, el más pequeño porque es el que menos se abre: lo que cuenta de él son los
  // sellos, no el trámite.
  card: { x: 0.2, baseY: 0.70, width: 0.13 },
} as const satisfies Record<string, DeskSpot>

// El gesto de levantar un objeto y ponerlo enfrente. Es uno solo para los tres a propósito:
// con una animación por objeto habría tres cosas que mantener, y acaban desincronizándose.
export const DESK_LIFT = {
  // Cuánto ocupa ya enfrente, en fracción del ancho de la ESCENA y no de la ventana, porque
  // el sitio de partida también lo es: mezclando las dos referencias el viaje se torcería al
  // recortarse la escena.
  frontWidth: 0.42,
  // Un poco por encima del medio a lo alto: centrado del todo queda bajo, porque lo que se
  // mira de una tarjeta está en su mitad de arriba.
  frontX: 0.5,
  frontY: 0.46,
  // El fundido entre las dos caras dura lo mismo: es el movimiento el que tapa la diferencia
  // entre un dibujo y otro, así que no puede acabar antes.
  //
  // Sube de 0.8 respecto a antes: `sine.inOut` no tiene el arranque a toda velocidad de
  // `power2.out`, y sin ese empujón inicial el mismo tiempo se sentiría corto.
  seconds: 1,
  // `sine.inOut` y no `power2.out`: `.out` arranca ya a máxima velocidad y solo frena al
  // final, así que el objeto pega un salto seco nada más soltarse. `sine.inOut` arranca y
  // frena los dos por igual, sin el pico que sí tendría un `.inOut` más marcado como
  // `power2.inOut` — es la curva pareja, no la más lenta que hay.
  ease: 'sine.inOut',
  // Lo que tarda la tapa en abrirse, ya plantado el objeto.
  openSeconds: 0.45,
  // Los tres son hermanos colocados en absoluto, así que sin esto manda el orden del DOM: el
  // carné, que va primero, quedaba debajo de las hojas al levantarse.
  frontLayer: 2,
} as const

// Ayuda de taller para ajustar los sitios. Dejar en `false`.
export const SHOW_DESK_SPOTS = false

// Pone los tres objetos sin haberlos ganado, para mirar la composición. No siembra nada ni
// toca el progreso: sembrar sellos falsos ensuciaría el almacén de verdad. Dejar en `false`.
export const SHOW_EVERY_OBJECT = false
