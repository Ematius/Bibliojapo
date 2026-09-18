// Arrastrar un kana hasta su hueco, o pulsarlo para colocarlo.
//
// NO se llama como el componente al que atiende —KanaMatch.tsx— por lo mismo que
// `wordAnswer.ts` y `wordChoice.ts`: en Windows y macOS el sistema de archivos no distingue
// mayúsculas. No es un hook porque page-flip clona las páginas de React.
//
// EL GESTO NO PUEDE PASAR LA HOJA: arrastrar la tarjeta y arrastrar la página son el mismo
// gesto. Se corta por dos sitios: las tarjetas son <button> y page-flip ignora el
// `mousedown` sobre uno, y aun así se cortan `mousedown` y `touchstart` —eventos ANTIGUOS,
// distintos de los de puntero— para que el ejercicio siga a salvo si cambia la
// configuración del libro.
//
// El ratón y el dedo SOLO arrastran: manda siempre el punto donde se suelta. El teclado sí
// puede pulsar —Enter y Espacio sobre un <button> solo saben disparar un `click`—, porque
// sin esa vía el ejercicio sería imposible sin ratón ni dedo.
import { announceSolved } from '../parts/solved'

export function mountKanaPairing(root: HTMLElement): (() => void) | null {
  const matches = [...root.querySelectorAll<HTMLElement>('.kana-match')]
  if (matches.length === 0) return null

  const teardowns = matches.map((match) => mountOne(match)).filter(Boolean) as (() => void)[]
  if (teardowns.length === 0) return null

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}

// Un toque corto y seco al fallar. Se repite en cada intento, aunque sea sobre la misma
// tarjeta: es la reacción al gesto, no una marca. La API no está en todos lados —Safari de
// iPhone no la tiene—, y sin ella el fallo se sigue viendo en rojo.
const buzz = () => {
  if ('vibrate' in navigator) navigator.vibrate(70)
}

