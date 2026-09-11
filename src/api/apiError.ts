// Los fallos que puede devolver el servidor, con nombre.
//
// Forman parte del CONTRATO con el backend, igual que las funciones de esta
// carpeta: la pantalla decide qué decir según el código, así que el día que llegue
// el servidor de verdad tiene que devolver estos mismos códigos —o quien lo llame
// traducir los suyos a estos—. Firebase y Nest tienen los suyos propios; aquí se
// eligieron los que la app necesita distinguir, no los de ninguno de los dos.
export type ApiErrorCode =
  // Sin conexión, o el servidor no ha contestado.
  | 'network'
  // Hace falta una cuenta y no hay sesión.
  | 'unauthorized'
  // Hay sesión, pero no da derecho a eso: un tomo que todavía no se ha ganado.
  | 'forbidden'
  // No existe, o todavía no está escrito.
  | 'not-found'
  // Fallos del formulario de cuenta.
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

// El código de cualquier cosa que se haya lanzado. Lo que no sea un `ApiError`
// —un fallo de programación, un JSON roto— se trata como un fallo de red: para
// quien usa la app es lo mismo, algo no ha llegado y se puede reintentar.
export function apiErrorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'network'
}
