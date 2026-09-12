import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { KANA_STROKE as pass } from './kanaStrokeConfig'
import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'

gsap.registerPlugin(DrawSVGPlugin)

// La pasada mnemotécnica: el kana se escribe sobre la ilustración, la ilustración se va y
// el kana se queda solo en la hoja.
//
// No es un hook porque page-flip clona los nodos de la plantilla de React: un `ref`
// apuntaría a la copia oculta. Esto recibe el nodo YA clonado y busca dentro lo que animar.
//
// Usa DrawSVGPlugin y no líneas discontinuas a mano. El intento de ahorrárselo con
// `pathLength="1"` no funcionó: un guion de 1 unidad sobre un camino que mide cientos se
// convierte en cientos de guiones diminutos que, con el pincel a 70 y las puntas
// redondeadas, rellenan la línea entera desde el primer fotograma. El plugin pregunta al
// navegador la longitud real. Viene dentro de GSAP desde la 3.13.
//
// Se recorren TODAS las hojas y se monta cada una por separado: buscando la imagen y el
// botón sobre el libro entero se quedaba con los del primer kana, y los demás botones no
// hacían nada. No daba error, simplemente no animaba.
//
// Devuelve con qué desmontarlo todo: quedaría colgando de nodos que page-flip destruye al
// cerrar el libro.
export function mountKanaStroke(root: HTMLElement): (() => void) | null {
  // Con «reducir movimiento» el CSS deja el trazo dibujado sobre la ilustración y esconde el
  // botón, así que la asociación se ve igual: entera, y quieta.
  if (prefersReducedMotion()) return null

  const unmounts = [...root.querySelectorAll<HTMLElement>('.kana-stroke')]
    .map(mountSheet)
    .filter((unmount): unmount is () => void => unmount !== null)

  if (unmounts.length === 0) return null

  return () => unmounts.forEach((unmount) => unmount())
}

function mountSheet(sheet: HTMLElement): (() => void) | null {
  const image = sheet.querySelector<HTMLElement>('.kana-stroke__image')
  const play = sheet.querySelector<HTMLButtonElement>('.kana-stroke__play')
  const paths = [...sheet.querySelectorAll<SVGPathElement>('.kana-stroke__path')]
  if (!image || !play || paths.length === 0) return null

  // `opacity` los enciende, porque hasta aquí el CSS los tenía apagados: es lo que evita que
  // el kana asome entero durante el fotograma anterior a que GSAP tome el mando.
  gsap.set(paths, { drawSVG: 0, opacity: 1 })

  const tl = gsap.timeline({ paused: true })

  // Los trazos se encadenan con solape para que se lean como una mano escribiendo.
  tl.to(paths, {
    drawSVG: '100%',
    duration: pass.strokeDuration,
    stagger: pass.strokeStagger,
    ease: 'power1.inOut',
  })

  // La pausa va como posición de la timeline (`+=`) en vez de como hueco vacío: es la misma
  // espera con un tween menos.
  tl.to(
    image,
    { opacity: 0, duration: pass.fadeDuration, ease: 'power2.inOut' },
    `+=${pass.holdTogether}`,
  )
  tl.to(
    paths,
    { stroke: pass.strokeColorAlone, duration: pass.fadeDuration },
    '<', // arranca a la vez que el desvanecido, no después
  )

  tl.to(
    image,
    { opacity: 1, duration: pass.resetDuration, ease: 'power2.inOut' },
    `+=${pass.holdAlone}`,
  )
  tl.to(
    paths,
    {
      drawSVG: 0,
      stroke: pass.strokeColorOverImage,
      duration: pass.resetDuration,
    },
    '<',
  )

  // `restart` y no `play`: cada pulsación empieza el trazado desde cero, que es lo que se
  // espera de algo que dice «Animar».
  const onPlay = () => tl.restart()
  tl.eventCallback('onStart', () => {
    play.disabled = true
  })
  tl.eventCallback('onComplete', () => {
    play.disabled = false
  })
  play.addEventListener('click', onPlay)

  return () => {
    play.removeEventListener('click', onPlay)
    tl.kill()
  }
}
