import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCurrentVolume, type CurrentVolume } from '../api/volumes'
import { onApiChange } from '../api/apiChanges'
import { aisleRoute, findAisle } from '../shared/aisles'

// Por dónde sigue la lectura: el primer tomo abierto que todavía no está sellado.
//
// Lo dice el servidor, no la app: depende de las insignias, que son suyas.
export function CurrentVolumeNote() {
  // `loading` mientras llega y `error` si no ha llegado. Lo que no puede pasar es
  // enseñar «lo has terminado todo» porque la llamada se haya caído.
  const [state, setState] = useState<CurrentVolume | null | 'error' | 'loading'>('loading')

  useEffect(() => {
    let current = true

    const ask = () => {
      fetchCurrentVolume()
        .then((volume) => {
          if (current) setState(volume)
        })
        .catch(() => {
          if (current) setState('error')
        })
    }

    ask()
    // Sellar un tomo mueve por dónde va. Sin esto, la nota se quedaría enseñando el
    // que se acaba de terminar.
    const stop = onApiChange(ask)

    return () => {
      current = false
      stop()
    }
  }, [])

  if (state === 'loading') return <p className="account-page__note">Buscando por dónde vas…</p>

  if (state === 'error') {
    return <p className="account-page__note">No se ha podido saber por dónde vas.</p>
  }

  if (state === null) {
    return (
      <p className="account-page__note">
        Has sellado todo lo que hay escrito. Lo siguiente está en camino.
      </p>
    )
  }

  const aisle = findAisle(state.aisleId)

  return (
    <p className="account-page__note">
      Tomo {state.volumeNumber} de {aisle?.label ?? state.aisleId}.{' '}
      <Link className="account-page__link" to={aisleRoute(state.aisleId)}>
        Seguir leyendo
      </Link>
    </p>
  )
}
