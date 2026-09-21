// Cuándo se enseña la guía del vestíbulo: una marca del dispositivo, no de la cuenta. Envuelta
// como `introPreference.ts`: localStorage lanza en navegación privada, y ante la duda se
// enseña la guía — nunca deja a nadie sin ella por un fallo de almacenamiento.

export type HallGuideMode = 'always' | 'never'

const KEY = 'bof:hall-guide'

export function getHallGuideMode(): HallGuideMode | null {
  try {
    const value = window.localStorage.getItem(KEY)
    return value === 'always' || value === 'never' ? value : null
  } catch {
    return null
  }
}

export function setHallGuideMode(mode: HallGuideMode): void {
  try {
    window.localStorage.setItem(KEY, mode)
  } catch {
  }
}

// Sin marca es la primera vez. Quien la vio ya tiene «never» puesto, así que no vuelve a salir
// salvo que haya pedido «always».
export const shouldShowHallGuide = () => getHallGuideMode() !== 'never'
