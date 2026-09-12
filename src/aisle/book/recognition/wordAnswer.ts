// Lo que se teclea en el hueco de rōmaji, y si está bien.
//
// NO se llama como el componente al que atiende —WordGap.tsx— porque en Windows y macOS el
// sistema de archivos no distingue mayúsculas, y `WordGap.ts` y `WordGap.tsx` serían el
// mismo nombre para el compilador. Se nombra por lo que hace.
//
// No es un hook porque page-flip clona las páginas de React: un `onChange` se quedaría
// enganchado a la copia que nadie ve.
//
// HAY QUE CALLAR EL GESTO DEL LIBRO, y aquí no es solo que la hoja se pasara al escribir:
// el campo NO SE PODRÍA NI ENFOCAR. page-flip deja pasar el `mousedown` sobre <button> y
// <a>, y sobre cualquier otra cosa hace `preventDefault()` para que arrastrar no seleccione
// texto. Un <input> cae en ese «cualquier otra cosa», y un `mousedown` anulado no da el foco.
import { announceSolved } from '../parts/solved'

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

  // Vale igual en mayúscula o minúscula y con espacios de más: el ejercicio pregunta por el
  // sonido, no por la pulsación exacta. Un móvil que ponga la primera letra en mayúscula no
  // puede suspender.
  const clean = (value: string) => value.trim().toLowerCase()

  // Solo para el aviso de fuera. La corrección sigue siendo viva —se recalcula en cada
  // tecla—, pero «resuelto» se dice una vez: si no, cada pulsación contaría como un acierto.
  let announced = false

  const check = () => {
    let filled = 0
    let right = 0

    inputs.forEach((input) => {
      const typed = clean(input.value)
      const answer = clean(input.dataset.answer ?? '')

      input.classList.remove('word-gap__input--right', 'word-gap__input--wrong')
      // Un hueco vacío todavía no es un fallo: es un hueco sin contestar.
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

    // Se felicita cuando están TODOS: si el kana apareciera dos veces habría dos huecos, y
    // acertar uno no es haber leído la palabra.
    if (right === inputs.length) {
      const word = gap.dataset.word ?? ''
      const reading = gap.dataset.reading ?? ''
      result.textContent = `Eso es: ${word} se lee «${reading}».`

      if (!announced) {
        announced = true
        announceSolved(gap)
      }
      return
    }

    result.textContent = 'Esa no. Vuelve a mirar el kana de la hoja de al lado.'
  }

  // `input` y no `keyup`: salta igual tecleando, pegando, dictando o con el teclado en
  // pantalla de un móvil, donde `keyup` no siempre avisa.
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
