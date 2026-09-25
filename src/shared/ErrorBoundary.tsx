import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.scss'

interface ErrorBoundaryProps {
  children: ReactNode
}

// `stale` es la app vieja pidiendo un trozo que ya no existe; `crash`, cualquier otro
// fallo al pintar. Se separan porque lo que hay que hacer es distinto: uno se cura
// recargando y el otro no.
type Failure = 'crash' | 'stale'

interface ErrorBoundaryState {
  failure: Failure | null
}

// Vite nombra cada trozo de la app con un hash, así que al desplegar los del despliegue
// anterior dejan de existir. Quien tuviera la pestaña abierta pide un archivo que ya no
// está: cada navegador lo cuenta con sus palabras.
const STALE_CHUNK =
  /dynamically imported module|importing a module script failed|error loading dynamically/i

function isStaleChunk(error: unknown): boolean {
  return error instanceof Error && STALE_CHUNK.test(error.message)
}

const RELOAD_MARK = 'bibliojapo:stale-reload'
// Si el fallo vuelve nada más recargar, no era el despliegue: recargar otra vez dejaría la
// pantalla parpadeando para siempre.
const RELOAD_QUIET_MS = 10_000

function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_MARK) ?? 0)
    if (Date.now() - last < RELOAD_QUIET_MS) return false
    sessionStorage.setItem(RELOAD_MARK, String(Date.now()))
  } catch {
    // Sin sessionStorage —ventana privada, datos bloqueados— no hay forma de saber si ya
    // se recargó una vez, así que no se recarga: antes un cartel que un bucle.
    return false
  }

  location.reload()
  return true
}

const NOTICES: Record<Failure, { title: string; text: string }> = {
  crash: {
    title: 'Algo se ha roto',
    text: 'Lo sentimos: no hemos podido seguir pintando esta pantalla. Vuelve a la entrada y sigue por donde estabas; lo que llevaras hecho no se ha perdido.',
  },
  stale: {
    title: 'La biblioteca ha cambiado',
    text: 'Publicamos una versión nueva mientras tenías esto abierto, y esta parte ya no está donde estaba. Vuelve a cargar la página y sigue justo donde lo dejaste.',
  },
}

// La última red de la app. Un fallo al pintar desmonta el árbol ENTERO, y lo que queda
// es una pantalla en blanco —sin nav, sin forma de volver—, que no se lee como un error
// sino como una app que no existe.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failure: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { failure: isStaleChunk(error) ? 'stale' : 'crash' }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // La recarga se lleva la pantalla por delante, así que no hay nada más que hacer ni
    // que contar.
    if (isStaleChunk(error) && reloadOnce()) return

    // Todavía no hay a quién mandarlo: que quede al menos en la consola, que es de donde
    // sale el detalle cuando alguien avisa por Contacta.
    console.error('Bibliojapo se ha roto al pintar', error, info.componentStack)
  }

  render() {
    const { failure } = this.state
    if (!failure) return <>{this.props.children}</>

    return (
      <main className="error-screen" role="alert">
        <div className="error-screen__sign">
          <h1 className="error-screen__title">{NOTICES[failure].title}</h1>

          <p className="error-screen__text">{NOTICES[failure].text}</p>

          {/* Enlaces de verdad y no <Link>: navegar con el router deja este boundary en
              estado de error, y la pantalla siguiente no llegaría a verse. Recargando se
              sale del fallo. */}
          <div className="error-screen__actions">
            {failure === 'stale' ? (
              // Recargar y no ir a la entrada: así se vuelve a la misma pantalla, que es
              // donde estaba quien se encontró con esto.
              <button
                type="button"
                className="error-screen__action"
                onClick={() => location.reload()}
              >
                Volver a cargar
              </button>
            ) : (
              <a className="error-screen__action" href="/">
                Volver a la entrada
              </a>
            )}

            <a className="error-screen__link" href="/contact">
              Contar qué ha pasado
            </a>
          </div>
        </div>
      </main>
    )
  }
}
