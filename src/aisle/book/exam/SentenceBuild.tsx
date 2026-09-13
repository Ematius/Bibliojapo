import { useMemo } from 'react'
import type { Sentence } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import { pickCards } from '../parts/pickCards'
import './SentenceBuild.scss'

export type ExamCue = 'romaji' | 'meaning' | 'audio'

interface SentenceBuildProps {
  sentence: Sentence
  // Qué se da como pista: la lectura, el significado, o solo el sonido. Es lo único
  // que cambia entre los tres bloques del examen — el ejercicio es el mismo.
  cue: ExamCue
  // A qué bloque pertenece. Viaja en un atributo porque `finalExam.ts` agrupa las
  // frases por bloque para saber cuál es la última de cada uno, sin necesidad de
  // leer el DOM en el mismo orden en que React las montó.
  examBlock: 1 | 2 | 3
  // Para el «Frase X de 15» de arriba: en un examen conviene saber cuánto queda.
  index: number
  total: number
}

// Una frase entera por reconstruir, con tarjetas de un solo kana. Sin pool de
// distractores —decisión ya tomada para el examen final—: `pickCards` recibe un mazo
// vacío y solo entran los caracteres que hacen falta, sin repetir.
//
// AQUÍ NO SE CORRIGE NADA: ni al colocar una tarjeta ni al terminar la frase. Quien
// coloca lo hace `sentenceTiles.ts`, en silencio; quien puntúa es `finalExam.ts`, al
// pulsar «Hecho» y no antes. Por eso no hay `.result` como en `KanaMatch` o `WordGap`:
// no hay nada que anunciar en esta hoja.
export function SentenceBuild({ sentence, cue, examBlock, index, total }: SentenceBuildProps) {
  const tiles = useMemo(
    () => pickCards(sentence.units.map((unit) => unit.kana), []),
    [sentence],
  )

  const romaji = sentence.units.map((unit) => unit.romaji).join(' ')

  return (
    <div
      className="sentence-build"
      data-sentence={sentence.id}
      data-exam-block={examBlock}
      // Su posición dentro del bloque: `finalExam.ts` la usa para ordenar las frases
      // en el orden de LECTURA, que no es el orden del DOM —las hojas se montan al
      // revés, ver `VolumeReader`—.
      data-exam-index={index}
    >
      <p className="sentence-build__progress">
        Frase {index} de {total}
      </p>

      {cue === 'romaji' && <p className="sentence-build__cue">{romaji}</p>}
      {cue === 'meaning' && <p className="sentence-build__cue">{sentence.meaning}</p>}
      {/* Siempre en pantalla, aunque no haya grabación todavía: sin el botón, la hoja
          del bloque de audio no dice qué se pide. `mountBookAudio` ya sabe apagar un
          botón sin `data-audio` en vez de fingir que suena —ver `parts/bookAudio.ts`—,
          así que esto se completa solo en cuanto lleguen los audios. Ver
          `Sentence.audio` en `content/types.ts`. */}
      {cue === 'audio' && (
        <BookButton className="sentence-build__listen" data-audio={sentence.audio}>
          Escuchar
        </BookButton>
      )}

      <div className="sentence-build__written" lang="ja">
        {sentence.units.map((unit, index) => (
          // El hueco lo rellena `sentenceTiles.ts`, y libremente: aquí no hay
          // `--filled` permanente, se puede volver a pisar tantas veces como haga
          // falta hasta que se pulse «Siguiente».
          <span
            className="sentence-build__slot"
            data-answer={unit.kana}
            key={`${sentence.id}-${index}`}
          />
        ))}
      </div>

      <ul className="sentence-build__deck">
        {tiles.map((character) => (
          <li className="sentence-build__seat" key={character}>
            <BookButton
              className="sentence-build__tile"
              data-kana={character}
              lang="ja"
              aria-label={`Colocar el kana ${character}`}
            >
              {character}
            </BookButton>
          </li>
        ))}
      </ul>

      {/* «Hecho» y no «Siguiente»: pulsarlo no siempre pasa hoja —dos frases comparten
          plana, y hasta que no se envían las dos no hay a dónde ir—. Lo que sí hace
          siempre es cerrar esta frase: `finalExam.ts` la puntúa en silencio y la deja
          bloqueada, sin más cambios posibles. */}
      <BookButton className="sentence-build__next" data-exam-next="true">
        Hecho
      </BookButton>
    </div>
  )
}
