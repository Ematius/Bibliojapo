// Colocar un kana en su hueco, para el examen final. El gesto es el de siempre
// —arrastrar o pulsar, ver `matching/kanaPairing.ts`— pero SIN corrección al momento:
// cualquier tarjeta entra en cualquier hueco, y un hueco lleno se puede volver a
// llenar con otra tantas veces como haga falta. La nota se calcula al pulsar
// «Siguiente» —`finalExam.ts`—, nunca mientras se coloca.
//
// LAS TARJETAS NO SE GASTAN NUNCA: una frase puede pedir el mismo kana más de una vez
// —はは, いい—, y el mazo, sin distractores, trae una sola tarjeta de cada uno. Si se
// deshabilitara al primer uso, la segunda vez no habría con qué llenar el hueco.
// Además, apagarla justo cuando ya no hace falta sería un aviso de acierto encubierto,
// y aquí no se avisa de nada.
//
// EL GESTO NO PUEDE PASAR LA HOJA, por la misma razón que en `kanaPairing.ts`: se
// cortan `mousedown` y `touchstart` en las tarjetas.
export function mountSentenceTiles(root: HTMLElement): (() => void) | null {
  const sentences = [...root.querySelectorAll<HTMLElement>('.sentence-build')]
  if (sentences.length === 0) return null

  const teardowns = sentences.map((sentence) => mountOne(sentence)).filter(Boolean) as (() => void)[]
  if (teardowns.length === 0) return null

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}

// Lo que hay puesto en los huecos de una frase ahora mismo, en su orden de escritura.
// La lee `finalExam.ts` al pulsar «Siguiente»: compara `filled` contra `answer` para
// puntuar, sin que este archivo sepa nada de aciertos.
export interface SentenceSlotState {
  answer: string
  filled: string | null
}

export function readSentenceSlots(sentence: HTMLElement): SentenceSlotState[] {
  return [...sentence.querySelectorAll<HTMLElement>('.sentence-build__slot')].map((slot) => ({
    answer: slot.dataset.answer ?? '',
    filled: slot.dataset.filled ?? null,
  }))
}

function mountOne(sentence: HTMLElement): (() => void) | null {
  const slots = [...sentence.querySelectorAll<HTMLElement>('.sentence-build__slot')]
  const tiles = [...sentence.querySelectorAll<HTMLButtonElement>('.sentence-build__tile')]
  if (slots.length === 0 || tiles.length === 0) return null

  // Cerrada por `finalExam.ts` en cuanto se pulsa «Siguiente»: la regla ya avisada en
  // las normas es que una vez enviada la frase no se puede volver a tocar.
  const locked = () => sentence.dataset.locked === 'true'

  const isFilled = (slot: HTMLElement) => slot.classList.contains('sentence-build__slot--filled')
  const emptySlots = () => slots.filter((slot) => !isFilled(slot))

  const clear = (slot: HTMLElement) => {
    slot.textContent = ''
    delete slot.dataset.filled
    slot.classList.remove('sentence-build__slot--filled')
  }

  const fill = (slot: HTMLElement, kana: string) => {
    slot.textContent = kana
    slot.dataset.filled = kana
    slot.classList.add('sentence-build__slot--filled')
  }

  // Pulsar un hueco lleno lo vacía: la manera de deshacer sin arrastrar nada encima.
  const onSlotClick = (event: Event) => {
    if (locked()) return
    const slot = event.currentTarget as HTMLElement
    if (isFilled(slot)) clear(slot)
  }
  slots.forEach((slot) => slot.addEventListener('click', onSlotClick))

  // Sin hueco de destino —la vía del teclado— se llena el primero que esté libre, en
  // el orden de la frase.
  const place = (kana: string, target: HTMLElement | null) => {
    const slot = target ?? emptySlots()[0] ?? null
    if (slot) fill(slot, kana)
  }

  const teardowns = tiles.map((tile) => {
    let startX = 0
    let startY = 0
    let dragging = false

    const reset = () => {
      dragging = false
      tile.classList.remove('sentence-build__tile--dragging')
      tile.style.transform = ''
    }

    const onDown = (event: PointerEvent) => {
      if (locked()) return
      dragging = true
      startX = event.clientX
      startY = event.clientY
      tile.classList.add('sentence-build__tile--dragging')
      tile.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      tile.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onUp = (event: PointerEvent) => {
      if (!dragging) return
      reset()

      const target =
        slots.find((slot) => {
          const area = slot.getBoundingClientRect()
          return (
            event.clientX >= area.left &&
            event.clientX <= area.right &&
            event.clientY >= area.top &&
            event.clientY <= area.bottom
          )
        }) ?? null

      if (target) place(tile.dataset.kana ?? '', target)
    }

    const onClick = (event: MouseEvent) => {
      // `detail` es cero en el clic que fabrica el teclado con Enter o Espacio; un
      // clic de ratón de verdad ya se ha atendido en `onUp`.
      if (locked() || event.detail !== 0) return
      place(tile.dataset.kana ?? '', null)
    }

    const block = (event: Event) => event.stopPropagation()

    tile.addEventListener('mousedown', block)
    tile.addEventListener('touchstart', block)
    tile.addEventListener('pointerdown', onDown)
    tile.addEventListener('pointermove', onMove)
    tile.addEventListener('pointerup', onUp)
    tile.addEventListener('click', onClick)
    tile.addEventListener('pointercancel', reset)

    return () => {
      tile.removeEventListener('mousedown', block)
      tile.removeEventListener('touchstart', block)
      tile.removeEventListener('pointerdown', onDown)
      tile.removeEventListener('pointermove', onMove)
      tile.removeEventListener('pointerup', onUp)
      tile.removeEventListener('click', onClick)
      tile.removeEventListener('pointercancel', reset)
    }
  })

  return () => {
    teardowns.forEach((teardown) => teardown())
    slots.forEach((slot) => slot.removeEventListener('click', onSlotClick))
  }
}
