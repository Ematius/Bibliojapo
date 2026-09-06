// Barajado de Fisher-Yates.
//
// No se usa `sort(() => Math.random() - 0.5)`, que es lo primero que se escribe:
// ese reparte con sesgo —hay órdenes que salen bastante más que otros— y en un
// ejercicio de elegir un sesgo es una posición o una tarjeta que sale más que las
// demás.
//
// Estaba escrito igual en `KanaMatch.tsx` y en `WordPick.tsx`; a la tercera vez que
// hacía falta —aquí, para elegir qué ejercicios entran en el repaso— se saca a su
// propia pieza. Ver la regla de tres en CLAUDE.md.
export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