function mountOne(match: HTMLElement): (() => void) | null {
  // En plural: si el kana estudiado apareciera dos veces en la palabra habría dos huecos.
  const slots = [...match.querySelectorAll<HTMLElement>('.kana-match__slot')]
  const tiles = [...match.querySelectorAll<HTMLButtonElement>('.kana-match__tile')]
  const result = match.querySelector<HTMLElement>('.kana-match__result')
  if (slots.length === 0 || tiles.length === 0 || !result) return null

  // Los kana que ya vienen colocados. Sirven para explicar mejor el fallo: elegir い no es
  // haber confundido un sonido, es no haber visto que esa ya estaba puesta.
  const placed = new Set(
    [...match.querySelectorAll<HTMLElement>('.kana-match__unit')].map(
      (unit) => unit.textContent ?? '',
    ),
  )

  // Un hueco lleno no se vacía: lo acertado no se puede «desacertar». Mismo criterio que en
  // `wordChoice.ts`.
  const isFilled = (slot: HTMLElement) => slot.classList.contains('kana-match__slot--filled')
  const pending = () => slots.filter((slot) => !isFilled(slot))

  // Mete el kana en su hueco y retira la tarjeta del montón: dejarla también abajo haría
  // parecer que está en dos sitios.
  const fill = (slot: HTMLElement, tile: HTMLButtonElement) => {
    slot.textContent = tile.dataset.kana ?? ''
    slot.classList.add('kana-match__slot--filled')

    // La tarjeta se retira solo cuando ya no hace falta. Hay palabras que piden el MISMO kana
    // dos veces —おおい, はは— y el montón trae una sola tarjeta de cada uno, porque
    // `pickCards` quita los repetidos. Retirándola al primer uso, el segundo hueco se quedaba
    // sin con qué llenarse.
    const chosen = tile.dataset.kana ?? ''
    if (!pending().some((free) => free.dataset.answer === chosen)) {
      tile.classList.add('kana-match__tile--placed')
    }

    if (pending().length > 0) {
      // Se confirma el acierto sin destripar la palabra, que es lo que hay que reconstruir.
      result.textContent = 'Bien. Sigue.'
      return
    }

    // Lo que se dice al terminar es la ficha ENTERA, no el último kana: «あ se lee aoi» sería
    // sencillamente falso.
    const word = match.dataset.word ?? ''
    const reading = match.dataset.reading ?? ''

    // Una palabra se confirma por lo que SIGNIFICA; un kana suelto, por cómo se lee. Y no es
    // un matiz de redacción: esta ficha comparte hoja con el hueco de rōmaji en el repaso y
    // en el examen, y decir aquí «はい se lee hai» le daba hecha la respuesta al de debajo.
    const meaning = match.dataset.meaning
    result.textContent = meaning
      ? `Eso es: ${word} significa «${meaning}».`
      : `Eso es: ${word} se lee «${reading}».`

    // Solo se llega aquí una vez: un hueco lleno no se vacía.
    announceSolved(match)
  }

  // Sin hueco —una pulsación, que es la vía del teclado— se busca el que esté esperando ese
  // kana: quien pulsa dice QUÉ coloca, no dónde.
  const place = (tile: HTMLButtonElement, target: HTMLElement | null) => {
    const chosen = tile.dataset.kana ?? ''
    const slot = target ?? pending().find((free) => free.dataset.answer === chosen) ?? null

    if (!slot || slot.dataset.answer !== chosen) {
      tile.classList.add('kana-match__tile--wrong')
      buzz()

      // El kana SÍ está en la palabra, pero no en ese hueco. Decirlo cambia lo que hay que
      // corregir: no es que el sonido esté mal, es que el orden no es ese.
      const misplaced = chosen !== '' && pending().some((free) => free.dataset.answer === chosen)

      if (misplaced) {
        result.textContent = `${chosen} está en la palabra, pero en otro sitio.`
      } else if (placed.has(chosen)) {
        result.textContent = `Esa no: ${chosen} ya está puesta. Falta la que suena sola.`
      } else {
        result.textContent = 'Esa no. Vuelve a escuchar y fíjate en qué sonido falta.'
      }
      return
    }

    fill(slot, tile)
  }

  const teardowns = tiles.map((tile) => {
    // Viven por tarjeta porque solo se arrastra una a la vez, pero cada una vuelve a su sitio
    // por su cuenta.
    let startX = 0
    let startY = 0
    let dragging = false

    const reset = () => {
      dragging = false
      tile.classList.remove('kana-match__tile--dragging')
      tile.style.transform = ''
    }

    // Una tarjeta ya colocada no se vuelve a coger, y con todos los huecos llenos no hay
    // dónde llevar ninguna.
    const spent = () => pending().length === 0 || tile.classList.contains('kana-match__tile--placed')

    const onDown = (event: PointerEvent) => {
      if (spent()) return
      dragging = true
      startX = event.clientX
      startY = event.clientY
      tile.classList.add('kana-match__tile--dragging')
      // Sin capturar el puntero, en cuanto el dedo se adelanta un poco el gesto se corta.
      tile.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      // `translate` y no `left`/`top`: no rehace la colocación de la página en cada frame.
      tile.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onUp = (event: PointerEvent) => {
      if (!dragging) return

      // La tarjeta vuelve a su sitio SIEMPRE, y lo que se decide es aparte: así el montón
      // queda ordenado tanto si se acierta como si no.
      reset()

      if (spent()) return

      // Manda EN QUÉ hueco se ha soltado: con tres huecos seguidos, acertar el kana pero
      // errar el sitio es un fallo distinto. Se mira el punto del PUNTERO y no el centro de
      // la tarjeta, que con una tarjeta grande puede quedar lejos del hueco.
      // El más CERCANO, no el que contiene al puntero: fallar una caja pequeña por unos
      // píxeles no puede quedarse en nada. Más allá de un alto de caja sigue siendo no haber
      // llegado a intentarlo.
      const target =
        pending()
          .map((slot) => {
            const area = slot.getBoundingClientRect()
            return {
              slot,
              margin: area.height,
              distance: Math.hypot(
                Math.max(area.left - event.clientX, 0, event.clientX - area.right),
                Math.max(area.top - event.clientY, 0, event.clientY - area.bottom),
              ),
            }
          })
          .filter((entry) => entry.distance <= entry.margin)
          .sort((first, second) => first.distance - second.distance)[0]?.slot ?? null

      // Soltada fuera de todo hueco no es un fallo: es que no se ha llegado a intentar.
      if (target) place(tile, target)
    }

    // El teclado no pasa por los eventos de puntero: Enter y Espacio disparan un `click`
    // sintético y nada más. `detail` es el número de pulsaciones del ratón acumuladas, y en
    // el evento que fabrica el teclado vale cero: es lo que distingue un Enter de un clic, y
    // lo que evita colocar dos veces la misma tarjeta.
    const onClick = (event: MouseEvent) => {
      if (spent() || event.detail !== 0) return
      place(tile, null)
    }

    // Los dos eventos que hay que callar para que el libro no pase la hoja.
    const block = (event: Event) => event.stopPropagation()

    tile.addEventListener('mousedown', block)
    tile.addEventListener('touchstart', block)
    tile.addEventListener('pointerdown', onDown)
    tile.addEventListener('pointermove', onMove)
    tile.addEventListener('pointerup', onUp)
    tile.addEventListener('click', onClick)
    // Si el sistema se lleva el puntero a media arrastrada, la tarjeta tiene que volver igual
    // o se quedaría clavada fuera de su sitio.
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
  }
}
