// Qué pasa al elegir un kana en el hueco de la palabra.
//
// El archivo NO se llama como el componente al que atiende —WordPick.tsx— por lo
// mismo que `wordAnswer.ts`: en Windows y en macOS el sistema de archivos no
// distingue mayúsculas, así que `wordPick.ts` y `WordPick.tsx` serían el mismo
// nombre para el compilador. No es una precaución teórica: se escribió primero
// así y TypeScript se negó a compilar. Se nombra por lo que hace —aquí se elige,
// en `wordAnswer.ts` se teclea—.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// Lo mismo que en `wordAnswer.ts`, `bookAudio.ts` y `kanaBoard.ts`: page-flip
// clona las páginas de React, y un `onClick` de React se quedaría enganchado a la
// copia que nadie ve.
//
// ── Por qué aquí NO hay que callar el gesto del libro ──────────────────────
// A diferencia del hueco de romaji, que es un <input>, aquí se pulsan <button>.
// page-flip deja pasar la pulsación sobre <button> y <a> —lo hace con
// `clickEventForward`— y solo la anula en todo lo demás. Así que elegir una
// opción no pasa página y no hay nada que interceptar.
import { announceSolved } from '../parts/solved'

export function mountWordChoice(root: HTMLElement): (() => void) | null {
  const picks = [...root.querySelectorAll<HTMLElement>('.word-pick')]
  if (picks.length === 0) return null

  const teardowns = picks.map((pick) => mountOne(pick)).filter(Boolean) as (() => void)[]
  if (teardowns.length === 0) return null

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}

function mountOne(pick: HTMLElement): (() => void) | null {
  const choices = [...pick.querySelectorAll<HTMLButtonElement>('.word-pick__choice')]
  const slots = [...pick.querySelectorAll<HTMLElement>('.word-pick__slot')]
  const result = pick.querySelector<HTMLElement>('.word-pick__result')
  if (choices.length === 0 || slots.length === 0 || !result) return null

  const answer = pick.dataset.answer ?? ''
  // Una vez acertado, el ejercicio está resuelto y deja de responder. No es lo
  // mismo que el hueco de romaji, que corrige en cada tecla porque lo escrito
  // cambia: aquí una elección acertada no se puede «desacertar» pulsando otra, y
  // borrar el acierto por un clic de más sería castigar la curiosidad.
  let solved = false

  const onClick = (event: Event) => {
    if (solved) return

    const choice = event.currentTarget as HTMLButtonElement
    const chosen = choice.dataset.kana ?? ''

    if (chosen !== answer) {
      choice.classList.add('word-pick__choice--wrong')
      result.textContent = 'Esa no. Vuelve a mirar la palabra de la hoja de al lado.'
      return
    }

    solved = true
    choice.classList.add('word-pick__choice--right')

    // Todos los huecos a la vez: si el kana apareciera dos veces en la palabra
    // habría dos, y rellenar uno solo dejaría la palabra a medias.
    slots.forEach((slot) => {
      slot.textContent = answer
      slot.classList.add('word-pick__slot--right')
    })

    const word = pick.dataset.word ?? ''
    const reading = pick.dataset.reading ?? ''
    result.textContent = `Eso es: ${word} se lee «${reading}».`

    // Y se avisa hacia fuera. `solved` ya garantiza que esto pasa una sola vez.
    announceSolved(pick)
  }

  choices.forEach((choice) => {
    choice.addEventListener('click', onClick)
  })

  return () => {
    choices.forEach((choice) => {
      choice.removeEventListener('click', onClick)
    })
  }
}
