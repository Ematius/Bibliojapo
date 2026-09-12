import gsap from 'gsap'
import { SOLVED_EVENT } from '../parts/solved'
import { fetchSeals, saveSeal } from '../../../api/progress'

// El sello del examen: cuenta las pruebas de cada uno y lo estampa cuando están todas
// resueltas.
//
// No es un hook porque page-flip clona las páginas: esto recibe el nodo YA clonado.
//
// Cuántas pruebas tiene un examen se sabe CONTÁNDOLAS: cada hoja lleva `data-exam` con el id
// de su kana, y el examen de あ son todos los ejercicios que cuelguen de una hoja marcada
// con `data-exam="a"`, esté a la derecha o a la izquierda. No hay ningún número escrito a
// mano: añadir una prueba a la plana la suma sola.
//
// Los ejercicios avisan por `bof:solved`, que burbujea, y se cuentan por el nodo que lo
// manda: resolver dos veces el mismo no cuenta dos veces.
const EXERCISES = '.kana-match, .word-gap, .word-pick'

export function mountExamSeal(root: HTMLElement, blockId: string): (() => void) | null {
  const sheets = [...root.querySelectorAll<HTMLElement>('[data-exam]')]
  if (sheets.length === 0) return null

  // Un examen por kana, aunque sus pruebas estén repartidas en dos hojas.
  const exams = new Map<string, { checks: Set<Element>; solved: Set<Element>; seals: HTMLElement[] }>()

  for (const sheet of sheets) {
    const id = sheet.dataset.exam
    if (!id) continue

    const exam = exams.get(id) ?? { checks: new Set(), solved: new Set(), seals: [] }
    sheet.querySelectorAll(EXERCISES).forEach((check) => exam.checks.add(check))
    sheet.querySelectorAll<HTMLElement>('.exam-seal').forEach((seal) => exam.seals.push(seal))
    exams.set(id, exam)
  }

  // Solo interesa el examen que lleva sello. Los de cada lección se cuentan igual al recorrer
  // las hojas, pero sin sello no hay nada que estampar ni que guardar.
  for (const [id, exam] of [...exams]) {
    if (exam.seals.length === 0 || exam.checks.size === 0) exams.delete(id)
  }

  if (exams.size === 0) return null

  // Los ya ganados de otras veces salen puestos y sin animación: estamparlos otra vez al
  // abrir el libro convertiría un logro en un efecto que se repite solo.
  //
  // Llegan con retraso —pueden venir de la cuenta—, pero para cuando alguien llega a la
  // última hoja ya han llegado. Si el libro se cierra antes, la respuesta se tira.
  let mounted = true
  void fetchSeals(blockId).then((earned) => {
    if (!mounted) return
    for (const [id, exam] of exams) {
      if (!earned.has(id)) continue
      exam.seals.forEach((seal) => seal.classList.add('exam-seal--earned'))
    }
  })

  const onSolved = (event: Event) => {
    const check = (event.target as Element | null)?.closest(EXERCISES)
    if (!check) return

    const sheet = check.closest<HTMLElement>('[data-exam]')
    const id = sheet?.dataset.exam
    if (!id) return

    const exam = exams.get(id)
    if (!exam || exam.solved.size >= exam.checks.size) return

    exam.solved.add(check)
    if (exam.solved.size < exam.checks.size) return

    // Aquí, y en ningún otro sitio, es donde el tomo queda superado: con cuenta el servidor
    // convierte el sello en la insignia que abre el siguiente; sin ella se queda en el
    // navegador hasta que se cree una.
    //
    // Se estampa sin esperar a la respuesta: el sello ya está ganado y apuntado en el
    // navegador, y la subida se reintenta sola la próxima vez que se entre.
    void saveSeal(blockId, id).catch(() => undefined)
    exam.seals.forEach((seal) => stamp(seal))
  }

  root.addEventListener(SOLVED_EVENT, onSolved)

  return () => {
    mounted = false
    root.removeEventListener(SOLVED_EVENT, onSolved)
  }
}

// El sello baja de golpe, aplasta contra el papel y se asienta. El tiempo del medio es el
// que lo hace parecer un sello y no una imagen que aparece.
//
// El giro es fijo y no al azar: está torcido porque las manos no estampan rectas, pero que
// cambiara en cada partida lo convertiría en un adorno inquieto.
function stamp(seal: HTMLElement): void {
  seal.classList.add('exam-seal--earned')

  // Con «reducir movimiento», el sello puesto y sin el golpe: la clase ya lo deja visible.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap
    .timeline()
    .fromTo(
      seal,
      { opacity: 0, scale: 2.4, rotate: -24, y: '-12%' },
      { opacity: 1, scale: 0.92, rotate: -8, y: '0%', duration: 0.26, ease: 'power3.in' },
    )
    .to(seal, { scale: 1.04, duration: 0.12, ease: 'power2.out' })
    .to(seal, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
}
