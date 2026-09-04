import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LandingRoute } from './landing/LandingRoute.tsx'
import { useVh } from './shared/useVh'

// Cargadas bajo demanda: la portada no necesita el lector, page-flip ni
// DrawSVGPlugin, así que esas tres pantallas no deben ir en el bundle inicial.
const LibraryEntrance = lazy(() =>
  import('./entrance/LibraryEntrance.tsx').then((m) => ({ default: m.LibraryEntrance })),
)
const LibraryHall = lazy(() =>
  import('./hall/LibraryHall.tsx').then((m) => ({ default: m.LibraryHall })),
)
const LibraryAisle = lazy(() =>
  import('./aisle/LibraryAisle.tsx').then((m) => ({ default: m.LibraryAisle })),
)

function App() {
  // --vh se escribe sobre el elemento raíz, así que es global: basta con
  // mantenerlo desde aquí. Llamarlo en cada pantalla solo duplicaba listeners
  // de resize que hacían exactamente lo mismo.
  useVh()

  return (
    <Suspense fallback={null}>
      <Routes>
        {/* El recorrido es portada → umbral → vestíbulo → pasillo. La portada y la
            puerta se cruzan; el vestíbulo es el sitio al que se vuelve. */}
        <Route path="/" element={<LandingRoute />} />
        <Route path="/entrada" element={<LibraryEntrance />} />
        <Route path="/biblioteca" element={<LibraryHall />} />
        {/* Un solo pasillo para las cuatro secciones: el id decide qué estantería
            se pinta. Ver shared/aisles.ts. */}
        <Route path="/pasillo/:aisleId" element={<LibraryAisle />} />
      </Routes>
    </Suspense>
  )
}

export default App
