import './FinalNotice.scss'

interface FinalNoticeProps {
  // Los kana del tomo, ya resueltos a su carácter. Como en la portada, vienen
  // dados: una hoja del tomo no lee el temario, lo recibe.
  characters: string[]
}

// La hoja que anuncia el examen final.
//
// Va en su propia plana, después del examen de la última lección, porque lo que
// dice no es una instrucción sino lo que está en juego. Quien llega aquí ha
// terminado las seis lecciones enteras.
//
// ── Cuidado con lo que se promete ──────────────────────────────────────────
// El tomo 2 todavía no existe, y lo que pase al sellar —guardar la hoja de
// repaso, el trofeo— está sin decidir y necesita cuentas, que son de la fase 4.
// Así que aquí se dice lo que SÍ es verdad hoy: que el examen entra entero y que
// el sello cierra el tomo. Ni un botón que no lleve a ninguna parte. Ver «Se
// lanza con el contenido a medias, a propósito» en CLAUDE.md: lo que falta se lee
// como «todavía no», nunca como roto.
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

// La otra mitad del anuncio: lo que entra. Los kana del tomo, en fila, como en la
// portada — es la misma lista con la que se abrió el libro, y verla otra vez al
// final es la cuenta de lo que se ha hecho.
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
