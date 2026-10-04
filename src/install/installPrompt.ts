import { markAppInstalled } from './installPreference'

// Lo que Chrome lanza cuando la app ya se puede instalar. Se guarda para lanzarlo desde el
// botón del aviso: el navegador no deja pedirlo en cualquier otro momento.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// El escucha se registra al cargar el módulo y NO dentro del aviso: Chrome lanza el evento
// UNA sola vez y cuando le parece —puede caer mientras corre el vídeo de la intro, con el
// aviso todavía sin montar—. Registrándolo ahí, ese aviso no llegaba nunca.
let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function announce(): void {
  for (const listener of listeners) listener()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    announce()
  })

  // Lo lanza el navegador cuando la instalación se completa, también si se hizo desde su
  // menú: es lo único que marca la app como instalada.
  window.addEventListener('appinstalled', () => {
    deferred = null
    markAppInstalled()
    announce()
  })
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
