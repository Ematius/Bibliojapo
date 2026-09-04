// Lo que se teclea en el hueco de romaji, y si está bien.
//
// El archivo NO se llama como el componente al que atiende —WordGap.tsx— y no es
// un capricho: en Windows y en macOS el sistema de archivos no distingue mayúsculas,
// así que `WordGap.ts` y `WordGap.tsx` serían el mismo nombre para el compilador.
// Se nombra por lo que hace, como `bookAudio.ts` o `kanaBoard.ts`.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// Lo mismo que en `bookAudio.ts`, `kanaBoard.ts` y `kanaStrokeAnimation.ts`:
// page-flip clona las páginas de React, y un `onChange` de React se quedaría
// enganchado a la copia que nadie ve.
//
// ── Por qué hay que callar el gesto del libro ──────────────────────────────
// Aquí no es solo que la hoja se pasara al escribir: es que el campo NO SE PODRÍA
// NI ENFOCAR. page-flip deja pasar el `mousedown` sobre <button> y <a>, y sobre
// cualquier otra cosa hace `preventDefault()` para que arrastrar no seleccione
// texto. Un <input> cae en ese «cualquier otra cosa», y un `mousedown` anulado no
// da el foco: se podría pulsar el campo todo el día sin que apareciera el cursor.
//
// Cortando ahí el evento, ni el libro se entera ni el campo pierde su foco.
export function mountWordAnswer(root: HTMLElement): (() => void) | null {
  const gaps = [...root.querySelectorAll<HTMLElement>('.word-gap')]
  if (gaps.length === 0) return null

  const teardowns = gaps.map((gap) => mountOne(gap)).filter(Boolean) as (() => void)[]
  if (teardowns.length === 0) return null

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}

function mountOne(gap: HTMLElement): (() => void) | null {
  const inputs = [...gap.querySelectorAll<HTMLInputElement>('.word-gap__input')]
  const result = gap.querySelector<HTMLElement>('.word-gap__result')
  if (inputs.length === 0 || !result) return null

  // Lo escrito vale igual en mayúscula o en minúscula, y con espacios de más: el
  // ejercicio pregunta por el sonido del kana, no por la pulsación exacta de las
  // teclas. Un móvil que ponga la primera letra en mayúscula no puede suspender.
  const clean = (value: string) => value.trim().toLowerCase()

  const check = () => {
    let filled = 0
    let right = 0

    inputs.forEach((input) => {
      const typed = clean(input.value)
      const answer = clean(input.dataset.answer ?? '')

      input.classList.remove('word-gap__input--right', 'word-gap__input--wrong')
      // Un hueco vacío todavía no es un fallo: es un hueco sin contestar. Se queda
      // sin marca, o el ejercicio estaría corrigiendo antes de que se responda.
      if (typed === '') return

      filled += 1
      if (typed === answer) {
        right += 1
        input.classList.add('word-gap__input--right')
      } else {
        input.classList.add('word-gap__input--wrong')
      }
    })

    if (filled === 0) {
      result.textContent = ''
      return
    }

    // Se felicita cuando están TODOS: si el kana apareciera dos veces en la
    // palabra habría dos huecos, y acertar uno no es haber leído la palabra.
    if (right === inputs.length) {
      const word = gap.dataset.word ?? ''
      const reading = gap.dataset.reading ?? ''
      result.textContent = `Eso es: ${word} se lee «${reading}».`
      return
    }

    result.textContent = 'Esa no. Vuelve a mirar el kana de la hoja de al lado.'
  }

  // El evento es `input` y no `keyup`: salta igual con el teclado, pegando,
  // dictando o con el teclado en pantalla de un móvil, que con `keyup` no siempre
  // avisa. Y así corrige en el momento, sin botón ni Enter.
  const onInput = () => check()

  // Los dos eventos con los que el libro empieza a pasar la hoja.
  const block = (event: Event) => event.stopPropagation()

  inputs.forEach((input) => {
    input.addEventListener('input', onInput)
    input.addEventListener('mousedown', block)
    input.addEventListener('touchstart', block)
  })

  return () => {
    inputs.forEach((input) => {
      input.removeEventListener('input', onInput)
      input.removeEventListener('mousedown', block)
      input.removeEventListener('touchstart', block)
    })
  }
}
