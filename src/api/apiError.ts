// Parte del contrato: el día que haya backend, sus fallos se traducen a estos
// códigos, porque son los que las pantallas distinguen para decidir qué decir.
export type ApiErrorCode =
  | 'network'
  // `unauthorized` es «hace falta cuenta»; `forbidden`, «hay cuenta pero el tomo
  // todavía no se ha ganado».
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'missing-name'
  | 'invalid-email'
  | 'weak-password'
  | 'email-taken'
  | 'wrong-credentials'
  // El correo y la contraseña están bien: lo que falta es abrir el correo de
  // confirmación. Sin código propio caería en `wrong-credentials`, que manda a
  // reintentar una contraseña que nunca ha sido el problema.
  | 'email-not-confirmed'
  // Un aviso sin nada escrito: no se manda un mensaje vacío.
  | 'empty-message'
  // Demasiadas peticiones seguidas. Esperar sirve; reintentar al momento, no.
  | 'rate-limited'
  // El servidor está mal: reintentar más tarde es lo único que se puede hacer.
  | 'server'
  // Lo que no encaja en ninguno. Reintentar NO lo arregla, así que su mensaje no lo
  // ofrece: lleva a contarlo.
  | 'unexpected'

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(code)
    this.name = 'ApiError'
    this.code = code
  }
}

// Lo que no sea un `ApiError` —un fallo de programación, un JSON roto— es `unexpected`
// y no `network`: mandar a comprobar la conexión a quien la tiene perfecta le hace
// reintentar algo que va a fallar igual las veces que haga falta.
export function apiErrorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'unexpected'
}
