import type { ApiErrorCode } from '../api/apiError'
import { PASSWORD_MIN_LENGTH } from '../api/account'

// Cada mensaje dice qué hacer, no qué ha pasado por dentro. Los códigos que no pueden salir
// de un formulario caen en el genérico: si llegaran aquí sería un fallo nuestro, no suyo.
export const ACCOUNT_ERRORS: Record<ApiErrorCode, string> = {
  network: 'No se ha podido conectar. Vuelve a intentarlo.',
  'missing-name': 'Falta tu nombre.',
  'invalid-email': 'Ese correo no parece válido.',
  'weak-password': `La contraseña necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  'email-taken': 'Ya hay una cuenta con ese correo. Prueba a entrar.',
  'wrong-credentials': 'El correo o la contraseña no coinciden.',
  unauthorized: 'Algo ha fallado. Vuelve a intentarlo.',
  forbidden: 'Algo ha fallado. Vuelve a intentarlo.',
  'not-found': 'Algo ha fallado. Vuelve a intentarlo.',
}

export const PASSWORD_HINT = `Al menos ${PASSWORD_MIN_LENGTH} caracteres.`

// El velo entra primero y la tarjeta sube sobre él un instante después.
//
// Despacio de principio a fin, sin ningún tramo que se note más rápido que el resto.
//
// ── Por qué `sine.inOut` y no `power4.inOut` ───────────────────────────────
// Cualquier curva `.inOut` reparte el mismo recorrido entre un arranque lento, un
// tramo central y una frenada lenta. Cuanto MÁS lentos se piden los extremos, más
// rápido tiene que ir el centro para llegar a tiempo — es el mismo recorrido total,
// así que lo que no se gasta en las puntas se paga de golpe en medio. `power4` pide
// extremos casi parados, y ese es justo el tirón que se notaba: no es un fallo, es
// lo que esa curva hace por diseño.
//
// `sine.inOut` es la más suave de todas las `.inOut` de GSAP: el reparto entre
// arranque, medio y frenada es el más parejo que hay, así que ningún tramo destaca
// sobre los demás y el conjunto se lee como una sola velocidad tranquila.
//
// ── Por qué la duración compensa lo que pierde la curva ────────────────────
// Sin el pico de `power4`, el arranque y la frenada ya no se notan tan marcados por
// sí solos. Para que sigan sintiéndose lentos y no solo «normales», el tiempo total
// sube: una curva suave necesita más segundos para que la lentitud se note, porque
// ya no tiene un extremo casi inmóvil que la subraye.
export const ACCOUNT_REVEAL = {
  inSeconds: 1.4,
  // Casi lo mismo saliendo: el panel tampoco tiene prisa por irse, y una salida
  // corta después de una entrada lenta se siente como un portazo.
  outSeconds: 1.2,
  cardDelaySeconds: 0.12,
  riseRem: 1.75,
  ease: 'sine.inOut',
  easeOut: 'sine.inOut',
}
