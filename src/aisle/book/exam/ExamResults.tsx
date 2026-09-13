import { BookButton } from '../parts/BookButton'
import './ExamResults.scss'

interface ExamResultsProps {
  examBlock: 1 | 2 | 3
  title: string
  // Solo el del bloque 3 dice «Ver la nota final»: los otros dos llevan al primer
  // ejercicio del bloque siguiente, y decirlo así se adelantaría al examen entero.
  isLastBlock: boolean
}

// La hoja de resultados de un bloque: nace vacía y con sus dos botones apagados.
// Evaluar es OBLIGATORIO antes de seguir —no se cuenta sola al terminar la última
// frase—, así que `finalExam.ts` solo la habilita cuando todas las frases del bloque
// ya están hechas, y solo entra en juego «Continuar» cuando se pulsa Evaluar.
export function ExamResults({ examBlock, title, isLastBlock }: ExamResultsProps) {
  return (
    <div className="exam-results" data-exam-results={examBlock}>
      <h3 className="exam-results__title">{title}</h3>

      <p className="exam-results__score" data-exam-score />

      {/* Lista de verdad: las frases falladas son hermanas y en igualdad, y quien
          navegue con lector de pantalla necesita oír cuántas hay. */}
      <ul className="exam-results__wrong" data-exam-wrong />

      {/* Nace deshabilitado: hasta que la última frase del bloque no está hecha no hay
          nada que evaluar. `finalExam.ts` lo habilita en cuanto lo está. */}
      <BookButton className="exam-results__evaluate" data-exam-evaluate="true" disabled>
        Evaluar
      </BookButton>

      {/* Nace deshabilitado también: sin evaluar no se puede pasar al bloque
          siguiente. Lo habilita el propio botón de arriba al pulsarlo. */}
      <BookButton className="exam-results__continue" data-exam-continue="true" disabled>
        {isLastBlock ? 'Ver la nota final' : 'Siguiente bloque'}
      </BookButton>
    </div>
  )
}
