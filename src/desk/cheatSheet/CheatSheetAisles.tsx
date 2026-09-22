import './CheatSheetAisles.scss'

export type CheatSheetAisleId = 'hiragana' | 'katakana' | 'kanji'

interface AisleSeal {
  id: CheatSheetAisleId
  // El sello ya lleva su nombre dibujado dentro — ver `public/images/desk/cheatSheet/`—,
  // así que aquí solo hace falta para el texto alternativo.
  label: string
  seal: string
}

const AISLE_SEALS: readonly AisleSeal[] = [
  { id: 'hiragana', label: 'Hiragana', seal: '/images/desk/cheatSheet/seal-hiragana.webp' },
  { id: 'katakana', label: 'Katakana', seal: '/images/desk/cheatSheet/seal-katakana.webp' },
  { id: 'kanji', label: 'Kanji', seal: '/images/desk/cheatSheet/seal-kanji.webp' },
]

interface CheatSheetAislesProps {
  active: CheatSheetAisleId
  onSelect: (aisle: CheatSheetAisleId) => void
}

// Los tres sellos de pasillo: se elige uno a la vez, y solo el elegido se ve encendido — los
// otros dos se apagan un poco, no desaparecen. Katakana y kanji no llevan a ningún tomo
// todavía, pero eligen igual: es `CheatSheetList` quien decide qué poner debajo, no este botón.
export function CheatSheetAisles({ active, onSelect }: CheatSheetAislesProps) {
  return (
    <ul className="cheat-sheet-aisles">
      {AISLE_SEALS.map((aisle) => (
        <li key={aisle.id}>
          <button
            className={
              aisle.id === active
                ? 'cheat-sheet-aisles__button cheat-sheet-aisles__button--active'
                : 'cheat-sheet-aisles__button'
            }
            type="button"
            aria-pressed={aisle.id === active}
            onClick={() => onSelect(aisle.id)}
          >
            <img src={aisle.seal} alt={aisle.label} draggable="false" />
          </button>
        </li>
      ))}
    </ul>
  )
}
