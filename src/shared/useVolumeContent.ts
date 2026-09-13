import { useCallback, useEffect, useState } from 'react'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { fetchVolume, type VolumeContent } from '../api/volumes'

export type VolumeLoad =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; content: VolumeContent }
  | { status: 'error'; code: ApiErrorCode }

// Cómo acabó la última petición. La espera no se guarda: se deduce de que se quiere el tomo
// y todavía no hay respuesta.
type Outcome =
  | { status: 'ready'; content: VolumeContent }
  | { status: 'error'; code: ApiErrorCode; attempt: number }

// El contenido de un tomo, pedido al servidor.
//
// Se pide en cuanto alguien COGE el tomo, no al abrirlo: entre sacarlo de la balda y que el
// libro termine de abrirse pasan casi dos segundos de giros, así que la espera no se llega a
// ver. Una vez llegado se guarda mientras el tomo siga en la estantería.
export function useVolumeContent(blockId: string, wanted: boolean) {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  // Cada reintento cuenta uno: es lo que vuelve a disparar la petición tras un fallo.
  const [attempt, setAttempt] = useState(0)

  const ready = outcome?.status === 'ready'
  const failed = outcome?.status === 'error' && outcome.attempt === attempt

  useEffect(() => {
    if (!wanted || ready || failed) return

    // La respuesta de una petición que ya no hace falta —el tomo volvió a la balda— se tira.
    let current = true

    fetchVolume(blockId)
      .then((content) => {
        if (current) setOutcome({ status: 'ready', content })
      })
      .catch((error: unknown) => {
        if (current) setOutcome({ status: 'error', code: apiErrorCode(error), attempt })
      })

    return () => {
      current = false
    }
  }, [blockId, wanted, ready, failed, attempt])

  const retry = useCallback(() => setAttempt((count) => count + 1), [])

  const load: VolumeLoad =
    outcome?.status === 'ready'
      ? outcome
      : failed && outcome?.status === 'error'
        ? { status: 'error', code: outcome.code }
        : wanted
          ? { status: 'loading' }
          : { status: 'idle' }

  return { load, retry }
}
