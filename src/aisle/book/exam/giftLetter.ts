// Qué carta enseña el sobre. Sin cuenta no hay % que dar —el carné es de la cuenta— ni
// tomo 2 que abrir de verdad, así que la carta pide crear una en vez de prometer algo que
// el navegador no puede cumplir solo. Con cuenta, la enhorabuena con los % ya actualizados.
//
// No decide CUÁNDO se llama —eso es `finalExam.ts`, al aprobar o al reabrir un examen ya
// sellado— ni CÓMO se anima —eso es `giftOpening.ts`—: esto solo dice qué carta es.
import { getSession } from '../../../api/account'
import { fetchJourney, type TrackId } from '../../../api/progress'

const TRACK_LABELS: Record<TrackId, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  vocabulary: 'Vocabulario',
}

// Deja la carta lista para abrirse: la versión que toca, visible, y con sus % puestos si
// los lleva. `finalExam.ts` espera a que esto termine antes de dejar pulsar «Recibir
// regalo» — abrir el sobre sobre una carta a medio escribir se vería peor que la espera.
export async function prepareGiftLetter(gift: HTMLElement): Promise<void> {
  const noAccount = gift.querySelector<HTMLElement>('[data-gift-no-account]')
  const account = gift.querySelector<HTMLElement>('[data-gift-account]')

  if (getSession().status !== 'signedIn') {
    account?.setAttribute('hidden', '')
    noAccount?.removeAttribute('hidden')
    return
  }

  const percentsEl = gift.querySelector<HTMLUListElement>('[data-gift-percents]')

  // Si el servidor falla, mejor una carta sin números que una carta que no se abre nunca:
  // la enhorabuena y el aviso del regalo siguen siendo ciertos aunque el carné no responda.
  const tracks = await fetchJourney().catch(() => [])

  if (percentsEl) {
    percentsEl.replaceChildren(
      ...tracks.map((track) => {
        const li = document.createElement('li')
        li.className = 'exam-gift__percent'

        const ratio = track.total > 0 ? Math.round((track.learned / track.total) * 100) : 0

        const label = document.createElement('span')
        label.className = 'exam-gift__percent-label'
        label.textContent = TRACK_LABELS[track.id]

        const value = document.createElement('span')
        value.className = 'exam-gift__percent-value'
        value.textContent = `${ratio}% · ${track.learned} de ${track.total}`

        li.append(label, value)
        return li
      }),
    )
  }

  noAccount?.setAttribute('hidden', '')
  account?.removeAttribute('hidden')
}
