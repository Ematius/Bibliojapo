import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { HomeRoute } from './intro/HomeRoute'
import { AccountPanel } from './account/AccountPanel'
import { ErrorBoundary } from './shared/ErrorBoundary'
import { useVh } from './shared/useVh'

// Cargadas bajo demanda: la intro no necesita el lector, page-flip ni DrawSVGPlugin, así
// que esas pantallas no deben ir en el bundle inicial.
const LibraryHall = lazy(() =>
  import('./hall/LibraryHall.tsx').then((m) => ({ default: m.LibraryHall })),
)
const LibraryAisle = lazy(() =>
  import('./aisle/LibraryAisle.tsx').then((m) => ({ default: m.LibraryAisle })),
)
const MyDesk = lazy(() => import('./desk/MyDesk.tsx').then((m) => ({ default: m.MyDesk })))
const AccountPage = lazy(() =>
  import('./account/AccountPage.tsx').then((m) => ({ default: m.AccountPage })),
)
const ContactPage = lazy(() =>
  import('./contact/ContactPage.tsx').then((m) => ({ default: m.ContactPage })),
)

function App() {
  // --vh se escribe sobre el elemento raíz, así que es global: basta con
  // mantenerlo desde aquí. Llamarlo en cada pantalla solo duplicaba listeners
  // de resize que hacían exactamente lo mismo.
  useVh()

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Routes>
          {/* El recorrido es entrada → vestíbulo → pasillo. La entrada lleva delante la
              intro en video; el vestíbulo es el sitio al que se vuelve. */}
          <Route path="/" element={<HomeRoute />} />
          {/* La entrada vivió aquí; quien la tenga en favoritos llega igualmente. */}
          <Route path="/entrance" element={<Navigate to="/" replace />} />
          <Route path="/hall" element={<LibraryHall />} />
          {/* Un solo pasillo para las cuatro secciones: el id decide qué estantería
              se pinta. Ver shared/aisles.ts. */}
          <Route path="/aisle/:aisleId" element={<LibraryAisle />} />
          {/* Lo ganado: la mesa propia, con su chuleta y sus juegos encima. Sin
              guardia en la ruta — entrar sin cuenta no enseña nada de nadie, solo
              la invitación a crearla. Ver `desk/MyDesk.tsx`. */}
          <Route path="/my-desk" element={<MyDesk />} />
          {/* Lo que se gestiona de la cuenta. Sin guardia: sin sesión no enseña datos de
              nadie, solo la invitación a entrar. Ver `account/AccountPage.tsx`. */}
          <Route path="/account" element={<AccountPage />} />
          {/* El aviso de que algo se ha roto. Fuera de la cuenta a propósito: un error se
              cuenta igual sin haberla creado. */}
          <Route path="/contact" element={<ContactPage />} />
          {/* Cualquier otra ruta —un enlace viejo, una URL escrita a mano— vuelve al
              principio en vez de dejar la pantalla en blanco. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Fuera de las rutas: es el mismo panel en cualquier pantalla, y lo abre
          quien lo necesite. Ver `account/AccountPanel.tsx`. */}
      <AccountPanel />

      {/* Los dos solo miden en el despliegue de Vercel: en local no mandan nada y la
          consola avisa de que su script no carga. No es un fallo. */}
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  )
}

export default App
