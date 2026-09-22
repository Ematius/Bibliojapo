import { useEffect, useState } from 'react'
import type { Badge } from '../../api/progress'
import { fetchBadges } from '../../api/progress'
import type { VolumeAccess } from '../../api/volumes'
import { BLOCK_PLAN } from '../../content/hiragana/blocks'
import { BLOCK_PLAN_KANA } from '../../content/hiragana/blockPlanKana'
import { useVolumeAccess } from '../../shared/useVolumeAccess'
import { CheatSheetAisles, type CheatSheetAisleId } from './CheatSheetAisles'
import './CheatSheetList.scss'

interface CheatSheetListProps {
  onSelect: (blockId: string) => void
}

// Cómo se lee un tomo: ganado, al alcance pero sin ganar todavía, o fuera de alcance. De
// esto salen el sello, el fondo y si se puede pulsar — nunca al revés.
type VolumeState = 'completed' | 'pending' | 'locked'

function volumeState(access: VolumeAccess | undefined, passed: boolean): VolumeState {
  if (passed) return 'completed'
  // «Abierto» es poder LEER el tomo, no haberlo aprobado: el bloque 1 está abierto desde el
  // primer momento aunque todavía no se haya cerrado.
  if (access === 'open') return 'pending'
  return 'locked'
}

const STATE_LABEL: Record<VolumeState, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  locked: 'Bloqueado',
}

// El candado ya va dibujado en el fondo de un tomo bloqueado: no le hace falta sello.
const STATE_STAMP: Partial<Record<VolumeState, string>> = {
  completed: '/images/green-seal.webp',
  pending: '/images/red-seal.webp',
}

// La misma hoja que enseña `deskArt.ts` como papel de la mesa: la caja de esta lista es más
// grande que esa silueta —ver `faceScale` en `DeskArt`—, así que sin pintar aquí su propio
// papel se saldría del que hay debajo y enseñaría la mesa por los bordes.
const SHEET_PAPER = '/images/desk/cheatSheet/sheet.webp'

const TICKET_APPROVED = '/images/desk/cheatSheet/volume-ticket-approved.webp'
const TICKET_LOCKED = '/images/desk/cheatSheet/volume-ticket-locked.webp'

const TICKET_BG: Record<VolumeState, string> = {
  completed: TICKET_APPROVED,
  pending: TICKET_APPROVED,
  locked: TICKET_LOCKED,
}

const AISLE_TITLE: Record<CheatSheetAisleId, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
}

// La lista de tomos, con el selector de pasillo integrado arriba: es la pantalla raíz de la
// chuleta, la que se ve nada más levantar la hoja.
//
// Solo hiragana tiene tomos que enseñar hoy — es el único pasillo con `BLOCK_PLAN`—, así que
// elegir katakana o kanji se ve y responde, pero no hay nada que poner debajo todavía. Es la
// misma regla del «todavía no» que un tomo sin escribir: se ve, nunca desaparece.
//
// Ganado, al alcance o fuera de él lo dice el mismo mapa que abre un tomo en la
// estantería —ver `shared/useVolumeAccess.ts`—; que esté GANADO de verdad, y no solo
// alcanzable, lo dicen las insignias. Son dos preguntas distintas y hacen falta las dos: el
// tomo 1 está siempre «abierto» en cuanto hay cuenta, aunque todavía no se haya cerrado.
export function CheatSheetList({ onSelect }: CheatSheetListProps) {
  const [aisle, setAisle] = useState<CheatSheetAisleId>('hiragana')
  const access = useVolumeAccess()

  // null mientras llegan. Sin ellas no se puede distinguir un tomo «pendiente» de uno
  // «completado», así que hasta que lleguen ningún tomo se da por aprobado.
  const [badges, setBadges] = useState<Badge[] | null>(null)

  useEffect(() => {
    let current = true

    fetchBadges()
      .then((earned) => {
        if (current) setBadges(earned)
      })
      .catch(() => {
        // Sin insignias no se marca nada como completado de más: se queda como «pendiente»,
        // que es lo prudente mientras no se sabe.
      })

    return () => {
      current = false
    }
  }, [])

  const passedIds = new Set((badges ?? []).map((badge) => badge.blockId))

  return (
    <div className="cheat-sheet-list" style={{ backgroundImage: `url('${SHEET_PAPER}')` }}>
      <h3 className="cheat-sheet-list__title">{AISLE_TITLE[aisle]}</h3>

      <CheatSheetAisles active={aisle} onSelect={setAisle} />

      {aisle !== 'hiragana' ? (
        <p className="cheat-sheet-list__note">
          Todavía no hay tomos de {AISLE_TITLE[aisle]}.
        </p>
      ) : (
        <ul className="cheat-sheet-list__volumes">
          {BLOCK_PLAN.map((blockId, index) => {
            const state = volumeState(access.get(blockId), passedIds.has(blockId))
            const characters = BLOCK_PLAN_KANA[blockId]
            const stamp = STATE_STAMP[state]
            const clickable = state === 'completed'

            return (
              <li className="cheat-sheet-list__item" key={blockId}>
                <button
                  className={`cheat-sheet-list__volume cheat-sheet-list__volume--${state}`}
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelect(blockId)}
                  style={{ backgroundImage: `url('${TICKET_BG[state]}')` }}
                >
                  {stamp ? (
                    <img className="cheat-sheet-list__stamp" src={stamp} alt="" />
                  ) : null}

                  <span className="cheat-sheet-list__volume-title">Tomo {index + 1}</span>

                  {characters ? (
                    <span className="cheat-sheet-list__volume-kana" lang="ja">
                      {characters.join('・')}
                    </span>
                  ) : null}

                  <span className="cheat-sheet-list__volume-status">{STATE_LABEL[state]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
