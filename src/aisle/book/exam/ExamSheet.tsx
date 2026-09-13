import type { Kana, Word } from '../../../content/types'
import { KanaMatch } from '../matching/KanaMatch'
import { WordGap } from '../recognition/WordGap'
import './ExamSheet.scss'

interface ExamSheetProps {
  word: Word
  kana: Kana
  pool: string[]
  // Hay UNA en todo el tomo: la última del examen final. El examen de cada lección usa esta
  // misma hoja sin él.
  seal?: boolean
}

// La hoja que cierra el examen: colocar el kana en su palabra y, debajo, escribir la lectura
// entera. No es un ejercicio nuevo: es `KanaMatch` en modo `word` y `WordGap` en modo `all`.
//
// Estas dos y no las del repaso porque se bastan solas: `KanaMatch` en modo `word` trae su
// propia pista y su propio botón de escuchar, que es lo que el dictado de debajo necesita
// para no quedarse sin enunciado. En modo `build` el enunciado vive en la hoja de enfrente,
// y en un examen la hoja de enfrente es otra pregunta, no una ayuda.
export function ExamSheet({ word, kana, pool, seal = false }: ExamSheetProps) {
  return (
    <div className="exam-sheet">
      <section className="exam-sheet__task">
        <KanaMatch word={word} kana={kana} scope="word" pool={pool} />
      </section>

      <hr className="exam-sheet__divider" />

      {/* Con rótulo, como en `WordDrill`. Sin él, los huecos vacíos debajo de la
          palabra no decían en qué había que escribir: con «aoi» se adivina, pero
          con palabras más largas y kana más parecidos, rōmaji o kana deja de ser
          obvio. Decir QUÉ se escribe no es ayudar a contestar. */}
      <section className="exam-sheet__task">
        <h3 className="exam-sheet__label">Escribe en rōmaji</h3>
        <WordGap word={word} kana={kana} scope="all" />
      </section>

      {/* El sello, solo en la hoja que cierra el tomo. Nace invisible y lo saca
          `examSeal.ts` cuando el examen final está entero: aquí solo está el papel
          donde va a caer.

          Fuera del flujo —posicionado sobre la hoja— porque un sello no empuja el
          texto que hay debajo: se estampa ENCIMA, que es lo que hace un sello. */}
      {seal ? (
        <div className="exam-seal" role="img" aria-label="Examen final superado">
          <img className="exam-seal__mark" src="/images/sello-verde.webp" alt="" />
        </div>
      ) : null}
    </div>
  )
}
