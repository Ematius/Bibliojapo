import { BookButton } from '../parts/BookButton'
import './ExamReveal.scss'

interface ExamRevealProps {
  // Los kana del tomo, para el título — la misma lista con la que se abrió el libro.
  characters: string[]
}

// La plana final: nace casi vacía y `finalExam.ts` la anima con GSAP en cuanto se
// termina el tercer bloque —o de golpe y sin animar, si el sello ya estaba puesto de
// antes—. Aquí solo está el papel: las tres notas, la nota final, el sello y el botón
// de reintentar los rellena y los muestra el propio examen.
export function ExamReveal({ characters }: ExamRevealProps) {
  return (
    <div className="exam-reveal" data-exam-reveal>
      <p className="exam-reveal__kana" lang="ja">
        {characters.map((character) => (
          <span className="exam-reveal__kana-item" key={character}>
            {character}
          </span>
        ))}
      </p>

      <h2 className="exam-reveal__title">Nota final del tomo</h2>

      <hr className="exam-reveal__rule" />

      {/* Lista de verdad: las tres notas son hermanas y en igualdad. Vacía hasta que
          `finalExam.ts` la rellena, una entrada por bloque. */}
      <ol className="exam-reveal__blocks" data-exam-reveal-blocks />

      <hr className="exam-reveal__rule" />

      <div className="exam-reveal__final-row">
        <p className="exam-reveal__final" data-exam-reveal-final />

        {/* Mismo sello que `ExamSheet`, misma clase —`examSeal.ts` la anima igual—,
            pero en el flujo normal de la hoja y no clavado a una esquina: aquí no
            hay ejercicios debajo a los que taparles la respuesta. */}
        <div
          className="exam-seal exam-reveal__seal"
          data-exam-reveal-seal
          role="img"
          aria-label="Examen final superado"
        >
          <img className="exam-seal__mark" src="/images/sello.webp" alt="" />
        </div>
      </div>

      <BookButton className="exam-reveal__retry" data-exam-retry="true" hidden>
        Reintentar
      </BookButton>
    </div>
  )
}
