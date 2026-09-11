import type { ApiErrorCode } from '../api/apiError'
import { PASSWORD_MIN_LENGTH } from '../api/account'

// Qué se le dice a quien falla al entrar o al crear la cuenta.
//
// Cada mensaje dice qué hacer, no qué ha pasado por dentro. Los códigos que no
// pueden salir de un formulario —un tomo cerrado, algo que no existe— caen en el
// genérico: si llegaran aquí sería un fallo nuestro, no suyo.
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

// La pista de la contraseña, dicha antes de que haga falta.
export const PASSWORD_HINT = `Al menos ${PASSWORD_MIN_LENGTH} caracteres.`

// Cómo aparece y se va el panel.
//
// El velo entra primero y la tarjeta sube sobre él un instante después, como un
// carné que se deja sobre la mesa. Al irse, las dos a la vez y más deprisa: quien
// cierra ya ha terminado y no quiere esperar.
export const ACCOUNT_REVEAL = {
  inSeconds: 0.45,
  outSeconds: 0.22,
  // Cuánto se adelanta la tarjeta respecto al velo al entrar.
  cardDelaySeconds: 0.06,
  // Desde dónde sube la tarjeta.
  riseRem: 1.25,
  ease: 'power3.out',
  easeOut: 'power2.in',
}
