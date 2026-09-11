import type { Kana, Word } from '../../../content/types'
import { KanaMatch } from '../matching/KanaMatch'
import { WordGap } from '../recognition/WordGap'
import './ExamSheet.scss'

interface ExamSheetProps {
  word: Word
  kana: Kana
  pool: string[]
  // Si esta hoja es la que se lleva el sello. Hay UNA en todo el tomo: la última
  // del examen final. El examen de cada lección usa esta misma hoja sin él.
  seal?: boolean
}

// La hoja que cierra el mini examen: colocar el kana en su palabra y, debajo,
// escribir la lectura entera. Y el sello, que cae aquí cuando las tres pruebas
// del examen —esta y la de la hoja de enfrente— están resueltas.
//
// No es un ejercicio nuevo escrito desde cero, igual que `WordDrill` tampoco lo
// era: es `KanaMatch` en su modo `word` y `WordGap` en su modo `all`, uno debajo
// del otro. Los dos ya existen y ya están cableados.
//
// ── Por qué estas dos y no las del repaso ──────────────────────────────────
// Porque se bastan solas. `KanaMatch` en modo `word` trae su propia pista —el
// significado— y su propio botón de escuchar, y eso es justo lo que el dictado de
// debajo necesita para no quedarse sin enunciado. En modo `build`, que es el que
// usa `WordDrill`, no hay ni pista ni audio: el enunciado vive en la hoja de
// enfrente, y en un examen la hoja de enfrente es otra pregunta, no una ayuda.
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
          <img className="exam-seal__mark" src="/images/sello.webp" alt="" />
        </div>
      ) : null}
    </div>
  )
}
