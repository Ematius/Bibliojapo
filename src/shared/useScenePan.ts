import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { SCENE_PAN as pan } from './scenePanConfig'

// Se anima `x` y nunca el `transform`: hay stages que se centran con un `translate` de
// media caja, que GSAP guarda como `xPercent`, y escribir el transform entero los
// descentraría.
export function useScenePan(stageRef: RefObject<HTMLElement | null>) {
  const [reach, setReach] = useState({ left: false, right: false })
  // Hasta dónde puede llegar la `x`, no cuánto sobra de escena: los dos stages del sitio
  // se colocan distinto —uno centrado, otro encuadrado por una zona— y solo el recorrido
  // que le queda a cada lado vale para los dos.
  const limitsRef = useRef({ min: 0, max: 0 })
  const offsetRef = useRef(0)

  const syncReach = useCallback(() => {
    const { min, max } = limitsRef.current
    const offset = offsetRef.current
    // Un píxel de margen: al llegar al tope la resta no siempre da cero exacto, y la flecha
    // se quedaría encendida sin nada que enseñar.
    setReach({ left: offset < max - 1, right: offset > min + 1 })
  }, [])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const host = stage?.parentElement
    if (!stage || !host) return

    const measure = () => {
      const hostBox = host.getBoundingClientRect()
      const stageBox = stage.getBoundingClientRect()
      const offset = offsetRef.current
      // Lo que asoma por cada lado con el desplazamiento ya puesto. En negativo es que la
      // escena no llega a ese borde y ha quedado hueco.
      const overLeft = hostBox.left - stageBox.left
      const overRight = stageBox.right - hostBox.right

      if (overLeft + overRight <= hostBox.width * pan.minRangeRatio) {
        // Sin recorrido que merezca la pena, la escena vuelve a donde la pone el CSS: al
        // girar el móvil a apaisado se vería desplazada sin poder devolverla.
        limitsRef.current = { min: 0, max: 0 }
        offsetRef.current = 0
      } else {
        limitsRef.current = { min: offset - overRight, max: offset + overLeft }
        // Ensanchar la ventana puede dejar el sitio donde se estaba mirando fuera de los
        // topes nuevos, y con él un borde al descubierto.
        offsetRef.current = gsap.utils.clamp(
          limitsRef.current.min,
          limitsRef.current.max,
          offset,
        )
      }

      gsap.set(stage, { x: offsetRef.current })
      syncReach()
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [stageRef, syncReach])

  // `direction` es hacia dónde mira la vista: 1 es hacia la izquierda de la escena, que se
  // consigue llevando el dibujo a la derecha.
  const panBy = useCallback(
    (direction: 1 | -1) => {
      const stage = stageRef.current
      const host = stage?.parentElement
      const { min, max } = limitsRef.current
      if (!stage || !host || min === max) return

      const step = host.clientWidth * pan.stepRatio * direction
      offsetRef.current = gsap.utils.clamp(min, max, offsetRef.current + step)

      gsap.to(stage, {
        x: offsetRef.current,
        duration: pan.durationSeconds,
        ease: pan.ease,
      })
      syncReach()
    },
    [stageRef, syncReach],
  )

  // Los escuchas van en el stage y no en su caja: fuera de la escena hay interfaz con sus
  // propias pulsaciones —la barra, su menú desplegado— y arrastrar sobre ella movería el
  // decorado de debajo.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let pointerId: number | null = null
    let startX = 0
    let startOffset = 0
    let isDragging = false

    const onPointerDown = (event: PointerEvent) => {
      const { min, max } = limitsRef.current
      if (min === max || event.button !== 0) return
      // Lo que se monta encima de la escena y tiene su propio gesto —un tomo abierto y su
      // velo— se queda con el dedo: arrastrando sobre el libro se pasa página, y la escena
      // de detrás no se mueve.
      if ((event.target as Element | null)?.closest('[data-no-pan]')) return
      pointerId = event.pointerId
      startX = event.clientX
      startOffset = offsetRef.current
      isDragging = false
      gsap.killTweensOf(stage)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return

      const travel = event.clientX - startX
      if (!isDragging) {
        if (Math.abs(travel) < pan.dragThresholdPx) return
        isDragging = true
        // Se captura al confirmar el arrastre y no al primer contacto: capturando antes, una
        // pulsación normal dejaría de llegar a su botón.
        stage.setPointerCapture(event.pointerId)
      }

      offsetRef.current = gsap.utils.clamp(
        limitsRef.current.min,
        limitsRef.current.max,
        startOffset + travel,
      )
      gsap.set(stage, { x: offsetRef.current })
    }

    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return
      pointerId = null
      if (!isDragging) return
      isDragging = false
      stage.releasePointerCapture?.(event.pointerId)
      syncReach()

      // El navegador manda el clic igual al soltar, así que arrastrar empezando sobre un
      // cartel entraría en su pasillo: se caza el primero que llegue y se tira.
      const swallowClick = (click: MouseEvent) => {
        click.stopPropagation()
        click.preventDefault()
      }
      document.addEventListener('click', swallowClick, { capture: true, once: true })
      // Si no llega ninguno, el escucha no puede quedarse esperando al siguiente clic bueno.
      window.setTimeout(() => {
        document.removeEventListener('click', swallowClick, { capture: true })
      }, 0)
    }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)

    return () => {
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerUp)
    }
  }, [stageRef, syncReach])

  return { reach, panBy }
}
