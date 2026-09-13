// El examen final de verdad: el que sella el tomo y abre el siguiente. Orquesta las
// cinco planas nuevas —`ExamRules`, `SentenceBuild` × 3 bloques, `ExamResults` × 3 y
// `ExamReveal`— y es el único sitio del libro donde el propio examen decide cuándo se
// pasa de hoja.
//
// No se apoya en `examSeal.ts`: aquella sella cuando TODOS los ejercicios de una
// plana avisan de un acierto a la primera (`bof:solved`), y este examen aprueba con
// un umbral por bloque —≥5/10— que puede incluir frases falladas. El sello de aquí
// se estampa a mano, llamando a `saveSeal` directamente al final.
import gsap from 'gsap'
import type { PageFlip } from 'page-flip'
import type { Sentence } from '../../../content/types'
import { writeBookmark } from '../../../shared/bookmark'
import { fetchSeals, saveSeal, FINAL_SEAL } from '../../../api/progress'
import { readSentenceSlots } from './sentenceTiles'
import { stamp } from './examSeal'

interface FinalExamOptions {
  blockId: string
  flip: PageFlip
  sentencesById: Map<string, Sentence>
  // Sube `examAttempt` en `VolumeReader`, que vuelve a barajar el bloque 3 y remonta
  // el libro entero con las planas del examen en blanco. Ver `readerConfig.ts`.
  retry: () => void
}

type BlockId = 1 | 2 | 3

interface BlockTally {
  correct: number
  wrong: Sentence[]
  score: number
}

