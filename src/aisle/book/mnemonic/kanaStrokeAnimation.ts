import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { KANA_STROKE as pass } from './kanaStrokeConfig'
import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'

gsap.registerPlugin(DrawSVGPlugin)

// La pasada mnemotécnica: el kana se escribe sobre la ilustración, la ilustración
// se va y el kana se queda solo en la hoja.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// El resto de animaciones del proyecto van en hooks con un `ref`. Aquí no se
// puede: page-flip clona los nodos de la plantilla de React para meterlos en su
// propia estructura, así que un `ref` apuntaría a la copia oculta y la animación
// correría sobre algo que nadie ve.
//
// Por eso esto es una función suelta que recibe el nodo YA clonado y busca dentro
// lo que tenga que animar. La llama VolumeReader después de cargar las páginas,
// que es el único momento en que esos nodos existen.
//
// ── Por qué DrawSVGPlugin y no las líneas discontinuas a mano ──────────────
// Un trazo se dibuja pintándolo como línea discontinua cuyo hueco mide lo mismo
// que el propio trazo, y desplazando ese hueco hasta descubrirlo. Para eso hay
// que saber cuánto mide cada camino.
//
// El primer intento se lo ahorraba con `pathLength="1"`, que le pide al SVG que
// finja medir 1 mida lo que mida. Sobre el papel funciona; en la práctica no
// llegó a hacerlo, y el trazo salía entero de golpe: el patrón de un guion de 1
// unidad, sobre un camino que mide cientos, se convierte en cientos de guiones
// diminutos que, con el pincel a 70 y las puntas redondeadas, se solapan y
// rellenan la línea completa desde el primer fotograma.
//
// El plugin no depende de esa ficción: le pregunta al navegador la longitud real
// del camino y trabaja en unidades de verdad. Viene dentro de GSAP desde la 3.13,
// así que no hay nada que instalar.
//
// ── Se mira cuando se pide, no en cuanto se abre la hoja ───────────────────
// El trazado no arranca solo. La hoja se abre con la ilustración limpia y un
// botón, y hasta que no se pulsa no se escribe nada: quien llega quiere primero
// mirar el dibujo y leer la historia, y un kana escribiéndose en bucle al lado
// es justo lo que no deja hacerlo.
//
// Por eso tampoco se repite sola: la pasada termina devolviendo la hoja a como
// estaba, y el botón vuelve a quedar disponible para verla otra vez.
//
// Devuelve con qué desmontarlo todo —la timeline y el clic—, porque las dos cosas
// quedarían colgando de nodos que page-flip destruye al cerrar el libro.
export function mountKanaStroke(root: HTMLElement): (() => void) | null {
  const image = root.querySelector<HTMLElement>('.kana-stroke__image')
  const play = root.querySelector<HTMLButtonElement>('.kana-stroke__play')
  const paths = [...root.querySelectorAll<SVGPathElement>('.kana-stroke__path')]
  if (!image || !play || paths.length === 0) return null

  // Con «reducir movimiento» no hay nada que disparar. El CSS deja el trazo
  // dibujado sobre la ilustración y esconde el botón, así que la asociación se ve
  // igual: entera, y quieta.
  if (prefersReducedMotion()) return null

  // El punto de partida: los trazos sin nada dibujado todavía. `opacity` los
  // enciende, porque hasta aquí el CSS los tenía apagados — es lo que evita que
  // el kana asome entero durante el fotograma anterior a que GSAP tome el mando.
  gsap.set(paths, { drawSVG: 0, opacity: 1 })

  const tl = gsap.timeline({ paused: true })

  // 1 — El kana se escribe. Los trazos se encadenan con solape para que se lea
  // como una mano escribiendo y no como tres animaciones sueltas.
  tl.to(paths, {
    drawSVG: '100%',
    duration: pass.strokeDuration,
    stagger: pass.strokeStagger,
    ease: 'power1.inOut',
  })

  // 2 y 3 — Tras el descanso con las dos capas juntas, la ilustración se va y el
  // trazo pasa de brillo a tinta. La pausa va como posición de la timeline
  // (`+=`) en vez de como hueco vacío: es la misma espera con un tween menos.
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

  // 4 y 5 — El kana aguanta solo sobre el papel y luego se deshace el camino:
  // vuelve la ilustración y el trazo se retira por donde vino.
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

  // El botón se apaga mientras se escribe y vuelve al acabar. `restart` y no
  // `play`: cada pulsación empieza el trazado desde cero, que es lo que se espera
  // de algo que dice «Animar».
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
