import { useEffect, useState } from 'react'
import { openAccountPanel } from '../account/accountPanelState'
import { useSession } from '../account/useSession'
import { onApiChange } from '../api/apiChanges'
import { fetchBadges, type Badge } from '../api/progress'
import { SiteNav } from '../shared/SiteNav'
import { DeskScene } from './DeskScene'
import './MyDesk.scss'

// Mi escritorio: la mesa propia, con lo que se ha ganado encima.
//
// ── Por qué pide cuenta ────────────────────────────────────────────────────
// Lo que se enseña aquí son las INSIGNIAS, y una insignia se guarda en la cuenta:
// sin ella el sello se queda en el navegador y no hay nada que enseñar —ver
// `api/progress.ts`—. Por eso quien llega sin sesión no ve una mesa vacía,
// que se leería como «no has hecho nada», sino la invitación a crear la cuenta que
// absorbe lo que ya lleva hecho.
//
// ── Por qué no calcula nada ────────────────────────────────────────────────
// Qué tomos están ganados lo dice el servidor, nunca el navegador. Es la misma
// regla que la estantería del pasillo: si lo decidiera la app, bastaría con tocar
// sus datos para llevarse la colección entera.
export function MyDesk() {
  const session = useSession()

  // Lo que ha llegado, y DE QUIÉN. Sin el dueño, al salir de una cuenta y entrar
  // en otra se verían un instante los tomos de la anterior: la lista ya está en
  // memoria y la nueva todavía no ha llegado. Con él, lo que no es de quien está
  // dentro no se enseña —ver `badges` abajo—, y así no hay que vaciarlo a mano
  // desde el efecto.
  const [loaded, setLoaded] = useState<{ accountId: string; badges: Badge[] | 'error' } | null>(
    null,
  )

  // null mientras llegan; `error` si no han llegado. Lo segundo se dice en vez de
  // enseñar una lista vacía, que se leería como «no tienes ninguno».
  const badges =
    session.account && loaded?.accountId === session.account.id ? loaded.badges : null

  useEffect(() => {
    // Sin sesión no hay a quién preguntar, y la respuesta sería siempre la lista
    // vacía.
    if (session.status !== 'signedIn') return

    let current = true
    const owner = session.account.id

    const load = () => {
      fetchBadges()
        .then((earned) => {
          if (current) setLoaded({ accountId: owner, badges: earned })
        })
        .catch(() => {
          if (current) setLoaded({ accountId: owner, badges: 'error' })
        })
    }

    load()

    // Y se vuelve a preguntar cuando algo del usuario cambia: sellar un tomo en
    // otra pestaña, o la subida de un sello que estaba pendiente, añade una
    // insignia que esta pantalla tiene que ver sin recargar. Ver `apiChanges.ts`.
    const stop = onApiChange(load)

    return () => {
      current = false
      stop()
    }
    // Por `account.id` y no por la sesión entera: lo que obliga a volver a pedir
    // las insignias es que sea OTRA persona, no que el objeto de sesión se haya
    // vuelto a crear.
  }, [session.status, session.account?.id])

  return (
    <main className="my-desk">
      <DeskScene />

      {/* Lo que se dice con palabras, por encima de la mesa. Va en su propia caja
          porque la escena se coloca en absoluto: sin un envoltorio colocado, la
          ilustración se pintaría encima del texto por el orden de pintado.
          Es también lo que irá menguando según los objetos ocupen su sitio. */}
      <div className="my-desk__content">
        <h1 className="my-desk__title">Mi escritorio</h1>

        {session.status === 'loading' ? (
          <p className="my-desk__note">Un momento…</p>
        ) : session.status === 'signedOut' ? (
          <section className="my-desk__invite">
            <p className="my-desk__note">
              Aquí se guardan los tomos que cierras, con su chuleta para repasarlos
              de un vistazo. Hace falta una cuenta: es donde viven las insignias.
            </p>

            {/* El motivo va con la llamada: el panel empieza por él en vez de
                presentarse solo. Ver `accountPanelState.ts`. */}
            <button
              className="my-desk__cta"
              type="button"
              onClick={() =>
                openAccountPanel('Crea tu cuenta para guardar aquí los tomos que cierres.')
              }
            >
              Crear cuenta
            </button>
          </section>
        ) : badges === null ? (
          <p className="my-desk__note">Buscando tus tomos…</p>
        ) : badges === 'error' ? (
          <p className="my-desk__note">No se han podido traer tus tomos.</p>
        ) : badges.length === 0 ? (
          <p className="my-desk__note">
            Todavía ninguno. Un tomo entra aquí al superar su examen final.
          </p>
        ) : (
          // Los objetos de la mesa todavía no están puestos: de momento, la lista
          // de lo ganado. Lo que manda es el dato, que es lo que no se puede
          // improvisar después.
          <ul className="my-desk__volumes">
            {badges.map((badge) => (
              <li className="my-desk__volume" key={badge.blockId}>
                Tomo {badge.volume}
              </li>
            ))}
          </ul>
        )}
      </div>

      <SiteNav />
    </main>
  )
}
