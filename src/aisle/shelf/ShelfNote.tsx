import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { StyleWithVars } from '../../shared/styleWithVars'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import { VOLUME_LOCK, type ShelfVolume } from './shelfConfig'
import './ShelfNote.scss'

interface ShelfNoteProps {
  volume: ShelfVolume
  // Lo que se dice. Null la esconde.
  message: string | null
}

// La nota que aparece encima de un tomo que no se puede coger, diciendo por qué.
//
// Va FUERA del tomo, como hermana suya en el stage, y no dentro: el tomo está
// encogido en la balda con una escala de una fracción, y un texto dentro de él
// saldría del mismo tamaño que un lomo — ilegible.
//
// Siempre está montada, vacía y apagada cuando no hay nada que decir: un aviso
// que se anuncia a los lectores de pantalla tiene que existir ANTES de cambiar,
// o no se anuncia.
export function ShelfNote({ volume, message }: ShelfNoteProps) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const isFirstRender = useRef(true)

  // El texto se queda mientras la nota se va, para que no se vacíe a media
  // salida. Se ajusta durante el render, que es como React pide derivar estado
  // de una prop que cambia.
  const [text, setText] = useState(message)
  if (message && message !== text) setText(message)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const shown = message !== null
    const jump = isFirstRender.current || prefersReducedMotion()
    isFirstRender.current = false

    // Centrada sobre el lomo y con su borde de abajo en el ancla. Va en GSAP y no
    // en el CSS porque GSAP reescribe el transform entero al animar.
    if (jump) {
      gsap.set(root, { xPercent: -50, yPercent: -100, autoAlpha: shown ? 1 : 0, y: 0 })
      return
    }

    const tween = gsap.to(root, {
      autoAlpha: shown ? 1 : 0,
      // Sube un poco al entrar y baja al irse, como un papel que se posa.
      y: shown ? 0 : '0.35rem',
      duration: VOLUME_LOCK.noteFadeSeconds,
      ease: 'power2.out',
    })

    return () => {
      tween.kill()
    }
  }, [message])

  const style: StyleWithVars = {
    '--note-x': volume.x,
    // Encima del tomo: su base menos lo que mide.
    '--note-y': volume.baseY - volume.height,
  }

  return (
    <p className="shelf-note" style={style} ref={rootRef} role="status">
      {text}
    </p>
  )
}
