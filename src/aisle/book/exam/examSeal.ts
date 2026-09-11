import gsap from 'gsap'
import { SOLVED_EVENT } from '../parts/solved'
import { addSeal, readSeals } from '../../../shared/seals'

// El sello del mini examen: cuenta las pruebas de cada examen y lo estampa cuando
// están todas resueltas.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// Lo mismo que `kanaStrokeAnimation.ts`, `wordChoice.ts` y compañía: page-flip
// clona las páginas de React, así que esto recibe el nodo YA clonado y trabaja
// sobre él. Un `useEffect` se quedaría mirando la copia que nadie ve.
//
// ── Cómo sabe cuántas pruebas tiene un examen ──────────────────────────────
// Contándolas. Cada hoja del examen lleva `data-exam` con el id de su kana, y
// dentro están los ejercicios de siempre; el examen de あ son todos los ejercicios
// que cuelguen de una hoja marcada con `data-exam="a"`, estén en la hoja derecha o
// en la izquierda. No hay ningún número escrito a mano: añadir una prueba más a la
// plana del examen la suma sola.
//
// Los ejercicios avisan por `bof:solved`, que burbujea —ver `parts/solved.ts`—, y
// se cuentan por el nodo que lo manda, así que resolver dos veces el mismo no
// cuenta dos veces.
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

  // Solo interesa el examen que lleva sello, que hoy es uno: el final. Los de cada
  // lección se cuentan igual al recorrer las hojas, pero sin sello no hay nada que
  // estampar ni nada que guardar, así que se sueltan aquí en vez de arrastrarlos
  // vacíos y tener que preguntar por ellos en cada acierto.
  for (const [id, exam] of [...exams]) {
    if (exam.seals.length === 0 || exam.checks.size === 0) exams.delete(id)
  }

  if (exams.size === 0) return null

  // Los que ya estaban ganados de otras veces salen puestos y sin animación: no
  // se acaban de conseguir, ya estaban ahí. Estamparlos otra vez al abrir el libro
  // convertiría un logro en un efecto que se repite solo.
  const earned = readSeals(blockId)
  for (const [id, exam] of exams) {
    if (!earned.has(id)) continue
    exam.seals.forEach((seal) => seal.classList.add('exam-seal--earned'))
  }

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

    // ── El momento en que se cierra un tomo ──────────────────────────────────
    // Aquí, y en ningún otro sitio, es donde el tomo queda superado. De este
    // punto van a colgar las cosas que hoy NO existen —guardar la hoja de repaso,
    // el trofeo, abrir el tomo siguiente—, y todas dependen de que haya cuentas,
    // que es la fase 4 y está sin decidir. Ver CLAUDE.md.
    //
    // Se deja en un solo sitio y señalado a propósito: el día que se decida, se
    // añade debajo de esta línea y no hay que buscar dónde. Mientras tanto, lo
    // único que pasa es lo que se ve — se apunta y se estampa.
    addSeal(blockId, id)
    exam.seals.forEach((seal) => stamp(seal))
  }

  root.addEventListener(SOLVED_EVENT, onSolved)

  return () => {
    root.removeEventListener(SOLVED_EVENT, onSolved)
  }
}

// El gesto de estampar: el sello baja de golpe, aplasta contra el papel y se
// asienta. Tres tiempos, y el del medio es el que lo hace parecer un sello y no
// una imagen que aparece — un sello de verdad rebota un poco al levantar la mano.
//
// El giro es fijo y no al azar: está torcido porque las manos no estampan rectas,
// pero que cambie en cada partida haría que la misma página se viera distinta cada
// vez que se abre, y eso ya no es un sello, es un adorno inquieto.
function stamp(seal: HTMLElement): void {
  seal.classList.add('exam-seal--earned')

  // Quien ha pedido menos movimiento se queda con el sello puesto y sin el golpe.
  // La clase de arriba ya lo deja visible, así que no se pierde nada.
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
