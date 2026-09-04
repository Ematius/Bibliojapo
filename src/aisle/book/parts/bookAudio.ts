// Los botones que suenan dentro del libro.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// El mismo motivo que en `kanaBoard.ts` y `kanaStrokeAnimation.ts`: page-flip
// clona los nodos de la plantilla de React para meterlos en su propia estructura,
// así que un `onClick` de React se quedaría enganchado a la copia que nadie ve.
// Esto recibe el nodo YA clonado y busca dentro lo que tenga que sonar.
//
// ── Por qué busca un atributo y no una clase ───────────────────────────────
// Atiende cualquier <button> que lleve `data-audio`, se llame como se llame su
// clase: hoy son el del kana y el de la palabra, y mañana el de una frase. Un
// botón nuevo suena por el hecho de decir qué archivo es, sin que haya que venir
// aquí a apuntarlo. La ruta viaja en el atributo porque un clon fuera de React
// solo conserva sus atributos.
//
// ── Un manejador por botón, no uno para el libro ───────────────────────────
// Se recorren TODOS. Con un solo botón daría igual, pero el tomo va a acabar
// teniendo decenas, y un `querySelector` en singular se quedaría con el primero y
// dejaría los demás mudos sin dar ningún error. Es un fallo que no se ve venir:
// simplemente no suena.
export function mountBookAudio(root: HTMLElement): (() => void) | null {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-audio]')]
  if (buttons.length === 0) return null

  const teardowns = buttons.map((button) => {
    const src = button.dataset.audio
    // Un botón sin sonido se queda apagado en vez de fingir que funciona: es lo
    // que se verá si un día falta el archivo de una palabra del temario.
    if (!src) {
      button.disabled = true
      return () => {}
    }

    // Se prepara al montar y no al primer clic. Son clips de unas pocas decenas de
    // KB, y así el sonido sale en el momento de pulsar y no tras una espera de
    // red, justo en el ejercicio cuyo objetivo es oírlo.
    const audio = new Audio(src)
    audio.preload = 'auto'

    // Mientras suena, el botón se apaga: volver a pulsarlo solo consigue cortar el
    // sonido a la mitad.
    const release = () => {
      button.disabled = false
    }

    const onPlay = () => {
      button.disabled = true
      // Desde el principio siempre: si el clip anterior se quedó a medias, la
      // segunda escucha tiene que ser una escucha entera, no el final de la
      // primera.
      audio.currentTime = 0
      // `play()` devuelve una promesa que puede fallar —el archivo no está, el
      // formato no se reconoce—. Sin este `catch` el botón se quedaría apagado
      // para siempre y el navegador escupiría un rechazo sin atender.
      audio.play().catch(release)
    }

    button.addEventListener('click', onPlay)
    audio.addEventListener('ended', release)
    // `ended` no llega si la carga falla, así que el botón necesita la otra
    // puerta para volver a encenderse.
    audio.addEventListener('error', release)

    return () => {
      button.removeEventListener('click', onPlay)
      audio.removeEventListener('ended', release)
      audio.removeEventListener('error', release)
      // Cerrar el libro calla el sonido: sin esto seguiría sonando sobre el
      // pasillo con el tomo ya en su balda.
      audio.pause()
    }
  })

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}
