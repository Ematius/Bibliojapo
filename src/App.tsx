import { Route, Routes } from 'react-router-dom'
import { LibraryEntrance } from './landing/LibraryEntrance.tsx'
import { HiraganaAisle } from './aisle/HiraganaAisle.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryEntrance />} />
      <Route path="/hiragana" element={<HiraganaAisle />} />
    </Routes>
  )
}

export default App
