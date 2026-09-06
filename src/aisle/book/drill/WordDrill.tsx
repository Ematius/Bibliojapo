import type { Kana, Word } from '../../../content/types'
import { KanaMatch } from '../matching/KanaMatch'
import { WordGap } from '../recognition/WordGap'
import './WordDrill.scss'

interface WordDrillProps {
  word: Word
  kana: Kana
  // Se pasa tal cual a las tarjetas de dentro: esta hoja no decide nada sobre
  // ellas, solo las coloca. Ver `pickCards`.
  pool: string[]
}

// Las dos preguntas del repaso, en la misma hoja: reconstruir la palabra con las
// tarjetas y, debajo, escribir su lectura completa en rōmaji.
//
// Van juntas porque comprueban las dos mitades de leer: ESCRIBIR la palabra
// —sabiendo qué forma tiene cada sonido— y LEERLA —sabiendo qué sonido tiene cada
// forma—. La hoja de enfrente ya dio el enunciado sin ninguna letra —ver
// `WordPrompt`—, así que aquí las dos preguntas parten de cero por igual.
//
// No es un ejercicio nuevo escrito desde cero: es `KanaMatch` en su modo `build` y
// `WordGap` en su modo `all`, uno debajo del otro. Los dos ya existen, ya están
// cableados —page-flip los clona igual estando solos o compuestos aquí dentro— y
// ninguno sabe que comparte hoja con el otro.
export function WordDrill({ word, kana, pool }: WordDrillProps) {
  return (
    <div className="word-drill">
      <section className="word-drill__task">
        <h3 className="word-drill__label">Une las tarjetas</h3>
        <KanaMatch word={word} kana={kana} scope="build" pool={pool} />
      </section>

      <hr className="word-drill__divider" />

      <section className="word-drill__task">
        <h3 className="word-drill__label">Escribe en rōmaji</h3>
        <WordGap word={word} kana={kana} scope="all" />
      </section>
    </div>
  )
}
