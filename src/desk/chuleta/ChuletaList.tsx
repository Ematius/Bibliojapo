import { useEffect, useState } from 'react'
import type { Badge } from '../../api/progress'
import { fetchBadges } from '../../api/progress'
import type { VolumeAccess } from '../../api/volumes'
import { BLOCK_PLAN } from '../../content/hiragana/blocks'
import { BLOCK_PLAN_KANA } from '../../content/hiragana/blockPlanKana'
import { useVolumeAccess } from '../../shared/useVolumeAccess'
import { ChuletaPasillos, type PasilloId } from './ChuletaPasillos'
import './ChuletaList.scss'

interface ChuletaListProps {
  onSelect: (blockId: string) => void
}

// Cómo se lee un tomo: ganado, al alcance pero sin ganar todavía, o fuera de alcance. De
// esto salen el sello, el fondo y si se puede pulsar — nunca al revés.
type TomoState = 'completado' | 'pendiente' | 'bloqueado'

function tomoState(access: VolumeAccess | undefined, passed: boolean): TomoState {
  if (passed) return 'completado'
  // «Abierto» es poder LEER el tomo, no haberlo aprobado: el bloque 1 está abierto desde el
  // primer momento aunque todavía no se haya cerrado.
  if (access === 'open') return 'pendiente'
  return 'bloqueado'
}

const STATE_LABEL: Record<TomoState, string> = {
  completado: 'Completado',
  pendiente: 'Pendiente',
  bloqueado: 'Bloqueado',
}

// El candado ya va dibujado en el fondo de un tomo bloqueado: no le hace falta sello.
const STATE_STAMP: Partial<Record<TomoState, string>> = {
  completado: '/images/sello-verde.webp',
  pendiente: '/images/sello-rojo.webp',
}

// La misma hoja que enseña `deskArt.ts` como papel de la mesa: la caja de esta lista es más
// grande que esa silueta —ver `faceScale` en `DeskArt`—, así que sin pintar aquí su propio
// papel se saldría del que hay debajo y enseñaría la mesa por los bordes.
const SHEET_PAPER = '/images/desk/cheatSheet/hoja.webp'

const TICKET_APPROVED = '/images/desk/cheatSheet/tarjeta-tomo-aprovado.webp'
const TICKET_LOCKED = '/images/desk/cheatSheet/tarjeta-tomo-cerrada.webp'

const TICKET_BG: Record<TomoState, string> = {
  completado: TICKET_APPROVED,
  pendiente: TICKET_APPROVED,
  bloqueado: TICKET_LOCKED,
}

const PASILLO_TITLE: Record<PasilloId, string> = {
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
export function ChuletaList({ onSelect }: ChuletaListProps) {
  const [pasillo, setPasillo] = useState<PasilloId>('hiragana')
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
    <div className="chuleta-list" style={{ backgroundImage: `url('${SHEET_PAPER}')` }}>
      <h3 className="chuleta-list__title">{PASILLO_TITLE[pasillo]}</h3>

      <ChuletaPasillos active={pasillo} onSelect={setPasillo} />

      {pasillo !== 'hiragana' ? (
        <p className="chuleta-list__note">
          Todavía no hay tomos de {PASILLO_TITLE[pasillo]}.
        </p>
      ) : (
        <ul className="chuleta-list__volumes">
          {BLOCK_PLAN.map((blockId, index) => {
            const state = tomoState(access.get(blockId), passedIds.has(blockId))
            const characters = BLOCK_PLAN_KANA[blockId]
            const stamp = STATE_STAMP[state]
            const clickable = state === 'completado'

            return (
              <li className="chuleta-list__item" key={blockId}>
                <button
                  className={`chuleta-list__volume chuleta-list__volume--${state}`}
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelect(blockId)}
                  style={{ backgroundImage: `url('${TICKET_BG[state]}')` }}
                >
                  {stamp ? (
                    <img className="chuleta-list__stamp" src={stamp} alt="" />
                  ) : null}

                  <span className="chuleta-list__volume-title">Tomo {index + 1}</span>

                  {characters ? (
                    <span className="chuleta-list__volume-kana" lang="ja">
                      {characters.join('・')}
                    </span>
                  ) : null}

                  <span className="chuleta-list__volume-status">{STATE_LABEL[state]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
