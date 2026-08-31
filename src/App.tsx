import { Route, Routes } from 'react-router-dom'
import { LandingRoute } from './landing/LandingRoute.tsx'
import { LibraryEntrance } from './entrance/LibraryEntrance.tsx'
import { LibraryHall } from './hall/LibraryHall.tsx'
import { LibraryAisle } from './aisle/LibraryAisle.tsx'
import { useVh } from './shared/useVh'

function App() {
  // --vh se escribe sobre el elemento raíz, así que es global: basta con
  // mantenerlo desde aquí. Llamarlo en cada pantalla solo duplicaba listeners
  // de resize que hacían exactamente lo mismo.
  useVh()

  return (
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
  )
}

export default App
