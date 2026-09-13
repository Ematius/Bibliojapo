// El regalo por cerrar el tomo: el sobre que se abre y la carta que sale de dentro.
//
// No decide NADA sobre si hay premio ni qué dice la carta —eso lo saben `finalExam.ts` y
// `giftLetter.ts`—. Aquí solo vive el movimiento — de ahí que sea un archivo aparte y no
// parte del examen.
//
// Como el resto de lo que se mueve dentro del libro, recibe el nodo YA clonado por
// page-flip: un `onClick` de React se quedaría en la copia que nadie ve.
import gsap from 'gsap'

// Cuánto dura cada postura del sobre al abrirse. Cinco fotogramas de dibujo, no una
// interpolación: se encadenan con un fundido corto porque sus lienzos no comparten
// proporción y un corte seco daría un salto de tamaño.
const FRAME_STEP = 0.3
const FRAME_FADE = 0.1

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// EL SOBRE DESPIERTA. Lo llama `finalExam.ts` al aprobar, y a medias a propósito: el sobre
// pierde parte del velo y coge algo de color, lo justo para que se vea que ha cambiado algo
// en la hoja de al lado mientras cae el sello. El color entero llega al pulsar el botón, en
// `mountGiftOpening`; dárselo aquí dejaría el premio ya abierto antes de pedirlo.
export function wakeEnvelope(gift: HTMLElement) {
  const envelope = gift.querySelector<HTMLElement>('[data-gift-envelope]')
  if (!envelope) return

  gsap.to(envelope, {
    filter: 'grayscale(0.45) blur(0.8px)',
    opacity: 0.8,
    duration: reducedMotion() ? 0 : 0.9,
    ease: 'power2.out',
  })
}

// Parte el texto en caracteres para poder escribirlos de uno en uno. Se hace aquí y no en
// el JSX porque el polvo de hadas necesita un nodo por letra, y escribirlos a mano
// ensuciaría la carta para siempre a cambio de una animación que ocurre una vez.
//
// LAS LETRAS DE UNA MISMA PALABRA VAN AGRUPADAS. Cada letra es un `inline-block` —hace
// falta para poder moverla y escalarla— y dos `inline-block` seguidos son, por defecto, dos
// puntos donde el texto puede partir línea: sin agrupar, una palabra española de las de esta
// carta podía partirse por la mitad al ajustar el ancho, algo que nunca pasaba con el
// hiragana de la chuleta anterior, que no lleva espacios. El grupo entero lleva
// `white-space: nowrap`, así que la línea solo puede partir en el hueco ENTRE palabras.
function splitIntoChars(element: HTMLElement): HTMLElement[] {
  const text = element.textContent ?? ''
  const chars: HTMLElement[] = []
  const nodes: (HTMLElement | Text)[] = []

  text.split(' ').forEach((word, index) => {
    if (index > 0) nodes.push(document.createTextNode(' '))

    const group = document.createElement('span')
    group.className = 'exam-gift__dust-word'

    for (const character of word) {
      const span = document.createElement('span')
      span.className = 'exam-gift__dust-char'
      span.textContent = character
      chars.push(span)
      group.appendChild(span)
    }

    nodes.push(group)
  })

  element.replaceChildren(...nodes)
  return chars
}

