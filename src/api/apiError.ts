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

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(code)
    this.name = 'ApiError'
    this.code = code
  }
}

// Lo que no sea un `ApiError` —un fallo de programación, un JSON roto— se trata
// como fallo de red: para quien usa la app es lo mismo, y se puede reintentar.
export function apiErrorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'network'
}
