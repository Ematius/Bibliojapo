import type { Grammar, Sentence } from '../../../content/types'
import { ContentText } from '../parts/ContentText'

interface GrammarRuleProps {
  rule: Grammar
}

// La regla de ortografía: el carácter que ya se conoce y lo que le cambia al usarse como
// partícula.
export function GrammarRule({ rule }: GrammarRuleProps) {
  return (
    <div className="grammar-rule">
      <p className="grammar-rule__character" lang="ja">
        {rule.character}
      </p>

      <p className="grammar-rule__romaji">{rule.romaji}</p>

      <p className="grammar-rule__explanation">
        <ContentText text={rule.explanation} />
      </p>
    </div>
  )
}

interface GrammarExampleProps {
  rule: Grammar
  sentence: Sentence
}

// La misma regla dentro de una frase del tomo, kana a kana con su lectura debajo.
export function GrammarExample({ rule, sentence }: GrammarExampleProps) {
  return (
    <div className="grammar-example">
      <ol className="grammar-example__sentence">
        {sentence.units.map((unit, index) => {
          // Se comparan las DOS cosas, carácter y lectura, y no solo el carácter: en
          // 「ははいい」 hay dos は y solo el segundo es la partícula —el primero es la
          // palabra «diente»—. Mirando solo el carácter se marcarían los dos, que es
          // justo lo contrario de lo que enseña la hoja.
          const isRule = unit.kana === rule.character && unit.romaji === rule.romaji

          return (
            <li
              className={`grammar-example__unit${isRule ? ' grammar-example__unit--rule' : ''}`}
              key={`${sentence.id}-${index}`}
            >
              <span className="grammar-example__kana" lang="ja">
                {unit.kana}
              </span>
              <span className="grammar-example__romaji">{unit.romaji}</span>
            </li>
          )
        })}
      </ol>

      <p className="grammar-example__meaning">{sentence.meaning}</p>
    </div>
  )
}
