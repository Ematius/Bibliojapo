import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LandingRoute } from './landing/LandingRoute.tsx'
import { AccountPanel } from './account/AccountPanel'
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
const MyDesk = lazy(() => import('./desk/MyDesk.tsx').then((m) => ({ default: m.MyDesk })))

function App() {
  // --vh se escribe sobre el elemento raíz, así que es global: basta con
  // mantenerlo desde aquí. Llamarlo en cada pantalla solo duplicaba listeners
  // de resize que hacían exactamente lo mismo.
  useVh()

  return (
    <>
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
          {/* Lo ganado: la mesa propia, con su chuleta y sus juegos encima. Sin
              guardia en la ruta — entrar sin cuenta no enseña nada de nadie, solo
              la invitación a crearla. Ver `desk/MyDesk.tsx`. */}
          <Route path="/mi-escritorio" element={<MyDesk />} />
        </Routes>
      </Suspense>

      {/* Fuera de las rutas: es el mismo panel en cualquier pantalla, y lo abre
          quien lo necesite. Ver `account/AccountPanel.tsx`. */}
      <AccountPanel />
    </>
  )
}

export default App
