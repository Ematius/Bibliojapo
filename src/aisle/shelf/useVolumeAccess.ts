import { useEffect, useState, useSyncExternalStore } from 'react'
import { getSession, subscribeSession } from '../../api/account'
import { onApiChange } from '../../api/apiChanges'
import { FREE_BLOCK_ID, fetchVolumeAccess, type VolumeAccess } from '../../api/volumes'
import { VOLUME_LOCK } from './shelfConfig'

// Mientras no se sabe nada, solo el tomo gratuito está abierto: los demás no figuran, y
// quien lee el mapa los trata como pendientes.
const FREE_ONLY: ReadonlyMap<string, VolumeAccess> = new Map([[FREE_BLOCK_ID, 'open']])

// Se vuelve a preguntar cada vez que cambia algo del usuario, así que el tomo siguiente
// se enciende solo al sellar el anterior. No pregunta hasta saber si hay sesión: con la
// sesión por llegar, el tomo 2 de alguien con cuenta saldría medio segundo pidiéndosela.
export function useVolumeAccess(): ReadonlyMap<string, VolumeAccess> {
  const session = useSyncExternalStore(subscribeSession, getSession)
  const [access, setAccess] = useState(FREE_ONLY)
  const [changes, setChanges] = useState(0)

  useEffect(() => onApiChange(() => setChanges((count) => count + 1)), [])

  useEffect(() => {
    if (session.status === 'loading') return

    // Cada pregunta es de su render: una respuesta vieja que llegue después de una nueva se
    // tira, o dos cambios seguidos podrían acabar enseñando el estado del primero.
    let current = true
    let retry: ReturnType<typeof setTimeout> | undefined

    const load = () => {
      fetchVolumeAccess()
        .then((next) => {
          if (current) setAccess(next)
        })
        .catch(() => {
          // Sin respuesta se deja lo que había: los tomos ni se abren ni se cierran por un
          // fallo de conexión.
          if (current) retry = setTimeout(load, VOLUME_LOCK.retrySeconds * 1000)
        })
    }

    load()

    return () => {
      current = false
      clearTimeout(retry)
    }
  }, [session.status, changes])

  return access
}
