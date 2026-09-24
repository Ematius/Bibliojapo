import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.scss'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  crashed: boolean
}

// La última red de la app. Un fallo al pintar desmonta el árbol ENTERO, y lo que queda
// es una pantalla en blanco —sin nav, sin forma de volver—, que no se lee como un error
// sino como una app que no existe.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { crashed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { crashed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Todavía no hay a quién mandarlo: que quede al menos en la consola, que es de donde
    // sale el detalle cuando alguien avisa por Contacta.
    console.error('Bibliojapo se ha roto al pintar', error, info.componentStack)
  }

  render() {
    if (!this.state.crashed) return <>{this.props.children}</>

    return (
      <main className="error-screen" role="alert">
        <div className="error-screen__panel">
          <h1 className="error-screen__title">Algo se ha roto</h1>

          <p className="error-screen__text">
            No hemos podido seguir pintando esta pantalla. Vuelve a la entrada y sigue por
            donde estabas; lo que llevaras hecho no se ha perdido.
          </p>

          {/* Enlaces de verdad y no <Link>: navegar con el router deja este boundary en
              estado de error, y la pantalla siguiente no llegaría a verse. Recargando se
              sale del fallo. */}
          <div className="error-screen__actions">
            <a className="error-screen__action" href="/">
              Volver a la entrada
            </a>

            <a className="error-screen__link" href="/contact">
              Contar qué ha pasado
            </a>
          </div>
        </div>
      </main>
    )
  }
}
