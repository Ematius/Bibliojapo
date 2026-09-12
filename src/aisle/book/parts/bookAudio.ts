// Los botones que suenan dentro del libro.
//
// No es un hook, igual que `kanaBoard.ts` y `kanaStrokeAnimation.ts`: page-flip clona los
// nodos de la plantilla de React, así que un `onClick` se quedaría enganchado a la copia
// que nadie ve. Esto recibe el nodo YA clonado.
//
// Atiende cualquier <button> con `data-audio`, se llame como se llame su clase, así que un
// botón nuevo suena por el hecho de decir qué archivo es. La ruta viaja en el atributo
// porque un clon fuera de React solo conserva sus atributos.
//
// Se recorren TODOS: un `querySelector` en singular se quedaría con el primero y dejaría
// los demás mudos sin dar ningún error.
export function mountBookAudio(root: HTMLElement): (() => void) | null {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-audio]')]
  if (buttons.length === 0) return null

  const teardowns = buttons.map((button) => {
    const src = button.dataset.audio
    // Un botón sin sonido se queda apagado en vez de fingir que funciona.
    if (!src) {
      button.disabled = true
      return () => {}
    }

    // Se prepara al montar y no al primer clic: así el sonido sale al pulsar y no tras una
    // espera de red, justo en el ejercicio cuyo objetivo es oírlo.
    const audio = new Audio(src)
    audio.preload = 'auto'

    // Mientras suena, el botón se apaga: volver a pulsarlo solo cortaría el sonido.
    const release = () => {
      button.disabled = false
    }

    const onPlay = () => {
      button.disabled = true
      // Desde el principio siempre: si el clip anterior se quedó a medias, la segunda
      // escucha tiene que ser entera.
      audio.currentTime = 0
      // `play()` devuelve una promesa que puede fallar. Sin este `catch` el botón se
      // quedaría apagado para siempre.
      audio.play().catch(release)
    }

    button.addEventListener('click', onPlay)
    audio.addEventListener('ended', release)
    // `ended` no llega si la carga falla, así que el botón necesita la otra puerta para
    // volver a encenderse.
    audio.addEventListener('error', release)

    return () => {
      button.removeEventListener('click', onPlay)
      audio.removeEventListener('ended', release)
      audio.removeEventListener('error', release)
      // Sin esto el sonido seguiría sonando sobre el pasillo con el tomo ya en su balda.
      audio.pause()
    }
  })

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}
