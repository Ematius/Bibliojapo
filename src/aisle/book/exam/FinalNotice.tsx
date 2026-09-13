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
