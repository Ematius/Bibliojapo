// Arrastrar un kana hasta su hueco, o pulsarlo para colocarlo.
//
// El archivo NO se llama como el componente al que atiende —KanaMatch.tsx— por lo
// mismo que `wordAnswer.ts` y `wordChoice.ts`: en Windows y en macOS el sistema
// de archivos no distingue mayúsculas, así que `kanaMatch.ts` y `KanaMatch.tsx`
// serían el mismo nombre para el compilador. Se nombra por lo que hace.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// Lo mismo que en `kanaBoard.ts` y `wordChoice.ts`: page-flip clona las páginas
// de React, y un manejador de React se quedaría enganchado a la copia que nadie
// ve. Esto recibe el nodo YA clonado.
//
// ── Por qué el gesto no pasa la hoja ───────────────────────────────────────
// Arrastrar la tarjeta y arrastrar la página son el MISMO gesto. Aquí se corta
// por dos sitios a la vez, y hacen falta los dos:
//
//   · Las tarjetas son <button>, y page-flip ignora el `mousedown` que cae sobre
//     uno. Eso ya evita que la hoja se mueva.
//   · Aun así se cortan `mousedown` y `touchstart`, igual que en la pizarra. Son
//     eventos ANTIGUOS y distintos de los de puntero: silenciarlos no estorba al
//     arrastre, y deja el ejercicio a salvo si algún día se cambia la
//     configuración del libro.
//
// ── Por qué el ratón y el dedo SOLO arrastran ──────────────────────────────
// Antes, un clic sin apenas mover el puntero colocaba la tarjeta directamente,
// sin pasar por el hueco. Era una ayuda para acertar en una pantalla pequeña,
// pero dejaba de sentirse como coger una tarjeta: se pulsaba y aparecía puesta
// sola. Ahora manda SIEMPRE el punto donde se suelta: si no cae dentro de un
// hueco, no pasa nada, y hay que soltarla otra vez.
//
// ── Por qué el teclado sigue pudiendo pulsar ───────────────────────────────
// Con el teclado no hay arrastre posible: Enter y Espacio sobre un <button> solo
// saben disparar un `click`. Esa vía se queda —ver `onClick`, más abajo—, porque
// sin ella el ejercicio sería imposible sin ratón ni dedo.
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

// Milisegundos del aviso al fallar: un toque corto y seco, no un zumbido largo.
// Se repite en cada intento fallido, aunque sea sobre la misma tarjeta —es la
// reacción al gesto que se acaba de hacer, no una marca que solo cuenta la
// primera vez—.
//
// La API de vibración no está en todos lados —Safari de iPhone no la tiene—, así
// que se comprueba antes de llamarla. Sin el aviso táctil el fallo se sigue
// viendo en rojo: nadie se queda sin saber que ha fallado.
const buzz = () => {
  if ('vibrate' in navigator) navigator.vibrate(70)
}

