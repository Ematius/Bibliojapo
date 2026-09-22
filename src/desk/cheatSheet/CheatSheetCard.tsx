import { useRef, useState } from 'react'
import { BookButton } from '../../aisle/book/parts/BookButton'
import { wordText, wordReading } from '../../content/types'
import { useVolumeContent } from '../../shared/useVolumeContent'
import { useCheatSheetReveal } from './useCheatSheetReveal'
import './CheatSheetCard.scss'

const SHEET_PAPER = '/images/desk/cheatSheet/sheet.webp'

const BACK_ICON = '/images/desk/cheatSheet/back.webp'
const FLIP_ICON = '/images/desk/cheatSheet/flip.webp'

interface CheatSheetCardProps {
  blockId: string
  // Vuelve a la lista de tomos.
  onClose: () => void
  // Lo lleva `CheatSheetPanel` y no esta tarjeta: solo la hoja sabe si está levantada. Ver
  // `useCheatSheetReveal.ts`.
  lifted: boolean
}

// Sin `src`, `new Audio('')` intentaría cargar la propia página y avisaría por consola. No es
// un hook ni pasa por page-flip: la chuleta del escritorio es React normal, así que el clic
// suena en el sitio donde se pulsa.
function playAudio(src?: string) {
  if (!src) return
  const audio = new Audio(src)
  void audio.play().catch(() => {})
}

// Una entrada de la chuleta: lo escrito en japonés y su botón de sonido. `data-dust` marca el
// texto que `useCheatSheetReveal` parte en letras sueltas; `data-dust-trim` marca lo que solo
// aparece con un fundido, sin escribirse.
function CheatSheetLine({ text, audio, label }: { text: string; audio?: string; label: string }) {
  return (
    <li className="cheat-sheet-card__line">
      <span className="cheat-sheet-card__written" lang="ja" data-dust>
        {text}
      </span>

      <BookButton
        className="cheat-sheet-card__listen"
        data-dust-trim
        aria-label={`Escuchar ${label}`}
        onClick={() => playAudio(audio)}
      >
        ♪
      </BookButton>
    </li>
  )
}

// La chuleta de un tomo: delante el japonés con su sonido, detrás la misma lista en rōmaji y
// en español. Es la misma tarjeta que el regalo del examen final —mismo papel, mismo giro,
// mismo polvo dorado al escribirse—, pero vive aquí porque aquélla se lee una vez, al cerrar
// el tomo, y esta se vuelve a abrir todas las veces que haga falta repasar.
export function CheatSheetCard({ blockId, onClose, lifted }: CheatSheetCardProps) {
  const { load } = useVolumeContent(blockId, true)
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)

  useCheatSheetReveal({ cardRef, frontRef, flipped, lifted })

  const backButton = (
    <button
      className="cheat-sheet-card__back"
      type="button"
      onClick={onClose}
      aria-label="Volver a los tomos"
    >
      <img src={BACK_ICON} alt="" draggable="false" />
    </button>
  )

  if (load.status !== 'ready') {
    return (
      <div className="cheat-sheet-card cheat-sheet-card--loading">
        {backButton}
        <p className="cheat-sheet-card__note">
          {load.status === 'error' ? 'No se ha podido traer esta chuleta.' : 'Buscando la chuleta…'}
        </p>
      </div>
    )
  }

  const { block, kana, words: knownWords, sentences } = load.content
  const wordsById = new Map(knownWords.map((word) => [word.id, word]))
  // Solo las que el tomo PROMETE, no las que además arrastran sus frases: la chuleta resume
  // el tomo entero, igual que el regalo del examen final.
  const words = block.wordIds.flatMap((id) => wordsById.get(id) ?? [])
  const readings = kana.map((k) => k.romaji)

  return (
    <div className="cheat-sheet-card">
      {backButton}

      <div className="cheat-sheet-card__stage">
        <div className="cheat-sheet-card__flip" ref={cardRef}>
          <div
            className="cheat-sheet-card__face cheat-sheet-card__face--front"
            style={{ backgroundImage: `url('${SHEET_PAPER}')` }}
            ref={frontRef}
          >
            <h3 className="cheat-sheet-card__title">
              Chuleta de{' '}
              <span className="cheat-sheet-card__title-kana" lang="ja" data-dust>
                {kana.map((k) => k.character).join('・')}
              </span>
            </h3>

            <h4 className="cheat-sheet-card__heading" data-dust-trim>
              Palabras
            </h4>
            <ul className="cheat-sheet-card__list cheat-sheet-card__list--words">
              {words.map((word) => (
                <CheatSheetLine
                  text={wordText(word)}
                  audio={word.audio}
                  label={word.meaning}
                  key={word.id}
                />
              ))}
            </ul>

            <h4 className="cheat-sheet-card__heading" data-dust-trim>
              Frases
            </h4>
            <ul className="cheat-sheet-card__list cheat-sheet-card__list--sentences">
              {sentences.map((sentence) => (
                <CheatSheetLine
                  text={sentence.text}
                  audio={sentence.audio}
                  label={sentence.meaning}
                  key={sentence.id}
                />
              ))}
            </ul>
          </div>

          <div
            className="cheat-sheet-card__face cheat-sheet-card__face--back"
            style={{ backgroundImage: `url('${SHEET_PAPER}')` }}
          >
            <h3 className="cheat-sheet-card__title">Chuleta de {readings.join('-')}</h3>

            <h4 className="cheat-sheet-card__heading">Palabras</h4>
            <ul className="cheat-sheet-card__list">
              {words.map((word) => (
                <li className="cheat-sheet-card__line" key={word.id}>
                  <span className="cheat-sheet-card__reading">{wordReading(word)}</span>
                  <span className="cheat-sheet-card__meaning">{word.meaning}</span>
                </li>
              ))}
            </ul>

            <h4 className="cheat-sheet-card__heading">Frases</h4>
            <ul className="cheat-sheet-card__list">
              {sentences.map((sentence) => (
                <li className="cheat-sheet-card__line" key={sentence.id}>
                  <span className="cheat-sheet-card__reading">
                    {sentence.units.map((unit) => unit.romaji).join(' ')}
                  </span>
                  <span className="cheat-sheet-card__meaning">{sentence.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button
        className="cheat-sheet-card__flip-button"
        type="button"
        onClick={() => setFlipped((was) => !was)}
        aria-label={flipped ? 'Ver el hiragana' : 'Darle la vuelta a la chuleta'}
      >
        <img src={FLIP_ICON} alt="" draggable="false" />
      </button>
    </div>
  )
}
