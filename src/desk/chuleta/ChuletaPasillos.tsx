import './ChuletaPasillos.scss'

export type PasilloId = 'hiragana' | 'katakana' | 'kanji'

interface Pasillo {
  id: PasilloId
  // El sello ya lleva su nombre dibujado dentro — ver `public/images/desk/cheatSheet/`—,
  // así que aquí solo hace falta para el texto alternativo.
  label: string
  sello: string
}

const PASILLOS: readonly Pasillo[] = [
  { id: 'hiragana', label: 'Hiragana', sello: '/images/desk/cheatSheet/sello-hiragana.png' },
  { id: 'katakana', label: 'Katakana', sello: '/images/desk/cheatSheet/sello-katakana.png' },
  { id: 'kanji', label: 'Kanji', sello: '/images/desk/cheatSheet/sello-kanji.png' },
]

interface ChuletaPasillosProps {
  active: PasilloId
  onSelect: (pasillo: PasilloId) => void
}

// Los tres sellos de pasillo: se elige uno a la vez, y solo el elegido se ve encendido — los
// otros dos se apagan un poco, no desaparecen. Katakana y kanji no llevan a ningún tomo
// todavía, pero eligen igual: es `ChuletaList` quien decide qué poner debajo, no este botón.
export function ChuletaPasillos({ active, onSelect }: ChuletaPasillosProps) {
  return (
    <ul className="chuleta-pasillos">
      {PASILLOS.map((pasillo) => (
        <li key={pasillo.id}>
          <button
            className={
              pasillo.id === active
                ? 'chuleta-pasillos__button chuleta-pasillos__button--active'
                : 'chuleta-pasillos__button'
            }
            type="button"
            aria-pressed={pasillo.id === active}
            onClick={() => onSelect(pasillo.id)}
          >
            <img src={pasillo.sello} alt={pasillo.label} draggable="false" />
          </button>
        </li>
      ))}
    </ul>
  )
}
