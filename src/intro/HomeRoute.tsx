import { Suspense, lazy, useCallback, useState } from 'react'
import { IntroToggle } from './IntroToggle'
import { IntroVideo } from './IntroVideo'
import { getAlwaysIntro, hasSeenIntro } from './introPreference'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// El video no espera al trozo de la entrada: se monta ya y se descarga mientras el otro carga
// detrás, y el fundido solo se hace cuando la entrada avisa de que está lista.
const LibraryEntrance = lazy(() =>
  import('../entrance/LibraryEntrance.tsx').then((m) => ({ default: m.LibraryEntrance })),
)

// Quien ha pedido verla siempre la ve aunque pida menos movimiento; la primera vez, no.
function shouldPlayIntro(): boolean {
  if (getAlwaysIntro()) return true
  return !hasSeenIntro() && !prefersReducedMotion()
}

export function HomeRoute() {
  // Se decide una vez al entrar: cambiar la preferencia con la intro en marcha no debe
  // quitarla ni ponerla.
  const [playing, setPlaying] = useState(shouldPlayIntro)
  const [entranceReady, setEntranceReady] = useState(false)
  const handleDone = useCallback(() => setPlaying(false), [])

  return (
    <>
      <Suspense fallback={null}>
        <LibraryEntrance onReady={() => setEntranceReady(true)} />
      </Suspense>

      <IntroToggle />

      {playing && <IntroVideo entranceReady={entranceReady} onDone={handleDone} />}
    </>
  )
}
