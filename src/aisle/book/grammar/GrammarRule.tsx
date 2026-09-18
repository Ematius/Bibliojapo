import type { Grammar, Sentence } from '../../../content/types'
import { ContentText } from '../parts/ContentText'
import './GrammarRule.scss'

interface GrammarRuleProps {
  rule: Grammar
}

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
  sentences: Sentence[]
}

export function GrammarExample({ rule, sentences }: GrammarExampleProps) {
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
