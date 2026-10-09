import { OPENING_FRAMES } from './openingConfig'

// Los cinco fotogramas pesan juntos unos 700 kB, y `VolumeOpening` arranca sus fundidos
// de 0,2 s en el mismo instante en que los monta: sin pedirlos antes, la apertura corre a
// tiempo sobre imágenes que todavía están llegando y el libro se abre a trompicones.
//
// Se llaman al salir el tomo de la balda, que da los dos giros de margen —más de tres
// segundos— para que estén en caché cuando la timeline los necesite.
let asked = false

export function preloadOpeningFrames(): void {
  if (asked) return
  asked = true

  for (const src of OPENING_FRAMES) new Image().src = src
}
