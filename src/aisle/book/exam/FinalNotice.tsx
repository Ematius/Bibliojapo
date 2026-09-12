import './FinalNotice.scss'

interface FinalNoticeProps {
  // Como en la portada, vienen dados: una hoja del tomo no lee el temario, lo recibe.
  characters: string[]
}

// La hoja que anuncia el examen final. Va en su propia plana porque lo que dice no es una
// instrucción sino lo que está en juego.
//
// CUIDADO CON LO QUE SE PROMETE: el tomo 2 todavía no existe, y lo que pase al sellar está
// sin decidir. Aquí se dice solo lo que SÍ es verdad hoy —que el examen entra entero y que
// el sello cierra el tomo—, y ni un botón que no lleve a ninguna parte.
export function FinalNotice({ characters }: FinalNoticeProps) {
  return (
    <div className="final-notice">
      <p className="final-notice__eyebrow">Último paso</p>
      <h2 className="final-notice__title">Examen final</h2>

      <p className="final-notice__body">
        Una plana por cada kana del tomo, sin ayuda y sin la hoja de enfrente donde
        mirar. No pregunta nada que no se haya dado ya: pregunta si se sostiene
        todo junto.
      </p>

      <p className="final-notice__body">
        Al superarlo se estampa el sello. Es el que cierra este tomo y da paso al
        siguiente.
      </p>

      {/* El sello, aquí apagado y en pequeño: se enseña a qué se juega. El de
          verdad cae al final del examen, en la última hoja. */}
      <div className="final-notice__prize">
        <img className="final-notice__seal" src="/images/sello.webp" alt="" aria-hidden="true" />
        <span className="final-notice__caption">{characters.length} kana</span>
      </div>
    </div>
  )
}

interface FinalScopeProps {
  characters: string[]
}

// Lo que entra en el examen: los kana del tomo, en fila, la misma lista con la que se abrió
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
