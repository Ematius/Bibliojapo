import { readSentenceSlots } from '../exam/sentenceTiles'

// La corrección de las frases que se practican detrás de cada regla. Es lo Único que
// las separa de las del examen final: allí no se corrige nada al momento —`finalExam.ts`
// puntúa en silencio— y aquí sí, que para eso son de práctica.
//
// Se reconocen porque NO llevan bloque de examen. Si alguna vez se las diera, el examen
// se las llevaría y esto dejaría de encontrarlas — ver el selector de `finalExam.ts`.
//
// NO avisa con `announceSolved`: eso cuenta para el sello, y el sello es del examen
// final. Practicar no sella — ver «Un minijuego no da acceso» en CLAUDE.md, que es la
// misma idea.
export function mountSentenceDrill(root: HTMLElement): (() => void) | null {
  const onClick = (event: Event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const done = target.closest<HTMLElement>('[data-exam-next]')
    if (!done) return

    const sheet = done.closest<HTMLElement>('.sentence-build:not([data-exam-block])')
    if (!sheet) return

    const slots = readSentenceSlots(sheet)
    const right = slots.every((slot) => slot.filled !== null && slot.filled === slot.answer)

    // El resultado vive en el propio papel: page-flip clona las hojas, y un estado de
    // React no viajaría al clon.
    sheet.dataset.drill = right ? 'right' : 'wrong'
  }

  root.addEventListener('click', onClick)
  return () => root.removeEventListener('click', onClick)
}
