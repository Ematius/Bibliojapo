// Dos marcas del dispositivo, no de la cuenta: quien ya vio la intro y quien pide verla
// siempre. Envueltas como en `bookmark.ts`: localStorage lanza en navegación privada, y ante
// la duda se enseña la intro — nunca deja a nadie sin ella por un fallo de almacenamiento.

const SEEN_KEY = 'bibliojapo:intro-seen'
const ALWAYS_KEY = 'bibliojapo:intro-always'

function read(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function write(key: string, value: boolean): void {
  try {
    if (value) window.localStorage.setItem(key, '1')
    else window.localStorage.removeItem(key)
  } catch {
  }
}

export const hasSeenIntro = () => read(SEEN_KEY)
export const markIntroSeen = () => write(SEEN_KEY, true)
export const getAlwaysIntro = () => read(ALWAYS_KEY)
export const setAlwaysIntro = (value: boolean) => write(ALWAYS_KEY, value)
