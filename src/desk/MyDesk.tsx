import { useEffect, useState } from 'react'
import { openAccountPanel } from '../account/accountPanelState'
import { useSession } from '../account/useSession'
import { onApiChange } from '../api/apiChanges'
import { fetchBadges, fetchJourney, type Badge, type JourneyTrack } from '../api/progress'
import { SiteNav } from '../shared/SiteNav'
import { DeskObject } from './DeskObject'
import { DeskScene } from './DeskScene'
import { JourneyCard } from './JourneyCard'
import { DESK_ART } from './deskArt'
import { DESK_SPOTS, SHOW_EVERY_OBJECT } from './deskSpots'
import './MyDesk.scss'

// Mi escritorio: la mesa propia, con lo que se ha ganado encima.
//
// Pide cuenta porque lo que se enseña son las INSIGNIAS, y una insignia se guarda en la
// cuenta. Quien llega sin sesión no ve una mesa vacía, que se leería como «no has hecho
// nada», sino la invitación a crear la cuenta que absorbe lo que ya lleva hecho.
//
// Qué tomos están ganados lo dice el servidor, nunca el navegador: la misma regla que la
// estantería del pasillo.
export function MyDesk() {
  const session = useSession()

  // Lo que ha llegado, y DE QUIÉN. Sin el dueño, al salir de una cuenta y entrar en otra se
  // verían un instante los tomos de la anterior: la lista ya está en memoria y la nueva
  // todavía no ha llegado.
  const [loaded, setLoaded] = useState<{
    accountId: string
    badges: Badge[] | 'error'
    // Viaja con las insignias y no aparte porque es del mismo dueño y cambia por lo mismo:
    // sellar un tomo mueve las dos cosas.
    journey: JourneyTrack[] | null
  } | null>(null)

  // Lo que se contesta al pulsar un objeto cuyo destino todavía no existe. Se borra al
  // cambiar de objeto.
  const [note, setNote] = useState<string | null>(null)

  // Cuál está levantado. Lo lleva la pantalla y no cada objeto porque solo puede haber uno
  // enfrente: con el estado repartido, pulsar el segundo dejaría los dos en el aire.
  const [lifted, setLifted] = useState<keyof typeof DESK_SPOTS | null>(null)

  // El aviso viaja con el objeto: se enciende al levantarlo y se apaga al dejarlo, así que
  // nunca queda un «todavía no» suelto hablando de algo que ya no está enfrente.
  const press = (id: keyof typeof DESK_SPOTS, pending: string | null = null) => {
    const next = lifted === id ? null : id
    setLifted(next)
    setNote(next ? pending : null)
  }

  // null mientras llegan; `error` si no han llegado. Se dice en vez de enseñar una lista
  // vacía, que se leería como «no tienes ninguno».
  const mine = session.account && loaded?.accountId === session.account.id ? loaded : null
  const badges = mine ? mine.badges : null
  const journey = mine ? mine.journey : null

  useEffect(() => {
    // Sin sesión no hay a quién preguntar.
    if (session.status !== 'signedIn') return

    let current = true
    const owner = session.account.id

    const load = () => {
      // Las dos a la vez: son preguntas independientes, y encadenadas tardarían el doble.
      Promise.all([fetchBadges(), fetchJourney().catch(() => null)])
        .then(([earned, journey]) => {
          if (current) setLoaded({ accountId: owner, badges: earned, journey })
        })
        .catch(() => {
          if (current) setLoaded({ accountId: owner, badges: 'error', journey: null })
        })
    }

    load()

    // Se vuelve a preguntar cuando algo del usuario cambia: sellar un tomo en otra pestaña
    // añade una insignia que esta pantalla tiene que ver sin recargar.
    const stop = onApiChange(load)

    return () => {
      current = false
      stop()
    }
    // Por `account.id` y no por la sesión entera: lo que obliga a volver a pedir las insignias
    // es que sea OTRA persona, no que el objeto de sesión se haya vuelto a crear.
  }, [session.status, session.account?.id])

  // El carné está siempre que haya sesión —es la cuenta misma—; la hoja y la caja solo cuando
  // hay algo detrás que enseñar. Las dos todavía no llevan a ninguna parte: al pulsarlas dicen
  // que se están escribiendo. Lo que no puede pasar es que una puerta se abra a un sitio vacío.
  const earned = SHOW_EVERY_OBJECT || (Array.isArray(badges) && badges.length > 0)

  return (
    <main className="my-desk">
      <DeskScene>
        {session.status === 'signedIn' ? (
          <>
            <DeskObject
              spot={DESK_SPOTS.card}
              art={DESK_ART.card}
              label="Tu carné: cuánto llevas recorrido"
              lifted={lifted === 'card'}
              onPress={() => press('card')}
            >
              <JourneyCard
                name={session.account.name}
                tracks={journey}
                volumes={Array.isArray(badges) ? badges.length : 0}
              />
            </DeskObject>

            {earned ? (
              <>
                <DeskObject
                  spot={DESK_SPOTS.sheet}
                  art={DESK_ART.sheet}
                  label="Tus chuletas"
                  lifted={lifted === 'sheet'}
                  onPress={() => press('sheet', 'Las chuletas se están escribiendo.')}
                />

                <DeskObject
                  spot={DESK_SPOTS.box}
                  art={DESK_ART.box}
                  label="Tus juegos"
                  lifted={lifted === 'box'}
                  onPress={() => press('box', 'Los juegos se están preparando.')}
                />
              </>
            ) : null}
          </>
        ) : null}
      </DeskScene>

      {/* Lo que se dice con palabras, por encima de la mesa. Va en su propia caja
          porque la escena se coloca en absoluto: sin un envoltorio colocado, la
          ilustración se pintaría encima del texto por el orden de pintado.
          Es también lo que irá menguando según los objetos ocupen su sitio. */}
      <div className="my-desk__content">
        {/* Sin título: la escena ya dice dónde estás, y el nombre está en la barra
            de arriba con su enlace marcado. Ninguna otra escena lo lleva. */}
        {session.status === 'loading' ? (
          <p className="my-desk__note">Un momento…</p>
        ) : session.status === 'signedOut' ? (
          <section className="my-desk__invite">
            <p className="my-desk__note">
              Aquí se guardan los tomos que cierras, con su chuleta para repasarlos
              de un vistazo. Hace falta una cuenta: es donde viven las insignias.
            </p>

            {/* El motivo va con la llamada: el panel empieza por él en vez de
                presentarse solo. Y cada botón abre por SU vía: quien ya tiene
                cuenta no debería tener que pasar por el formulario de crearla
                para encontrar el enlace de entrar. Ver `accountPanelState.ts`. */}
            <div className="my-desk__ways">
              <button
                className="my-desk__cta"
                type="button"
                onClick={() =>
                  openAccountPanel('Crea tu cuenta para guardar aquí los tomos que cierres.')
                }
              >
                Crear cuenta
              </button>

              <button
                className="my-desk__cta my-desk__cta--quiet"
                type="button"
                onClick={() =>
                  openAccountPanel('Entra para recuperar tus sellos y tus insignias.', 'signIn')
                }
              >
                Ya tengo cuenta
              </button>
            </div>
          </section>
        ) : badges === null ? (
          <p className="my-desk__note">Buscando tus tomos…</p>
        ) : badges === 'error' ? (
          <p className="my-desk__note">No se han podido traer tus tomos.</p>
        ) : note ? (
          // Lo que contesta una puerta que todavía no lleva a ningún sitio. Y nada más: con la
          // mesa puesta, lo que hay ganado lo dicen los objetos.
          <p className="my-desk__note">{note}</p>
        ) : null}
      </div>

      <SiteNav />
    </main>
  )
}
