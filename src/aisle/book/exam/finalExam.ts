// El examen final de verdad: el que sella el tomo y abre el siguiente. Orquesta las
// cinco planas nuevas —`ExamRules`, `SentenceBuild` × 3 bloques, `ExamResults` × 3 y
// `ExamReveal`— y es el único sitio del libro donde el propio examen decide cuándo se
// pasa de hoja.
//
// No se apoya en `examSeal.ts`: aquella sella cuando TODOS los ejercicios de una
// plana avisan de un acierto a la primera (`bibliojapo:solved`), y este examen aprueba con
// un umbral por bloque —≥5/10— que puede incluir frases falladas. El sello de aquí
// se estampa a mano, llamando a `saveSeal` directamente al final.
import gsap from 'gsap'
import type { PageFlip } from 'page-flip'
import type { Sentence } from '../../../content/types'
import { writeBookmark } from '../../../shared/bookmark'
import { fetchSeals, saveSeal, FINAL_SEAL } from '../../../api/progress'
import { readSentenceSlots } from './sentenceTiles'
import { stamp } from './examSeal'
import { wakeEnvelope } from './giftOpening'
import { prepareGiftLetter } from './giftLetter'
import { readFinalExamScore, saveFinalExamScore, type FinalExamScore } from './finalExamScore'

interface FinalExamOptions {
  blockId: string
  flip: PageFlip
  sentencesById: Map<string, Sentence>
  // Qué intento se está montando: cero es abrir el tomo tal cual, y de uno en adelante
  // un intento PEDIDO —«Reintentar» o «Volver a hacerlo»—. Cambia lo que se ve en las
  // normas de un tomo ya sellado.
  attempt: number
  // Sube `examAttempt` en `VolumeReader`, que vuelve a barajar el bloque 3 y remonta
  // el libro entero con las planas del examen en blanco. Ver `readerConfig.ts`.
  retry: () => void
  // Entrega quién sabe si el giro está cortado. Lo consultan los botones que pasan hoja sin
  // arrastre: el bloqueo de abajo solo corta el gesto, y un `flipPrev()` directo se lo saltaría.
  setTurnGuard?: (isBlocked: () => boolean) => void
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

  const { blockId, flip, sentencesById, retry, attempt } = options

  // EL REGALO de la hoja de enfrente. Nace apagado y solo se enciende desde aquí: es el
  // premio por cerrar el tomo, así que quien decide si lo hay es el único que sabe la
  // nota. Suspender no lo toca — se queda como estaba.
  //
  // Antes de dejar pulsar «Recibir regalo» espera a `prepareGiftLetter` —sin cuenta o con
  // ella, la carta pide un viaje al servidor (la sesión, y con cuenta los % del carné)—:
  // sin esto, abrir el sobre podría encontrarse la carta todavía en blanco. Cómo se anima
  // la apertura es cosa de `giftOpening.ts`; esto solo prepara y levanta el cierre.
  const gift = root.querySelector<HTMLElement>('.exam-gift')
  const unlockGift = () => {
    if (!gift) return

    void prepareGiftLetter(gift).then(() => {
      if (!mounted) return
      gift.dataset.earned = 'true'

      const openButton = gift.querySelector<HTMLButtonElement>('[data-gift-open]')
      if (openButton) openButton.disabled = false

      gift.querySelector<HTMLElement>('[data-gift-note]')?.setAttribute('hidden', '')
      gift.querySelector<HTMLElement>('[data-gift-ready]')?.removeAttribute('hidden')

      wakeEnvelope(gift)
    })
  }

  let mounted = true
  let locked = false
  let revealed = false
  // Si el tomo traía el sello puesto ANTES de este montaje. Lo que decide que un repaso
  // suspendido no pinte el sello en rojo: lo ganado no se pone en juego al repasar.
  let sealed = false

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
  // Antes de empezar bloquea SOLO la plana de normas, no el libro entero. Con el tomo ya
  // sellado no bloquea nada: sin «Empezar» que pulsar, dejaría a quien lee encerrado ahí.
  const onRulesSpread = (): boolean => {
    const folio = flip.getPageCount() - flip.getCurrentPageIndex()
    return (folio % 2 === 1 ? folio : folio - 1) === rulesFolio
  }
  const guardingRules = (): boolean => {
    const start = rules.querySelector<HTMLButtonElement>('[data-exam-start]')
    return start !== null && !start.hidden && onRulesSpread()
  }

