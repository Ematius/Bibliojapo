// Barajado de Fisher-Yates. No se usa `sort(() => Math.random() - 0.5)`: reparte con sesgo,
// y en un ejercicio de elegir un sesgo es una posición o una tarjeta que sale más que las
// demás.
export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
