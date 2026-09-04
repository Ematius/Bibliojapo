import { ParallaxLanding } from './ParallaxLanding'

// Decide qué hay en la raíz del sitio: siempre la portada.
//
// El recorrido del valle no se salta nunca, tampoco después de haberlo hecho
// una vez. Quien quiera ir directo a la puerta entra por /entrada.
export function LandingRoute() {
  return <ParallaxLanding />
}
