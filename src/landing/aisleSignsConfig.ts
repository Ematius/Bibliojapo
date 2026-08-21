// Config de los carteles que cuelgan sobre los arcos del interior.
// La ilustración del interior no lleva carteles dibujados: cada cartel es un PNG
// completo, con sus cadenas y su adorno, que se cuelga delante del arco.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en el componente.
//
// ── Cómo colocar un cartel a mano ──────────────────────────────────────────
//
// Sistema de coordenadas: fracciones [0, 1] del stage (Interior.png, 1672 × 941),
// las mismas referencias que PORTAL. El origen es la esquina superior izquierda
// de la imagen, no del navegador.
//   0.01 horizontal ≈ 17 px de la imagen
//   0.01 vertical   ≈  9 px de la imagen
//
// `width` es el ancho del PNG entero. El alto NO se indica: sale solo del ancho,
// porque el PNG es 4:3 (1448 × 1086).
//
// OJO: `top` es el borde superior del PNG, o sea donde arranca la ARGOLLA de la
// cadena — no la tabla. La tabla cae en la mitad inferior del PNG. Si quieres
// apuntar directamente a dónde acaba la tabla:
//   borde superior de la tabla ≈ top + width * 0.59
//   borde inferior de la tabla ≈ top + width * 1.20
//   lados de la tabla          ≈ left + width * 0.04  ...  left + width * 0.96
//
// Centros aproximados de los cuatro arcos, medidos sobre la ilustración:
//   arco 1 (primero izq.)  0.02 – 0.17   centro 0.095
//   arco 2 (segundo izq.)  0.24 – 0.38   centro 0.31
//   arco 3 (segundo der.)  0.62 – 0.76   centro 0.69
//   arco 4 (primero der.)  0.82 – 0.97   centro 0.895
// Para centrar un cartel en un arco: left = centro - width / 2
//
// CUIDADO CON LOS BORDES: el stage se recorta por los lados en pantallas más
// estrechas que 16:9. En una 16:10 (1440 × 900) se pierde aproximadamente un 5 %
// por cada lado, así que todo lo que quede fuera de 0.05 – 0.95 se corta ahí.
//
// Al guardar, el dev server recarga solo — no hace falta reiniciar nada.
// ───────────────────────────────────────────────────────────────────────────

import { HIRAGANA_AISLE_IMAGE } from '../aisle/hiraganaAisleConfig'

export const AISLE_SIGN_BASE = '/images/placeCard'

export interface AisleSign {
  id: string
  // Texto accesible, en español — es la etiqueta del botón del cartel.
  label: string
  // Ruta a la que lleva el cartel al pulsarlo.
  route: string
  asset: string
  // Ilustración del pasillo de destino. El barrido lateral la desliza por encima
  // de la entrada antes de cambiar de ruta, para que el cambio no se note.
  sceneAsset: string
  left: number
  top: number
  width: number
}

export const AISLE_SIGNS: AisleSign[] = [
  {
    id: 'hiragana',
    label: 'Entrar en el pasillo de Hiragana',
    route: '/hiragana',
    asset: `${AISLE_SIGN_BASE}/catel-hiragana.png`,
    sceneAsset: HIRAGANA_AISLE_IMAGE,
    left: 0.07,
    top: 0.19,
    width: 0.09,
  },
]
