import { Navigate, useLocation } from 'react-router-dom'
import { isJourneyDone } from '../shared/journey'
import { ParallaxLanding } from './ParallaxLanding'

// Decide qué hay en la raíz del sitio.
//
// La primera visita empieza en el valle y hace el recorrido entero. A partir de
// ahí se entra directamente frente a la puerta: el viaje de presentación se hace
// una vez, no cada vez que se abre la web.
//
// La excepción es «Inicio» en la barra, que llega con una marca en el estado de
// navegación. Es la única forma de volver a ver la portada, y no borra el
// recuerdo: quien quiere revisitar el valle no está pidiendo que la próxima
// visita vuelva a empezar desde cero.
export function LandingRoute() {
  const location = useLocation()
  const cameFromNav = (location.state as { fromNav?: boolean } | null)?.fromNav === true

  // `replace` y no una navegación normal: así la portada saltada no queda en el
  // historial y el botón atrás del navegador no rebota contra ella.
  if (isJourneyDone() && !cameFromNav) return <Navigate to="/entrada" replace />

  return <ParallaxLanding />
}