const BLOCK_LABELS: Record<BlockId, string> = {
  1: 'Bloque 1 · rōmaji → hiragana',
  2: 'Bloque 2 · español → hiragana',
  3: 'Bloque 3 · audio → hiragana',
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function mountFinalExam(root: HTMLElement, options: FinalExamOptions): (() => void) | null {
  const rules = root.querySelector<HTMLElement>('.exam-rules')
  const reveal = root.querySelector<HTMLElement>('.exam-reveal')
  if (!rules || !reveal) return null

  const { blockId, flip, sentencesById, retry } = options

  let mounted = true
  let locked = false
  let revealed = false

  // El folio de la propia plana de normas: adonde se vuelve al reintentar. Se lee del
  // número YA impreso en la hoja —`ReaderPage.folio`—, no se recalcula aquí.
  const rulesFolio = Number(
    rules.closest('.volume-reader__page')?.querySelector('.volume-reader__folio')?.textContent,
  )

  // EL BLOQUEO DEL GIRO. En fase de CAPTURA sobre la raíz del libro: corta el evento
  // antes de que llegue al `mousedown`/`touchstart` con el que page-flip arranca el
  // arrastre (ver `UI.ts` de la librería), así que nunca hace falta tocar sus
  // opciones. Deja pasar cualquier `<button>`/`<a>` —el mismo criterio que usa la
  // propia librería para sus controles—, así que nunca bloquea una tarjeta ni un
  // botón del examen.
  const shouldBlock = (target: EventTarget | null): boolean => {
    if (!locked) return false
    return !(target as HTMLElement | null)?.closest('button, a')
  }
  const blockDrag = (event: Event) => {
    if (shouldBlock(event.target)) event.stopPropagation()
  }
  root.addEventListener('mousedown', blockDrag, { capture: true })
  root.addEventListener('touchstart', blockDrag, { capture: true })

  // ¿YA ESTÁ SELLADO? Sin forzar a repetir un examen ya ganado — «repasar no vuelve a
  // sellar» es la misma regla que ya rige Mi escritorio.
  void fetchSeals(blockId).then((earned) => {
    if (!mounted || !earned.has(FINAL_SEAL)) return

    rules.querySelector<HTMLElement>('[data-exam-start]')?.setAttribute('hidden', '')
    rules.querySelector<HTMLElement>('[data-exam-done]')?.removeAttribute('hidden')

    const finalEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-final]')
    if (finalEl) finalEl.textContent = 'Ya superado'
    reveal.querySelector<HTMLElement>('[data-exam-reveal-seal]')?.classList.add('exam-seal--earned')
  })

  // EMPEZAR: bloquea el libro y entra en la primera frase.
  const startButton = rules.querySelector<HTMLButtonElement>('[data-exam-start]')
  const onStart = () => {
    locked = true
    flip.flipPrev()
  }
  startButton?.addEventListener('click', onStart)

  // LAS FRASES. Agrupadas por bloque y ORDENADAS por su posición de lectura —el DOM
  // las trae al revés, ver `VolumeReader`—, y desde ahí partidas en parejas de dos:
  // exactamente las que comparten plana en `readerConfig.ts`. Las dos hojas de una
  // misma plana ya se ven a la vez —no hace falta pasar página para ver la
  // izquierda—, así que el giro espera a que las DOS estén enviadas, no a la primera.
  const sentenceEls = [...root.querySelectorAll<HTMLElement>('.sentence-build')]
  const byBlock: Record<BlockId, HTMLElement[]> = { 1: [], 2: [], 3: [] }
  sentenceEls.forEach((el) => {
    const block = Number(el.dataset.examBlock) as BlockId
    byBlock[block]?.push(el)
  })
  ;([1, 2, 3] as const).forEach((block) => {
    byBlock[block].sort((a, b) => Number(a.dataset.examIndex) - Number(b.dataset.examIndex))
  })

  const spreadGroups: { block: BlockId; sentences: HTMLElement[]; isLastOfBlock: boolean }[] = []
  ;([1, 2, 3] as const).forEach((block) => {
    const ordered = byBlock[block]
    for (let i = 0; i < ordered.length; i += 2) {
      const pair = ordered.slice(i, i + 2)
      spreadGroups.push({ block, sentences: pair, isLastOfBlock: i + 2 >= ordered.length })
    }
  })

  const tallies: Record<BlockId, BlockTally> = {
    1: { correct: 0, wrong: [], score: 0 },
    2: { correct: 0, wrong: [], score: 0 },
    3: { correct: 0, wrong: [], score: 0 },
  }

  const resultsPanel = (block: BlockId) =>
    root.querySelector<HTMLElement>(`.exam-results[data-exam-results="${block}"]`)

  // Puntúa un bloque en su hoja de resultados. Se llama UNA vez, al pulsar
  // «Siguiente» en la última frase de ese bloque — no al llegar a la hoja, para que
  // se vea ya escrita en cuanto se pasa la página.
  const populateResults = (block: BlockId) => {
    const panel = resultsPanel(block)
    if (!panel) return

    // Solo aquí se habilita: hasta que no hay nota que enseñar, no hay a dónde
    // continuar. Ver el comentario de `ExamResults.tsx`.
    const continueButton = panel.querySelector<HTMLButtonElement>('[data-exam-continue]')
    if (continueButton) continueButton.disabled = false

    const tally = tallies[block]
    const total = tally.correct + tally.wrong.length
    tally.score = total > 0 ? (tally.correct / total) * 10 : 0

    const scoreEl = panel.querySelector<HTMLElement>('[data-exam-score]')
    if (scoreEl) scoreEl.textContent = `Nota: ${tally.score.toFixed(1)} / 10`

    const wrongEl = panel.querySelector<HTMLUListElement>('[data-exam-wrong]')
    if (!wrongEl) return
    wrongEl.replaceChildren()

    if (tally.wrong.length === 0) {
      const li = document.createElement('li')
      li.className = 'exam-results__all-right'
      li.textContent = 'Todas bien.'
      wrongEl.appendChild(li)
      return
    }

    tally.wrong.forEach((sentence) => {
      const li = document.createElement('li')
      li.className = 'exam-results__wrong-item'

      const written = document.createElement('span')
      written.className = 'exam-results__wrong-sentence'
      written.lang = 'ja'
      written.textContent = sentence.text

      const meaning = document.createElement('span')
      meaning.className = 'exam-results__wrong-meaning'
      meaning.textContent = sentence.meaning

      li.append(written, meaning)
      wrongEl.appendChild(li)
    })
  }

  const sentenceTeardowns = spreadGroups.flatMap(({ block, sentences, isLastOfBlock }) => {
    let submitted = 0

    return sentences.map((sentenceEl) => {
      const next = sentenceEl.querySelector<HTMLButtonElement>('[data-exam-next]')
      if (!next) return null

      const onNext = () => {
        // No se puede reenviar la misma frase ni tocar sus tarjetas: la norma ya
        // avisada de que, pulsado «Siguiente», no se puede volver atrás.
        next.disabled = true
        sentenceEl.dataset.locked = 'true'

        const sentence = sentencesById.get(sentenceEl.dataset.sentence ?? '')
        if (sentence) {
          const slots = readSentenceSlots(sentenceEl)
          const correct = slots.length > 0 && slots.every((slot) => slot.filled === slot.answer)
          if (correct) tallies[block].correct += 1
          else tallies[block].wrong.push(sentence)
        }

        submitted += 1
        // Las dos hojas de la plana ya se ven juntas: solo se pasa página cuando
        // NINGUNA de las dos queda por enviar.
        if (submitted < sentences.length) return

        if (isLastOfBlock) {
          populateResults(block)
          // Con un número impar de frases, la última se queda SOLA en su plana y
          // comparte hoja con los resultados —ver `readerConfig.ts`—: ya están a la
          // vista, así que no hace falta pasar página para leerlos. Con dos, los
          // resultados van en la plana siguiente y sí hay que pasarla.
          if (sentences.length === 1) return
        }

        flip.flipPrev()
      }

      next.addEventListener('click', onNext)
      return () => next.removeEventListener('click', onNext)
    })
  })

  // LOS RESULTADOS: «continuar» solo avanza. El cálculo ya está hecho —arriba—.
  const enterReveal = () => {
    if (revealed) return
    revealed = true
    locked = false

    const blocksList = reveal.querySelector<HTMLOListElement>('[data-exam-reveal-blocks]')
    const finalEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-final]')
    const sealEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-seal]')
    const retryButton = reveal.querySelector<HTMLButtonElement>('[data-exam-retry]')

    const blocks: BlockId[] = [1, 2, 3]
    const scores = blocks.map((block) => tallies[block].score)
    const finalScore = scores.reduce((sum, score) => sum + score, 0) / 3
    const passed = scores.every((score) => score >= 5)

    const rows = blocks.map((block) => {
      const row = document.createElement('li')
      row.className = 'exam-reveal__block-row'

      const label = document.createElement('span')
      label.textContent = BLOCK_LABELS[block]

      const score = document.createElement('span')
      score.className = 'exam-reveal__block-score'
      score.textContent = tallies[block].score.toFixed(1)

      row.append(label, score)
      return row
    })
    blocksList?.replaceChildren(...rows)

    const finish = () => {
      if (finalEl) finalEl.textContent = `${finalScore.toFixed(1)} / 10`

      if (passed) {
        void saveSeal(blockId, FINAL_SEAL).catch(() => undefined)
        if (sealEl) stamp(sealEl)
      } else {
        retryButton?.removeAttribute('hidden')
      }
    }

    // Sin movimiento, todo aparece de golpe: la revelación es un adorno, no
    // información que dependa de verse a cámara lenta.
    if (reducedMotion()) {
      rows.forEach((row) => {
        row.style.opacity = '1'
      })
      finish()
      return
    }

    const timeline = gsap.timeline({ onComplete: finish })
    rows.forEach((row) => {
      timeline.to(row, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '+=0.3')
    })
  }

  const resultsPanels = [...root.querySelectorAll<HTMLElement>('.exam-results')]
  const resultsTeardowns = resultsPanels.map((panel) => {
    const block = Number(panel.dataset.examResults) as BlockId
    const continueButton = panel.querySelector<HTMLButtonElement>('[data-exam-continue]')

    const onContinue = () => {
      if (block === 3) enterReveal()
      flip.flipPrev()
    }

    continueButton?.addEventListener('click', onContinue)
    return () => continueButton?.removeEventListener('click', onContinue)
  })

  // REINTENTAR: vuelve la marca de lectura a la plana de normas ANTES de pedir el
  // nuevo intento — `VolumeReader` remonta el libro entero al cambiar `examAttempt`,
  // y sin esto se abriría de nuevo sobre la propia revelación.
  const retryButton = reveal.querySelector<HTMLButtonElement>('[data-exam-retry]')
  const onRetry = () => {
    if (Number.isInteger(rulesFolio) && rulesFolio > 0) writeBookmark(blockId, rulesFolio)
    retry()
  }
  retryButton?.addEventListener('click', onRetry)

  return () => {
    mounted = false
    root.removeEventListener('mousedown', blockDrag, { capture: true })
    root.removeEventListener('touchstart', blockDrag, { capture: true })
    startButton?.removeEventListener('click', onStart)
    retryButton?.removeEventListener('click', onRetry)
    sentenceTeardowns.forEach((teardown) => teardown?.())
    resultsTeardowns.forEach((teardown) => teardown())
  }
}
