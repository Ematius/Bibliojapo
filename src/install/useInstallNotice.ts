import { useState, useSyncExternalStore } from 'react'
import { isAppInstalled } from './installPreference'
import { getInstallPrompt, subscribeInstallPrompt } from './installPrompt'

export type InstallMode = 'hidden' | 'android' | 'ios'

// `pointer: coarse` es la pantalla táctil: móvil y tableta. Un portátil de 16 pulgadas o un
// monitor no la tienen, así que no ven el aviso.
function isTouchScreen(): boolean {
  return window.matchMedia('(pointer: coarse)').matches
}

function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}

// iPadOS se identifica como Mac: por eso la comprobación de pantalla táctil.
function isIos(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

export function useInstallNotice() {
  const [eligible] = useState(
    () => isTouchScreen() && !isInstalled() && !isAppInstalled(),
  )
  const [ios] = useState(isIos)
  // El evento lo recoge `installPrompt.ts` desde que arranca la app, así que llega aunque
  // Chrome lo lanzara antes de que este aviso existiera.
  const deferred = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt)
  // Cerrado solo para esta entrada: al volver a la entrada el aviso se monta de nuevo.
  const [closed, setClosed] = useState(false)

  let mode: InstallMode = 'hidden'
  if (eligible && !closed) {
    if (ios) mode = 'ios'
    else if (deferred) mode = 'android'
  }

  // Cierra solo esta vez. No se guarda nada: el aviso vuelve en la siguiente entrada.
  const dismiss = () => setClosed(true)

  // Si el usuario rechaza el cuadro del navegador, el aviso se cierra para esta entrada y
  // vuelve en la siguiente. Si acepta, `appinstalled` deja de mostrarlo para siempre.
  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setClosed(true)
  }

  return { mode, install, dismiss }
}
