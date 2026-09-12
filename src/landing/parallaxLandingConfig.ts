// De la capa más profunda a la más cercana: el orden del array es el de apilado.
export const SCENE_LAYERS = [
  { id: 'valley', src: '/images/Landing2/1.webp' },
  { id: 'library', src: '/images/Landing2/2.webp' },
  { id: 'meadow', src: '/images/Landing2/3.webp' },
] as const

// La zona pulsable para entrar, en fracciones [0, 1] de la capa `library`: `x`/`y`
// son su centro y `width`/`height` cuánto abarca, así que crece con la escena.
//
// Es MÁS GRANDE que la puerta pintada a propósito: ajustada al hueco exacto serían
// unos 70 píxeles de ancho, y menos en un móvil. Con `SHOW_DOOR_ZONE` se ve dónde cae.
export const DOOR_ZONE = {
  x: 0.692,
  y: 0.637,
  width: 0.075,
  height: 0.185,
} as const

// La parte del dibujo que el recorte no puede llevarse nunca, en fracciones de la
// ilustración. Va aparte de `DOOR_ZONE`: una es dónde se pulsa y la otra qué se mira.
//
// Subir el ancho tiene castigo: en cuanto la zona no cabe, `framed-stage` encoge la
// escena para que quepa y asoma fondo por arriba y por abajo. El listón es la pantalla
// más estrecha, donde el ancho útil es 15 px menor de lo que parece —`html` reserva ese
// hueco para la barra de scroll—.
export const SCENE_FRAME = {
  x: 0.7,
  y: 0.55,
  width: 0.18,
  height: 0.4,
} as const

// Ayuda de taller para ajustar la zona de la puerta. Dejar en `false`.
export const SHOW_DOOR_ZONE = false

// Aparte del resto de capas: su marcado es distinto porque se duplican para
// encadenar el ascenso en bucle.
export const DROPS_LAYER_SRC = '/images/Landing2/4.webp'

// Va la última de todas, incluso por delante de las gotas.
export const FOREGROUND_LAYER_SRC = '/images/Landing2/5.webp'

// No participa del barrido de cámara: va referido a la ventana, como la caminante.
export const WELCOME_SIGN_SRC = '/images/Landing2/presentacion-landing.webp'

// El tiempo es único para todas las capas —una cámara arranca y para de golpe— y lo
// que cambia de una a otra es cuánto recorren: eso es lo que se lee como profundidad.
export const CAMERA_PAN = {
  durationSeconds: 17,
  ease: 'sine.inOut',

  // Recorrido de cada capa, en porcentaje de su propio ancho y repartido a ambos
  // lados del origen. El signo marca la dirección. La biblioteca comparte recorrido
  // exacto con el prado: está apoyada en él, y cualquier diferencia se vería como el
  // edificio deslizándose sobre la ladera.
  //
  // Ninguna amplitud puede pasar del margen que le da su `--layer-overscan` en el
  // SCSS, o al desplazarse dejaría ver el borde de la imagen.
  amplitude: {
    valley: 0.7,
    library: 3.2,
    meadow: 3.2,
    drops: 7,
    foreground: -8,
  },
} as const

// Un ciclo completo de gotas de abajo arriba. Más alto, más lento.
export const DROPS_RISE = { durationSeconds: 24 } as const