  const shouldBlock = (target: EventTarget | null): boolean => {
    if (!locked && !guardingRules()) return false
    return !(target as HTMLElement | null)?.closest('button, a')
  }
  const blockDrag = (event: Event) => {
    if (shouldBlock(event.target)) event.stopPropagation()
  }
  root.addEventListener('mousedown', blockDrag, { capture: true })
  root.addEventListener('touchstart', blockDrag, { capture: true })
  options.setTurnGuard?.(() => locked || guardingRules())

  // Las filas del desglose: la misma lista tanto si se acaba de aprobar como si se
  // reabre un tomo ya sellado —ver más abajo—, para que las dos no puedan desincronizarse.
  const buildBlockRows = (scores: FinalExamScore): HTMLElement[] => {
    const blocksList = reveal.querySelector<HTMLOListElement>('[data-exam-reveal-blocks]')
    const rows = ([1, 2, 3] as const).map((block) => {
      const row = document.createElement('li')
      row.className = 'exam-reveal__block-row'

      const label = document.createElement('span')
      label.textContent = BLOCK_LABELS[block]

      const score = document.createElement('span')
      score.className = 'exam-reveal__block-score'
      score.textContent = scores[block].toFixed(1)

      row.append(label, score)
      return row
    })
    blocksList?.replaceChildren(...rows)
    return rows
  }