function mountOne(match: HTMLElement): (() => void) | null {
  // En plural: si el kana estudiado apareciera dos veces en la palabra habría dos
  // huecos, y rellenar uno solo dejaría la ficha a medias.
  const slots = [...match.querySelectorAll<HTMLElement>('.kana-match__slot')]
  const tiles = [...match.querySelectorAll<HTMLButtonElement>('.kana-match__tile')]
  const result = match.querySelector<HTMLElement>('.kana-match__result')
  if (slots.length === 0 || tiles.length === 0 || !result) return null

  // Los kana que ya vienen colocados en la ficha. Sirven para explicar mejor el
  // fallo: en la hoja de la palabra, elegir い no es haber confundido un sonido —es
  // no haber visto que esa ya estaba puesta—, y decir lo segundo enseña algo.
  const placed = new Set(
    [...match.querySelectorAll<HTMLElement>('.kana-match__unit')].map(
      (unit) => unit.textContent ?? '',
    ),
  )

  // Un hueco lleno no se vacía: lo acertado no se puede «desacertar», y deshacerlo
  // por un gesto de más sería castigar la curiosidad. Mismo criterio que en
  // `wordChoice.ts`.
  const isFilled = (slot: HTMLElement) => slot.classList.contains('kana-match__slot--filled')
  const pending = () => slots.filter((slot) => !isFilled(slot))

  // Mete el kana en su hueco y retira la tarjeta del montón: ya está puesta
  // arriba, y dejarla también abajo haría parecer que está en dos sitios.
  const fill = (slot: HTMLElement, tile: HTMLButtonElement) => {
    slot.textContent = tile.dataset.kana ?? ''
    slot.classList.add('kana-match__slot--filled')

    // La tarjeta se retira solo cuando ya no hace falta.
    //
    // Hay palabras que piden el MISMO kana dos veces —おおい, はは— y el montón trae
    // una sola tarjeta de cada uno: `pickCards` quita los repetidos, porque dos
    // tarjetas idénticas no son dos opciones, son la misma dos veces. Retirándola
    // al primer uso, el segundo hueco se quedaba sin con qué llenarse y el
    // ejercicio no se podía terminar.
    const chosen = tile.dataset.kana ?? ''
    if (!pending().some((free) => free.dataset.answer === chosen)) {
      tile.classList.add('kana-match__tile--placed')
    }

    if (pending().length > 0) {
      // Quedan huecos: se confirma el acierto sin destripar la palabra, que es
      // justo lo que hay que reconstruir.
      result.textContent = 'Bien. Sigue.'
      return
    }

    // Lo que se dice al terminar es la ficha ENTERA, no el último kana colocado:
    // en la hoja de la palabra, «あ se lee aoi» sería sencillamente falso.
    const word = match.dataset.word ?? ''
    const reading = match.dataset.reading ?? ''
    result.textContent = `Eso es: ${word} se lee «${reading}».`

    // Con todos los huecos llenos la ficha está resuelta. Solo se llega aquí una
    // vez: un hueco lleno no se vacía, así que no hay segunda vez que avisar.
    announceSolved(match)
  }

  // Decide qué pasa con la tarjeta que se acaba de dejar en un hueco.
  //
  // Sin hueco —una pulsación, que es la vía del teclado— se busca el que esté
  // esperando ese kana: quien pulsa dice QUÉ coloca, no dónde, y con un solo hueco
  // las dos cosas coinciden.
  const place = (tile: HTMLButtonElement, target: HTMLElement | null) => {
    const chosen = tile.dataset.kana ?? ''
    const slot = target ?? pending().find((free) => free.dataset.answer === chosen) ?? null

    if (!slot || slot.dataset.answer !== chosen) {
      tile.classList.add('kana-match__tile--wrong')
      buzz()

      // El kana SÍ está en la palabra, pero no en ese hueco. Es el fallo más
      // probable al construirla entera, y decirlo cambia lo que hay que corregir:
      // no es que el sonido esté mal, es que el orden no es ese.
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
    // Dónde empezó el gesto y cuánto lleva movido. Viven por tarjeta porque solo
    // se arrastra una a la vez, pero cada una vuelve a su sitio por su cuenta.
    let startX = 0
    let startY = 0
    let dragging = false

    const reset = () => {
      dragging = false
      tile.classList.remove('kana-match__tile--dragging')
      tile.style.transform = ''
    }

    // Una tarjeta ya colocada no se vuelve a coger, y con todos los huecos llenos
    // no hay dónde llevar ninguna.
    const spent = () => pending().length === 0 || tile.classList.contains('kana-match__tile--placed')

    const onDown = (event: PointerEvent) => {
      if (spent()) return
      dragging = true
      startX = event.clientX
      startY = event.clientY
      tile.classList.add('kana-match__tile--dragging')
      // El arrastre sigue aunque el puntero se salga de la tarjeta: sin
      // capturarlo, en cuanto el dedo se adelanta un poco el gesto se corta.
      tile.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      // `translate` y no `left`/`top`: mover con transform no rehace la
      // colocación de la página en cada frame del arrastre.
      tile.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onUp = (event: PointerEvent) => {
      if (!dragging) return

      // La tarjeta vuelve a su sitio SIEMPRE, y lo que se decide es aparte. Así
      // el montón queda ordenado tanto si se acierta como si no, y no hay que
      // recolocar nada a mano.
      reset()

      if (spent()) return

      // Manda EN QUÉ hueco se ha soltado, no solo si se ha soltado en alguno: con
      // tres huecos seguidos, acertar el kana pero errar el sitio es un fallo
      // distinto y hay que poder distinguirlo.
      //
      // Se mira el punto del puntero y no el centro de la tarjeta: es donde la
      // persona está mirando, y con una tarjeta grande el centro puede quedar lejos
      // del hueco aunque el dedo esté justo encima.
      const target =
        pending().find((slot) => {
          const area = slot.getBoundingClientRect()
          return (
            event.clientX >= area.left &&
            event.clientX <= area.right &&
            event.clientY >= area.top &&
            event.clientY <= area.bottom
          )
        }) ?? null

      // Soltada fuera de todo hueco no es un fallo: es que no se ha llegado a
      // intentar. Se calla y se deja volver a coger la tarjeta.
      if (target) place(tile, target)
    }

    // El teclado no pasa por los eventos de puntero: Enter y Espacio sobre un
    // <button> disparan un `click` sintético y nada más, así que sin esto la vía
    // accesible que promete el ejercicio no existiría.
    //
    // `detail` es el número de pulsaciones del ratón que ha acumulado el evento, y
    // en el que fabrica el teclado vale cero. Es lo que distingue un Enter de un
    // clic de verdad — y lo que evita colocar dos veces la misma tarjeta, porque
    // el ratón ya ha pasado por `pointerup` cuando llega aquí.
    const onClick = (event: MouseEvent) => {
      if (spent() || event.detail !== 0) return
      place(tile, null)
    }

    // Los dos eventos que hay que callar para que el libro no pase la hoja. No
    // hacen nada más: la tarjeta se mueve con los eventos de puntero.
    const block = (event: Event) => event.stopPropagation()

    tile.addEventListener('mousedown', block)
    tile.addEventListener('touchstart', block)
    tile.addEventListener('pointerdown', onDown)
    tile.addEventListener('pointermove', onMove)
    tile.addEventListener('pointerup', onUp)
    tile.addEventListener('click', onClick)
    // Si el sistema se lleva el puntero a media arrastrada —una llamada, un gesto
    // del navegador— la tarjeta tiene que volver igual, o se quedaría clavada
    // fuera de su sitio.
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
