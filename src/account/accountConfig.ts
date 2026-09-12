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
// Arranque y frenada larguísimos, y el panel entero despacio: no se abre, se asoma.
//
// ── Por qué `power4.inOut` ─────────────────────────────────────────────────
// Una curva `.out` o `.in` tiene UN solo extremo lento: la primera arranca disparada
// y la segunda acelera hasta el final, y ese pico de velocidad es el acelerón. Las
// `.inOut` son lentas por los dos lados, y la potencia dice cuánto: `sine` apenas se
// nota, `power4` deja el arranque y la frenada larguísimos.
//
// `linear` tampoco vale, aunque no tenga acelerón: al ir a la misma velocidad de
// principio a fin, la tarjeta se pone en marcha y se planta en seco, sin arrancar ni
// frenar. Lo que se busca es justo lo contrario — que los extremos se noten.
//
// ── Por qué los tiempos suben con la curva ─────────────────────────────────
// `power4.inOut` gasta casi todo el recorrido en los extremos, así que al medio le
// queda muy poco tiempo para cubrir el resto. Con la duración corta de antes eso
// sería otra vez un tirón, esta vez en mitad del gesto: al agrandar el arranque y la
// frenada hay que dar más tiempo a la animación entera, o el drama se paga en el
// centro.
export const ACCOUNT_REVEAL = {
  inSeconds: 1.2,
  // Casi lo mismo saliendo: el panel tampoco tiene prisa por irse, y una salida
  // corta después de una entrada lenta se siente como un portazo.
  outSeconds: 1,
  cardDelaySeconds: 0.12,
  // Sube algo más que antes. Con un recorrido mínimo y un tiempo largo la tarjeta no
  // parece lenta, parece quieta: hace falta distancia para que se vea avanzar.
  riseRem: 1.75,
  ease: 'power4.inOut',
  easeOut: 'power4.inOut',
}
