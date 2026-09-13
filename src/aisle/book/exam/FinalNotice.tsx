import { wordText, type Word } from '../../../content/types'
import './FinalNotice.scss'

// La hoja que anuncia el repaso completo. Va en su propia plana porque lo que dice no es una
// instrucción sino lo que viene.
//
// Sin premio que enseñar: este repaso ya no sella el tomo —ver `readerConfig.ts`—, así que no
// lleva ni la mención al sello ni su vista previa. Eso vive ahora en el examen final de
// frases, que tiene su propio anuncio.
export function FinalNotice() {
  return (
    <div className="final-notice">
      <p className="final-notice__eyebrow">Antes del examen</p>
      <h2 className="final-notice__title">Repaso completo</h2>

      <p className="final-notice__body">
        Una plana por cada kana del tomo, sin ayuda y sin la hoja de enfrente donde
        mirar. No pregunta nada que no se haya dado ya: pregunta si se sostiene
        todo junto.
      </p>
    </div>
  )
}

interface FinalScopeProps {
  characters: string[]
}

// Lo que entra en el repaso: los kana del tomo, en fila, la misma lista con la que se abrió
// el libro.
export function FinalScope({ characters }: FinalScopeProps) {
  return (
    <div className="final-scope">
      <p className="final-scope__kana" lang="ja">
        {characters.map((character) => (
          <span className="final-scope__kana-item" key={character}>
            {character}
          </span>
        ))}
      </p>

      <p className="final-scope__note">
        De cada uno se pregunta su sonido, su forma dentro de una palabra y la
        lectura entera de esa palabra.
      </p>
    </div>
  )
}

// La hoja que anuncia el repaso final. Va detrás del repaso completo porque ese repasaba
// kana; este repasa PALABRAS, y hay dos —え, は— que ningún ejercicio de las lecciones
// llega a pedir por ser de un solo carácter: no se puede pedir encontrarlo dentro de una
// palabra si son la misma cosa.
export function FinalReviewNotice() {
  return (
    <div className="final-notice">
      <p className="final-notice__eyebrow">Antes del examen final</p>
      <h2 className="final-notice__title">Repaso final</h2>

      <p className="final-notice__body">
        Todas las palabras que este tomo promete tienen ya su prueba propia, sin
        excepción. Escribirlas de memoria, sin nada al lado, es el último paso antes
        del examen que cierra el tomo.
      </p>
    </div>
  )
}

interface FinalReviewScopeProps {
  words: Word[]
}

// Lo que entra en el repaso final: las palabras del tomo, en fila, cada una con su
// significado. La misma idea que `FinalScope`, pero de palabra en palabra y no de kana
// en kana.
export function FinalReviewScope({ words }: FinalReviewScopeProps) {
  return (
    <div className="final-scope">
      <p className="final-scope__kana" lang="ja">
        {words.map((word) => (
          <span className="final-scope__kana-item" key={word.id}>
            {wordText(word)}
          </span>
        ))}
      </p>

      <p className="final-scope__note">De cada una se pide escribirla entera, de memoria.</p>
    </div>
  )
}
