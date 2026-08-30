import { Route, Routes } from 'react-router-dom'
import { LibraryEntrance } from './landing/LibraryEntrance.tsx'
import { HiraganaAisle } from './aisle/HiraganaAisle.tsx'
import { ParallaxLanding } from './landing-parallax/ParallaxLanding.tsx'

function App() {
  return (
    <Routes>
      {/* Landing nueva en la raíz; la landing anterior se conserva en /entrance. */}
      <Route path="/" element={<ParallaxLanding />} />
      <Route path="/entrance" element={<LibraryEntrance />} />
      <Route path="/hiragana" element={<HiraganaAisle />} />
    </Routes>
  )
}

export default App
