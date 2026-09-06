import type { Block, Sentence } from '../../../content/types'
import './VolumeIntro.scss'

interface VolumeIntroProps {
  block: Block
  // Los kana del bloque, ya resueltos a su carácter. Vienen dados y no se buscan
  // aquí porque una hoja del tomo no lee el temario: lo recibe. El único que
  // conoce el contenido es el lector.
  characters: string[]
  // Cuánto se lleva aprendido al terminar este tomo, contando desde el primero.
  // Ver `progressThrough` en `content/hiragana/blocks.ts`.
  progress: { kanaPercent: number; wordsPercent: number }
}

// La portada del tomo: de qué bloque es, qué trae dentro y cuánto es.
//
// Del bloque solo se escriben a mano el título y la línea de debajo. Las cuentas
// —cuántas palabras, cuántas frases— se sacan del propio temario, así que no
// pueden quedarse desfasadas: añadir una frase al bloque la suma aquí sola.
//
// Ojo con lo que cuenta: describe el BLOQUE, no lo que se haya llegado a dibujar.
// Mientras se esté escribiendo el contenido, el tomo puede traer menos lecciones
// de las que la portada promete. Es un estado de desarrollo, no un error — cuando
// el bloque esté cerrado, las dos cosas coinciden.
// Un porcentaje pequeño con un decimal y uno grande sin ninguno. «1,6 %» dice
// algo; «2 %» redondeado de 1,6 miente y «13,0 %» sobra. El separador decimal es
// la coma, que es lo que se escribe en español.
function percent(value: number): string {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: value < 10 ? 1 : 0 })} %`
}

export function VolumeIntro({ block, characters, progress }: VolumeIntroProps) {
  return (
    <div className="volume-intro">
      <h2 className="volume-intro__title">{block.title}</h2>

      {/* Los kana del bloque, que son la carta de presentación: se ven antes de
          leer nada, y de un vistazo se sabe si el tomo toca lo que se busca. */}
      <p className="volume-intro__kana" lang="ja">
        {characters.map((character) => (
          <span className="volume-intro__kana-item" key={character}>
            {character}
          </span>
        ))}
      </p>

      <p className="volume-intro__summary">{block.summary}</p>

      {/* Las cuentas. Van al final y en pequeño: dicen a lo que da el tomo, que
          importa para saber a qué se entra, pero no es lo primero que se mira.

          Los kana NO se cuentan aquí: están ahí arriba y se cuentan solos. Decir
          «seis kana» encima de seis kana es decirlo dos veces, y además las dos
          cuentas se contradirían mientras el bloque se esté escribiendo, porque
          arriba solo salen los que ya tienen ficha. */}
      <dl className="volume-intro__counts">
        <div className="volume-intro__count">
          <dt>Palabras</dt>
          <dd>{block.wordIds.length}</dd>
        </div>
        <div className="volume-intro__count">
          <dt>Frases</dt>
          <dd>{block.sentenceIds.length}</dd>
        </div>
        {/* Lo que se lleva del camino largo al acabar este tomo. Son cifras
            pequeñas y se enseñan igual: el hiragana se aprende en doce tomos, y
            ver que el primero ya vale un trozo es lo que hace seguir. */}
        <div className="volume-intro__count">
          <dt>Hiragana</dt>
          <dd>{percent(progress.kanaPercent)}</dd>
        </div>
        <div className="volume-intro__count">
          <dt>Nivel N5</dt>
          <dd>{percent(progress.wordsPercent)}</dd>
        </div>
      </dl>
    </div>
  )
}

interface VolumeGoalProps {
  sentences: Sentence[]
}

// La otra mitad de la portada: a dónde lleva el tomo.
//
// Son las frases del bloque, escritas tal cual. Todavía no se pueden leer —esa es
// la gracia—: están para que se vea que los seis kana de al lado no son una lista
// que memorizar, sino lo que hace falta para entender esto.
//
// Cada frase ocupa UNA línea, con la traducción al lado y no debajo. Apiladas eran
// treinta líneas y las últimas se salían de la hoja; así son quince y caben, que
// en un libro de papel es la única opción — no hay a dónde desplazarse.
export function VolumeGoal({ sentences }: VolumeGoalProps) {
  return (
    <ul className="volume-goal">
      {sentences.map((sentence) => (
        <li className="volume-goal__line" key={sentence.id}>
          <span className="volume-goal__text" lang="ja">
            {sentence.text}
          </span>
          <span className="volume-goal__meaning">{sentence.meaning}</span>
        </li>
      ))}
    </ul>
  )
}
