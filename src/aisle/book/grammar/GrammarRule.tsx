import type { Grammar, GrammarExample as Example, Sentence } from '../../../content/types'
import { ContentText } from '../parts/ContentText'
import './GrammarRule.scss'

interface GrammarRuleProps {
  rule: Grammar
}

export function GrammarRule({ rule }: GrammarRuleProps) {
  return (
    <div className="grammar-rule">
      {/* Una regla de ortografía se presenta con su carácter en grande, que es de lo que
          habla. Una de gramática no tiene: です son dos, ～ます no es ninguno propio, y lo
          que la nombra es su título. */}
      {rule.character ? (
        <p className="grammar-rule__character" lang="ja">
          {rule.character}
        </p>
      ) : (
        <h3 className="grammar-rule__title" lang="ja">
          {rule.title}
        </h3>
      )}

      {rule.romaji ? <p className="grammar-rule__romaji">{rule.romaji}</p> : null}

      <p className="grammar-rule__explanation">
        <ContentText text={rule.explanation} />
      </p>
    </div>
  )
}

interface GrammarExampleProps {
  rule: Grammar
  sentences: Sentence[]
  // Las filas de la regla, que sustituyen a las frases cuando el tomo no tiene ninguna que
  // la nombre. Llegan ya elegidas: la del dakuten enseña solo los de ESTE tomo.
  examples?: Example[]
}

// Las filas que no son frases: la tabla de ～ます, los pares del dakuten. La primera fila
// hace de cabecera cuando la tabla la trae —`examples` de `masu` empieza por «Verbo»—, y
// se reconoce porque es la primera, no por un campo aparte.
function GrammarTable({ examples }: { examples: Example[] }) {
  return (
    <dl className="grammar-table">
      {examples.map((example, index) => (
        <div
          className={`grammar-table__row${index === 0 && !example.label ? ' grammar-table__row--head' : ''}`}
          key={`${example.label}-${index}`}
        >
          <dt className="grammar-table__label" lang="ja">
            {example.label}
          </dt>
          {example.forms.map((form, at) => (
            <dd className="grammar-table__form" key={`${example.label}-${index}-${at}`}>
              {form}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  )
}

export function GrammarExample({ rule, sentences, examples }: GrammarExampleProps) {
  if (sentences.length === 0) return <GrammarTable examples={examples ?? rule.examples ?? []} />

  return (
    <div className="grammar-example">
      {sentences.map((sentence) => (
        <div className="grammar-example__case" key={sentence.id}>
          <ol className="grammar-example__sentence">
            {sentence.units.map((unit, index) => {
              // Se compara también la lectura, no solo el carácter: en 「ははいい」 hay
              // dos は y solo el segundo es partícula.
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
      ))}
    </div>
  )
}
