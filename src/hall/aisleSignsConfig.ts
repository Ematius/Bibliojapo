// Los carteles que cuelgan sobre los arcos del interior. La ilustración no los lleva
// dibujados: cada uno es un PNG completo, con sus cadenas y su adorno.
//
// Coordenadas en fracciones [0, 1] del stage (Interior.webp, 1672 × 941) —no del
// navegador—, las mismas referencias que PORTAL. `width` es el ancho del PNG entero;
// el alto sale solo, porque es 4:3.
//
// OJO: `top` es el borde superior del PNG, o sea donde arranca la ARGOLLA de la cadena,
// no la tabla. La tabla cae en la mitad inferior: su borde superior está hacia
// `top + width * 0.59`.
//
// CUIDADO CON LOS BORDES: el stage se recorta por los lados en pantallas más estrechas
// que 16:9, así que todo lo que quede fuera de 0.05 – 0.95 se corta en una 16:10.

const AISLE_SIGN_BASE = '/images/placeCard'

export interface AisleSign {
  // La ruta, la ilustración de destino y el nombre salen de shared/aisles.ts: aquí solo
  // se dice a cuál se entra y dónde cuelga el cartel.
  aisleId: string
  asset: string
  left: number
  top: number
  width: number
}

// Los carteles caen desde arriba y se balancean hasta pararse. El pivote lo pone el
// SCSS en la argolla de la cadena, así que la oscilación gira desde donde giraría de
// verdad.
export const AISLE_SIGNS_INTRO = {
  // Desde qué altura caen, en porcentaje de su propio alto. Negativo es por encima.
  fromYPercent: -130,
  fallSeconds: 0.5,
  // Acelera al caer, como la gravedad. Frenando al final parecería que alguien lo baja.
  fallEase: 'power2.in',

  // El ángulo de partida es el impulso que trae la caída.
  swayFromDeg: 7,
  swaySeconds: 1.7,
  // El segundo número es la amortiguación: más bajo, antes se para.
  swayEase: 'elastic.out(1, 0.3)',

  staggerSeconds: 0.12,
}

export const AISLE_SIGNS: AisleSign[] = [
  {
    aisleId: 'hiragana',
    asset: `${AISLE_SIGN_BASE}/cartel-hiragana.webp`,
    left: 0.07,
    top: 0.19,
    width: 0.09,
  },
]