  // La nota final y el sello. Verde si se aprueba HOY o si el tomo ya venía sellado
  // —repasar no puede quitar lo ganado—, rojo solo cuando no hay sello de ninguna de las
  // dos formas. El rubrique diagonal de «Aprobado» va con el verde: no tiene sentido
  // aprobado a medias.
  const paintFinal = (scores: FinalExamScore, passed: boolean): void => {
    const finalEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-final]')
    const sealImg = reveal.querySelector<HTMLImageElement>('[data-exam-reveal-seal-img]')
    const stampEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-stamp]')
    const keptEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-kept]')
    const finalScore = ([1, 2, 3] as const).reduce((sum, block) => sum + scores[block], 0) / 3
    const earned = passed || sealed

    if (finalEl) finalEl.textContent = `${finalScore.toFixed(1)} / 10`
    if (sealImg) sealImg.src = earned ? '/images/green-seal.webp' : '/images/red-seal.webp'
    if (earned) stampEl?.removeAttribute('hidden')
    else stampEl?.setAttribute('hidden', '')
    // El aviso solo cuando el verde NO sale de la nota de hoy, que es cuando chirría.
    if (earned && !passed) keptEl?.removeAttribute('hidden')
    else keptEl?.setAttribute('hidden', '')
  }

  // ¿YA ESTÁ SELLADO? Sin forzar a repetir un examen ya ganado — «repasar no vuelve a
  // sellar» es la misma regla que ya rige Mi escritorio. Se salta el botón de «Ver
  // evaluación completa»: no hay suspense en algo que ya se sabía, así que se enseña
  // el resultado directo y sin animar — el mismo criterio que usa `examSeal.ts` con
  // los sellos ganados de antes.
  void fetchSeals(blockId)
    .then((earned) => {
      if (!mounted || !earned.has(FINAL_SEAL)) return
      sealed = true

      // El regalo sigue siendo suyo aunque el examen se aprobara otro día: lo ganado está
      // ganado, y la chuleta es justo lo que se vuelve a abrir para repasar.
      unlockGift()

      // Un intento PEDIDO deja las normas en paz —en blanco y con «Empezar»—: es lo que
      // se acaba de pulsar. Sin esto, «Volver a hacerlo» remonta el libro y se topa otra
      // vez con el aviso de sellado, sin forma de volver a examinarse.
      if (attempt > 0) return

      rules.querySelector<HTMLElement>('[data-exam-start]')?.setAttribute('hidden', '')
      rules.querySelector<HTMLElement>('[data-exam-done]')?.removeAttribute('hidden')
      rules.querySelector<HTMLElement>('[data-exam-retake]')?.removeAttribute('hidden')

      reveal.querySelector<HTMLElement>('[data-exam-reveal-show]')?.setAttribute('hidden', '')
      reveal.querySelector<HTMLElement>('[data-exam-reveal-body]')?.removeAttribute('hidden')

      // Con la nota guardada, el desglose de verdad; sin ella —tomos sellados antes de
      // que existiera este guardado— el aviso genérico de siempre.
      const stored = readFinalExamScore(blockId)
      if (stored) {
        buildBlockRows(stored).forEach((row) => {
          row.style.opacity = '1'
        })
        paintFinal(stored, true)
      } else {
        const finalEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-final]')
        if (finalEl) finalEl.textContent = 'Ya superado'
        reveal.querySelector<HTMLImageElement>('[data-exam-reveal-seal-img]')?.setAttribute(
          'src',
          '/images/green-seal.webp',
        )
        reveal.querySelector<HTMLElement>('[data-exam-reveal-stamp]')?.removeAttribute('hidden')
      }

      reveal.querySelector<HTMLElement>('[data-exam-reveal-seal]')?.classList.add('exam-seal--earned')
    })
    // Sin cortar el examen por esto: lo peor que pasa es no saltarse las normas de un
    // tomo ya sellado, y `fetchSeals` puede lanzar desde que traduce los fallos de
    // Supabase.
    .catch(() => {})

  // EMPEZAR: bloquea el libro y entra en la primera frase.
  const startButton = rules.querySelector<HTMLButtonElement>('[data-exam-start]')
  const backButton = rules.querySelector<HTMLButtonElement>('[data-exam-back]')
  const onStart = () => {
    locked = true
    // El «Volver» se va con el examen empezado: los botones se saltan el bloqueo, así que
    // dejarlo puesto sería una puerta abierta al temario en mitad de la prueba.
    backButton?.setAttribute('hidden', '')
    flip.flipPrev()
  }
  startButton?.addEventListener('click', onStart)

  // El libro va montado al revés, así que retroceder es flipNext — ver VolumeReader.
  const onBack = () => flip.flipNext()
  backButton?.addEventListener('click', onBack)

  // LAS FRASES. Agrupadas por bloque y ORDENADAS por su posición de lectura —el DOM
  // las trae al revés, ver `VolumeReader`—, y desde ahí partidas en parejas de dos:
  // exactamente las que comparten plana en `readerConfig.ts`. Las dos hojas de una
  // misma plana ya se ven a la vez —no hace falta pasar página para ver la
  // izquierda—, así que el giro espera a que las DOS estén enviadas, no a la primera.
  // Solo las del EXAMEN: la misma hoja se usa para practicar detrás de cada regla, y
  // esas no llevan bloque. Sin el filtro, el examen las contaría entre sus frases.
  const sentenceEls = [...root.querySelectorAll<HTMLElement>('.sentence-build[data-exam-block]')]
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

  // Puntúa un bloque en su hoja de resultados. Se llama UNA vez, al pulsar «Evaluar»
  // —nunca sola: evaluar es obligatorio, no un aviso que aparece por su cuenta—.
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

    const teardowns = sentences.map((sentenceEl) => {
      const next = sentenceEl.querySelector<HTMLButtonElement>('[data-exam-next]')
      if (!next) return null

      const onNext = () => {
        // No se puede reenviar la misma frase ni tocar sus tarjetas: pulsado
        // «Hecho», la norma ya avisada es que no se puede volver atrás.
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
          // Ya se puede evaluar: NO se evalúa sola. Ver el botón «Evaluar» de
          // `ExamResults.tsx` y su cableado más abajo.
          const evaluateButton = resultsPanel(block)?.querySelector<HTMLButtonElement>(
            '[data-exam-evaluate]',
          )
          if (evaluateButton) evaluateButton.disabled = false

          // Con un número impar de frases, la última se queda SOLA en su plana y
          // comparte hoja con los resultados —ver `readerConfig.ts`—: ya están a la
          // vista, así que no hace falta pasar página para llegar a evaluar. Con
          // dos, los resultados van en la plana siguiente y sí hay que pasarla.
          if (sentences.length === 1) return
        }

        flip.flipPrev()
      }

      next.addEventListener('click', onNext)
      return () => next.removeEventListener('click', onNext)
    })

    return teardowns
  })

  // EVALUAR: obligatorio antes de seguir. Se habilita arriba, al terminar la última
  // frase del bloque; al pulsarlo, se apaga a sí mismo y puntúa —lo que a su vez
  // habilita «Continuar», dentro de `populateResults`—.
  const evaluateTeardowns = ([1, 2, 3] as const).map((block) => {
    const evaluateButton = resultsPanel(block)?.querySelector<HTMLButtonElement>(
      '[data-exam-evaluate]',
    )
    if (!evaluateButton) return null

    const onEvaluate = () => {
      evaluateButton.disabled = true
      populateResults(block)
    }

    evaluateButton.addEventListener('click', onEvaluate)
    return () => evaluateButton.removeEventListener('click', onEvaluate)
  })

  const resultsPanels = [...root.querySelectorAll<HTMLElement>('.exam-results')]
  const resultsTeardowns = resultsPanels.map((panel) => {
    const continueButton = panel.querySelector<HTMLButtonElement>('[data-exam-continue]')

    const onContinue = () => flip.flipPrev()

    continueButton?.addEventListener('click', onContinue)
    return () => continueButton?.removeEventListener('click', onContinue)
  })

  // LA REVELACIÓN. No se dispara sola al llegar: hace falta pedirla con «Ver
  // evaluación completa» —ver `ExamReveal.tsx`—, que es lo que arranca la animación.
  const showButton = reveal.querySelector<HTMLButtonElement>('[data-exam-reveal-show]')
  const bodyEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-body]')

  const onShowReveal = () => {
    if (revealed) return
    revealed = true
    locked = false

    showButton?.setAttribute('hidden', '')
    bodyEl?.removeAttribute('hidden')

    const sealEl = reveal.querySelector<HTMLElement>('[data-exam-reveal-seal]')
    const retryButton = reveal.querySelector<HTMLButtonElement>('[data-exam-retry]')

    const scores: FinalExamScore = { 1: tallies[1].score, 2: tallies[2].score, 3: tallies[3].score }
    const passed = ([1, 2, 3] as const).every((block) => scores[block] >= 5)

    const rows = buildBlockRows(scores)

    // Verde si se aprueba, rojo si se suspende — el mismo gesto de sello en los dos
    // casos, ver `stamp` en `examSeal.ts`, solo cambia la imagen.
    const finish = () => {
      paintFinal(scores, passed)
      if (sealEl) stamp(sealEl)

      if (passed) {
        // Sin esto, reabrir el tomo más adelante solo encontraría el sello y volvería
        // a caer en el aviso genérico — ver la rama de arriba, «¿YA ESTÁ SELLADO?».
        saveFinalExamScore(blockId, scores)
        // El sello cae en esta hoja y el sobre de la de enfrente se enciende a la vez:
        // las dos están a la vista, así que el premio se ve llegar. Pero ESPERA a que
        // el sello llegue al servidor antes de pedir el carné: si el sobre se abre
        // antes, `fetchJourney` cuenta las insignias sin la que se acaba de ganar y la
        // carta enseña un 0% que no es real —se ve bien al reabrir porque para
        // entonces el sello ya está.
        void saveSeal(blockId, FINAL_SEAL)
          .catch(() => undefined)
          .then(() => unlockGift())
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

  showButton?.addEventListener('click', onShowReveal)

  // EMPEZAR DE CERO: vuelve la marca de lectura a la plana de normas ANTES de pedir el
  // nuevo intento — `VolumeReader` remonta el libro entero al cambiar `examAttempt`,
  // y sin esto se abriría de nuevo sobre la propia revelación.
  //
  // Un botón en cada punta del examen, con el mismo gesto detrás: «Reintentar» tras
  // suspender, y «Volver a hacerlo» en las normas de un tomo ya sellado.
  const retryButton = reveal.querySelector<HTMLButtonElement>('[data-exam-retry]')
  const retakeButton = rules.querySelector<HTMLButtonElement>('[data-exam-retake]')
  const onRetry = () => {
    if (Number.isInteger(rulesFolio) && rulesFolio > 0) writeBookmark(blockId, rulesFolio)
    retry()
  }
  retryButton?.addEventListener('click', onRetry)
  retakeButton?.addEventListener('click', onRetry)

  return () => {
    mounted = false
    root.removeEventListener('mousedown', blockDrag, { capture: true })
    root.removeEventListener('touchstart', blockDrag, { capture: true })
    startButton?.removeEventListener('click', onStart)
    backButton?.removeEventListener('click', onBack)
    showButton?.removeEventListener('click', onShowReveal)
    retryButton?.removeEventListener('click', onRetry)
    retakeButton?.removeEventListener('click', onRetry)
    sentenceTeardowns.forEach((teardown) => teardown?.())
    evaluateTeardowns.forEach((teardown) => teardown?.())
    resultsTeardowns.forEach((teardown) => teardown())
  }
}
