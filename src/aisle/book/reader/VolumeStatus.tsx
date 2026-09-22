import type { ApiErrorCode } from '../../../api/apiError'
import { BookButton } from '../parts/BookButton'
import type { VolumeLoad } from '../../../shared/useVolumeContent'
import './VolumeStatus.scss'

interface VolumeStatusProps {
  load: Exclude<VolumeLoad, { status: 'ready' }>
  onRetry: () => void
}

// Ninguno habla de fallos internos: quien lee solo necesita saber si reintentar sirve de algo.
const FAILURES: Record<ApiErrorCode, string> = {
  network: 'No se han podido traer las hojas. Comprueba la conexión.',
  unauthorized: 'Este tomo se abre con una cuenta.',
  forbidden: 'Este tomo todavía no está abierto para ti.',
  'not-found': 'Este tomo todavía se está escribiendo.',
  'missing-name': 'No se han podido traer las hojas.',
  'invalid-email': 'No se han podido traer las hojas.',
  'weak-password': 'No se han podido traer las hojas.',
  'email-taken': 'No se han podido traer las hojas.',
  'wrong-credentials': 'No se han podido traer las hojas.',
  'empty-message': 'No se han podido traer las hojas.',
}

// Lo que ocupa el papel del libro abierto mientras sus hojas no están. Casi nunca se ve;
// existe para cuando la conexión va lenta o falla, donde lo peor sería un libro abierto en
// blanco, que se lee como roto.
//
// Aquí el botón SÍ lleva onClick de React: este papel no es de page-flip —las hojas todavía
// no existen—, así que nadie clona nada.
export function VolumeStatus({ load, onRetry }: VolumeStatusProps) {
  if (load.status !== 'error') {
    return (
      <div className="volume-status">
        <p className="volume-status__text volume-status__text--waiting">Buscando las hojas…</p>
      </div>
    )
  }

  // Reintentar solo tiene sentido si lo que falló fue la conexión: un tomo sin escribir o sin
  // ganar no se arregla pulsando otra vez.
  const retryable = load.code === 'network'

  return (
    <div className="volume-status" role="alert">
      <p className="volume-status__text">{FAILURES[load.code]}</p>
      {retryable ? (
        <BookButton className="volume-status__retry" onClick={onRetry}>
          Volver a intentarlo
        </BookButton>
      ) : null}
    </div>
  )
}