export function mountGiftOpening(root: HTMLElement): (() => void) | null {
  const gift = root.querySelector<HTMLElement>('.exam-gift')
  if (!gift) return null

  const openButton = gift.querySelector<HTMLButtonElement>('[data-gift-open]')
  const envelope = gift.querySelector<HTMLElement>('[data-gift-envelope]')
  const letter = gift.querySelector<HTMLElement>('[data-gift-letter]')
  const frames = [...gift.querySelectorAll<HTMLElement>('[data-gift-frame]')]

  let opened = false

  // Los colores se leen del DOM y no se escriben aquí: son tokens, y GSAP necesita un
  // valor concreto al que llegar —no sabe interpolar hacia un `var()`—.
  const glow = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-brass-glow')
    .trim()

  // Escribe la carta que `giftLetter.ts` dejó preparada: sus líneas de prosa caen letra a
  // letra, como polvo de hadas, y si lleva una lista de % esta aparece entre una línea y la
  // siguiente, no junto con la letra de ninguna de las dos.
  const writeLetter = () => {
    const active =
      gift.querySelector<HTMLElement>('[data-gift-no-account]:not([hidden])') ??
      gift.querySelector<HTMLElement>('[data-gift-account]:not([hidden])')
    if (!active) return

    const ink = getComputedStyle(active).color
    const steps = [...active.children] as HTMLElement[]

    if (reducedMotion()) {
      steps.forEach((step) => {
        if (step.hasAttribute('data-gift-line')) gsap.set(splitIntoChars(step), { opacity: 1 })
        else gsap.set([...step.children], { opacity: 1 })
      })
      return
    }

    const timeline = gsap.timeline()

    steps.forEach((step, index) => {
      const offset = index === 0 ? 0 : '+=0.2'

      if (step.hasAttribute('data-gift-line')) {
        const chars = splitIntoChars(step)
        timeline.fromTo(
          chars,
          { opacity: 0, y: -10, scale: 1.7, color: glow },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            color: ink,
            duration: 0.5,
            ease: 'power2.out',
            stagger: { each: 0.016 },
          },
          offset,
        )
        return
      }

      // La lista de %: no es prosa, así que no cae letra a letra — entra de golpe, una
      // fila detrás de otra.
      const rows = [...step.children] as HTMLElement[]
      if (rows.length === 0) return
      gsap.set(rows, { opacity: 0 })
      timeline.to(rows, { opacity: 1, duration: 0.4, stagger: 0.08 }, offset)
    })
  }

  const onOpen = () => {
    if (opened || !openButton) return
    opened = true
    openButton.disabled = true
    openButton.setAttribute('hidden', '')

    // El aviso y el botón ya han dicho lo suyo: se quitan de en medio para que la carta se
    // quede con todo el alto de la hoja.
    gift.querySelectorAll<HTMLElement>('[data-gift-note], [data-gift-ready]').forEach((note) => {
      note.setAttribute('hidden', '')
    })

    const finish = () => {
      writeLetter()
    }

    letter?.removeAttribute('hidden')

    if (reducedMotion()) {
      gsap.set(envelope, { opacity: 0 })
      gsap.set(letter, { opacity: 1, scale: 1 })
      finish()
      return
    }

    const timeline = gsap.timeline({ onComplete: finish })

    // 1) El lacre cede: el sobre deja de estar apagado y coge color. Es el único filtro
    //    que se anima en el libro, y dura lo que dura: de fondo no queda ninguno, así que
    //    no hay repintado por cada frame del giro de página.
    timeline.to(envelope, {
      filter: 'grayscale(0) blur(0px)',
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    })

    // 2) Los cinco fotogramas, por turnos.
    frames.slice(1).forEach((frame, index) => {
      timeline
        .to(frame, { opacity: 1, duration: FRAME_FADE }, `+=${FRAME_STEP}`)
        .to(frames[index], { opacity: 0, duration: FRAME_FADE }, '<')
    })

    // 3) La carta se acerca: sale del tamaño que tiene dentro del sobre y crece hasta
    //    llenar la hoja, mientras el sobre se queda atrás.
    timeline
      .fromTo(
        letter,
        { opacity: 0, scale: 0.42, yPercent: 6 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 0.9, ease: 'power3.out' },
        '+=0.25',
      )
      .to(envelope, { opacity: 0, duration: 0.5 }, '<')
  }

  openButton?.addEventListener('click', onOpen)

  return () => {
    openButton?.removeEventListener('click', onOpen)
    // Con el tomo ya en su balda, una timeline viva seguiría tocando nodos que page-flip
    // está a punto de llevarse por delante.
    gsap.killTweensOf([envelope, letter, ...frames])
  }
}
