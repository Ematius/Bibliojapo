import { BookButton } from '../parts/BookButton'
import './ExamReveal.scss'

interface ExamRevealProps {
  // Los kana del tomo, para el título — la misma lista con la que se abrió el libro.
  characters: string[]
}

// La plana final: nace con solo el título y un botón. Las tres notas no se dan de
// golpe al llegar — hay que pedirlas, con «Ver evaluación completa», que es lo que
// dispara la animación de `finalExam.ts`. Si el tomo ya estaba sellado de antes, el
// propio examen se salta el botón y enseña el resultado sin animar: no hay nada que
// «ver aparecer» en algo que ya se sabía.
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

      <BookButton className="exam-reveal__show" data-exam-reveal-show="true">
        Ver evaluación completa
      </BookButton>

      {/* Todo lo de abajo nace oculto: `finalExam.ts` lo destapa al pulsar el botón de
          arriba, o de golpe si el tomo ya estaba sellado. */}
      <div className="exam-reveal__body" data-exam-reveal-body hidden>
        <hr className="exam-reveal__rule" />

        {/* Lista de verdad: las tres notas son hermanas y en igualdad. Vacía hasta que
            `finalExam.ts` la rellena, una entrada por bloque. */}
        <ol className="exam-reveal__blocks" data-exam-reveal-blocks />

        <hr className="exam-reveal__rule" />

        <div className="exam-reveal__final-row">
          <p className="exam-reveal__final" data-exam-reveal-final />

          {/* Solo si se aprueba: `finalExam.ts` lo destapa junto al sello, nunca solo. */}
          <p className="exam-reveal__stamp" data-exam-reveal-stamp hidden aria-hidden="true">
            Aprobado
          </p>

          {/* Verde si se aprueba, rojo si se suspende: `finalExam.ts` decide cuál de
              los dos —`green-seal.webp` / `red-seal.webp`— y pone la ruta aquí. La
              clase `exam-seal` es la misma que anima `examSeal.ts` en el examen de
              cada lección, reutilizada tal cual. */}
          <div
            className="exam-seal exam-reveal__seal"
            data-exam-reveal-seal
            role="img"
            aria-label="Resultado del examen final"
          >
            {/* Sin `src` todavía: un `""` le pediría al navegador la propia página
                como si fuera una imagen. `finalExam.ts` lo pone al evaluar. */}
            <img className="exam-seal__mark" data-exam-reveal-seal-img alt="" />
          </div>
        </div>

        {/* Lo único que explica un sello verde con una nota por debajo del 5: el
            examen se repasó y se suspendió, pero el tomo ya estaba sellado. Sin este
            aviso, el sello de al lado parece un error. */}
        <p className="exam-reveal__kept" data-exam-reveal-kept hidden>
          Era un repaso: el sello de este tomo ya estaba ganado y sigue en su sitio.
        </p>

        <BookButton className="exam-reveal__retry" data-exam-retry="true" hidden>
          Reintentar
        </BookButton>
      </div>
    </div>
  )
}
