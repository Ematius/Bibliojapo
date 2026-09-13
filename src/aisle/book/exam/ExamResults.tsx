import { BookButton } from '../parts/BookButton'
import './ExamResults.scss'

interface ExamResultsProps {
  examBlock: 1 | 2 | 3
  title: string
  // Solo el del bloque 3 dice «Ver la nota final»: los otros dos llevan al primer
  // ejercicio del bloque siguiente, y decirlo así se adelantaría al examen entero.
  isLastBlock: boolean
}

// La hoja de resultados de un bloque: nace con el título y el botón, y `finalExam.ts`
// rellena la nota y las frases falladas en cuanto se pulsa «Siguiente» en la última
// frase del bloque —antes de llegar aquí, no al llegar—, para que se vea ya puesta.
export function ExamResults({ examBlock, title, isLastBlock }: ExamResultsProps) {
  return (
    <div className="exam-results" data-exam-results={examBlock}>
      <h3 className="exam-results__title">{title}</h3>

      <p className="exam-results__score" data-exam-score />

      {/* Lista de verdad: las frases falladas son hermanas y en igualdad, y quien
          navegue con lector de pantalla necesita oír cuántas hay. */}
      <ul className="exam-results__wrong" data-exam-wrong />

      {/* Nace deshabilitado: cuando la última frase del bloque cae en la misma plana
          —número impar de frases—, esta hoja ya está a la vista ANTES de contestarla.
          `finalExam.ts` lo habilita a la vez que rellena la nota, nunca antes. */}
      <BookButton className="exam-results__continue" data-exam-continue="true" disabled>
        {isLastBlock ? 'Ver la nota final' : 'Siguiente bloque'}
      </BookButton>
    </div>
  )
}
