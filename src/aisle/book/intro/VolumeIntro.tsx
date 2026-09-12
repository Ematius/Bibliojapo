import type { Block } from '../../../content/types'
import { wordText } from '../../../content/types'
import type { GoalGroup } from './goalGroups'
import './VolumeIntro.scss'

interface VolumeIntroProps {
  block: Block
  // Vienen resueltos y no se buscan aquí: una hoja del tomo no lee el temario, lo recibe.
  characters: string[]
  // Cuánto se lleva aprendido al terminar este tomo, contando desde el primero.
  progress: { kanaPercent: number; wordsPercent: number }
}

// La portada del tomo. Del bloque solo se escriben a mano el título y la línea de debajo:
// las cuentas salen del propio temario, así que no pueden quedarse desfasadas.
//
// Describe el BLOQUE, no lo que se haya llegado a dibujar: mientras se escribe el
// contenido, el tomo puede traer menos lecciones de las que la portada promete.

// Un decimal por debajo de 10 y ninguno por encima: «1,6 %» dice algo, «2 %» redondeado de
// 1,6 miente y «13,0 %» sobra.
function percent(value: number): string {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: value < 10 ? 1 : 0 })} %`
}

// El número queda arriba y en voz baja, y el nombre se lleva el tamaño de título. Entero en
// una línea, el título se partía por donde le tocaba y dejaba un «Las» colgando. Si un
// bloque no trae el separador, se queda como está: el corte es cosa de esta hoja.
function splitTitle(title: string): [string | null, string] {
  const at = title.indexOf(' · ')
  return at < 0 ? [null, title] : [title.slice(0, at), title.slice(at + 3)]
}

export function VolumeIntro({ block, characters, progress }: VolumeIntroProps) {
  const [number, name] = splitTitle(block.title)

  // La cadena del temario dicha en voz alta: kana → palabra → frase. Puesta en tres peldaños
  // explica de un vistazo por qué se empieza por seis caracteres sueltos.
  //
  // El primer peldaño cuenta los kana que se VEN arriba, no los que el bloque planea: con el
  // plan, la portada se contradiría consigo misma a cuatro centímetros de distancia.
  const steps = [
    { label: 'Aprende los kana', count: characters.length },
    { label: 'Reconoce palabras', count: block.wordIds.length },
    { label: 'Lee frases enteras', count: block.sentenceIds.length },
  ]

  return (
    <div className="volume-intro">
      {/* El kana del bloque en grande y casi transparente, detrás de todo. Es la
          única licencia decorativa de la hoja, y sale del propio contenido en vez
          de ser un dibujo aparte: la portada del tomo 1 lleva あ porque el tomo 1
          empieza por あ. `aria-hidden` porque no dice nada que no esté ya escrito
          más abajo, y a un lector de pantalla solo le estorbaría. */}
      {characters[0] ? (
        <span className="volume-intro__ghost" lang="ja" aria-hidden="true">
          {characters[0]}
        </span>
      ) : null}

      <header className="volume-intro__head">
        {number ? <p className="volume-intro__number">{number}</p> : null}
        <h2 className="volume-intro__title">{name}</h2>
      </header>

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

      {/* Los tres peldaños. Sustituyen a las cuentas sueltas de «Palabras 13 ·
          Frases 15»: el número es el mismo, pero dice para qué sirve. */}
      <ol className="volume-intro__path">
        {steps.map((step, index) => (
          <li className="volume-intro__step" key={step.label}>
            <span className="volume-intro__step-index">{index + 1}</span>
            <span className="volume-intro__step-label">{step.label}</span>
            <span className="volume-intro__step-count">{step.count}</span>
          </li>
        ))}
      </ol>

      {/* Lo que se lleva del camino largo al acabar este tomo. Son cifras
          pequeñas y se enseñan igual: el hiragana se aprende en doce tomos, y ver
          que el primero ya vale un trozo es lo que hace seguir. Van al pie
          porque es el dato que menos importa para decidir si entrar. */}
      <dl className="volume-intro__counts">
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
  groups: GoalGroup[]
}

// La otra mitad de la portada: las frases del bloque, que todavía no se pueden leer. Esa es
// la gracia — están para que se vea que los seis kana de al lado no son una lista que
// memorizar.
//
// Van por temas y no de corrido: quince líneas seguidas se leían como un muro. Y cada frase
// ocupa UNA línea, con la traducción al lado: apiladas eran treinta y las últimas se salían
// de la hoja, y en un libro de papel no hay a dónde desplazarse.
export function VolumeGoal({ groups }: VolumeGoalProps) {
  return (
    <div className="volume-goal">
      {groups.map((group) => (
        <section className="volume-goal__group" key={group.id}>
          <h3 className="volume-goal__topic">
            <span className="volume-goal__topic-word" lang="ja">
              {wordText(group.topic)}
            </span>
            <span className="volume-goal__topic-meaning">{group.topic.meaning}</span>
          </h3>

          <ul className="volume-goal__lines">
            {group.sentences.map((sentence) => (
              <li className="volume-goal__line" key={sentence.id}>
                <span className="volume-goal__text" lang="ja">
                  {sentence.text}
                </span>
                <span className="volume-goal__meaning">{sentence.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
