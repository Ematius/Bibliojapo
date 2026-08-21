import { useNavigate } from 'react-router-dom'
import { useVh } from '../shared/useVh'
import { HIRAGANA_AISLE_IMAGE } from './hiraganaAisleConfig'
import './HiraganaAisle.scss'

export function HiraganaAisle() {
  useVh()
  const navigate = useNavigate()

  return (
    <section className="hiragana-aisle">
      <img className="hiragana-aisle__scene" src={HIRAGANA_AISLE_IMAGE} alt="" draggable="false" />

      <button type="button" className="hiragana-aisle__back" onClick={() => navigate('/')}>
        Volver a la entrada
      </button>
    </section>
  )
}
