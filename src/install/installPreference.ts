// Una marca del dispositivo: la app ya está instalada en él, y entonces el aviso deja de salir.
// «Ahora no» no pasa por aquí: el aviso vuelve en cada entrada hasta que se instala. Envuelta
// como en `intro/introPreference.ts`: si localStorage falla, se enseña el aviso.

const INSTALLED_KEY = 'bibliojapo:app-installed'

export function isAppInstalled(): boolean {
  try {
    return window.localStorage.getItem(INSTALLED_KEY) === '1'
  } catch {
    return false
  }
}

export function markAppInstalled(): void {
  try {
    window.localStorage.setItem(INSTALLED_KEY, '1')
  } catch {
  }
}
