import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { openAccountPanel } from '../account/accountPanelState'
import { useSession } from '../account/useSession'
import { onApiChange } from '../api/apiChanges'
import { fetchBadges, fetchJourney, type Badge, type JourneyTrack } from '../api/progress'
import { RotateNotice } from '../shared/RotateNotice'
import { SiteNav } from '../shared/SiteNav'
import { BLOCK_PLAN } from '../content/hiragana/plan'
import { AnimeAlbum, type AnimeChapter } from './animeAlbum/AnimeAlbum'
import { ANIME_PAGES } from './animeAlbum/animePages'
import { CheatSheetPanel } from './cheatSheet/CheatSheetPanel'
import { DeskObject } from './DeskObject'
import { DeskScene } from './DeskScene'
import { JourneyCard } from './journeyCard/JourneyCard'
import { DESK_ART } from './deskArt'
import { DESK_SPOTS, SHOW_EVERY_OBJECT } from './deskSpots'
import { useNeedsLandscape } from '../shared/useNeedsLandscape'
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
  const needsLandscape = useNeedsLandscape()
  const navigate = useNavigate()

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

  // Cuál está levantado. Lo lleva la pantalla y no cada objeto porque solo puede haber uno
  // enfrente: con el estado repartido, pulsar el segundo dejaría los dos en el aire.
  const [lifted, setLifted] = useState<keyof typeof DESK_SPOTS | null>(null)

  // Pulsar el objeto YA levantado no lo suelta: ahora tiene contenido pulsable dentro —la
  // hoja, sus propios botones para elegir tomo—, y ese clic burbujea hasta aquí igual que el
  // de fuera. Si volviera a cerrar, elegir un tomo cerraría la hoja en el mismo gesto con el
  // que se elige. Soltar solo pasa pisando la mesa o levantando otro objeto.
  const press = (id: keyof typeof DESK_SPOTS) => {
    setLifted((current) => (current === id ? current : id))
  }

  // Pisar la mesa vacía es la única forma de soltar el objeto levantado sin levantar otro: se
  // guarda contra pisarla sin nada levantado, que no tendría nada que cerrar.
  const closeLifted = () => {
    if (lifted) setLifted(null)
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

  // El carné está siempre que haya sesión —es la cuenta misma—; la hoja y el álbum solo cuando
  // hay algo detrás que enseñar. Es una aventura gráfica: nada de avisos de «todavía no» al
  // pulsarlas. La hoja SÍ tiene ya qué enseñar —sus chuletas, ver `chuleta/`—; el álbum
  // todavía no lleva nada dentro.
  const earned = SHOW_EVERY_OBJECT || (Array.isArray(badges) && badges.length > 0)

  // Las páginas del álbum: las de cada tomo GANADO, en el orden del temario y no en el de
  // llegada de las insignias —si no, cerrar el tomo 2 antes de que el 1 responda las
  // colaría delante—. Un tomo sin arte todavía —ver `animePages.ts`— no aporta páginas, y
  // no rompe nada: el álbum sigue creciendo solo en cuanto esas páginas existan.
  //
  // Memorizado: el álbum vuelve a montar page-flip cada vez que la lista cambia de
  // referencia, y esta pantalla se repinta con cada objeto que se levanta.
  const animeChapters = useMemo<AnimeChapter[]>(() => {
    const passedIds = new Set((Array.isArray(badges) ? badges : []).map((badge) => badge.blockId))
    return BLOCK_PLAN.flatMap((blockId, index) => {
      const images = ANIME_PAGES[blockId]
      if (!passedIds.has(blockId) || !images?.length) return []
      return [{ blockId, volumeNumber: index + 1, images }]
    })
  }, [badges])

  // Va DESPUÉS de todos los hooks: cortar antes cambiaría cuántos se llaman al girar la
  // pantalla. La mesa se queda pintada detrás, sin objetos ni invitación.
  if (needsLandscape) {
    return (
      <main className="my-desk">
        <DeskScene />

        <RotateNotice
          text="Mi escritorio se ve a lo ancho: de pie no caben los objetos de la mesa."
          backLabel="Volver al vestíbulo"
          onDismiss={() => navigate('/hall')}
        />

        <SiteNav />
      </main>
    )
  }

  return (
    <main className="my-desk">
      <DeskScene onBackgroundPress={closeLifted}>
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
                  onPress={() => press('sheet')}
                >
                  <CheatSheetPanel lifted={lifted === 'sheet'} />
                </DeskObject>

                <DeskObject
                  spot={DESK_SPOTS.anime}
                  art={DESK_ART.anime}
                  label="Tu anime"
                  lifted={lifted === 'anime'}
                  onPress={() => press('anime')}
                >
                  <AnimeAlbum chapters={animeChapters} />
                </DeskObject>
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
        ) : null}
      </div>

      <SiteNav />
    </main>
  )
}
