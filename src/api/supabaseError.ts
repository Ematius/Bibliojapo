// El único sitio que sabe leer un error DE SUPABASE. Todo lo que venga de `auth` o de una
// tabla pasa por aquí antes de convertirse en un `ApiError`: de ahí en adelante ya solo
// corren los códigos del contrato, y el JSON de Supabase no llega nunca a una pantalla.
import type { AuthError, PostgrestError } from '@supabase/supabase-js'
import { ApiError, type ApiErrorCode } from './apiError'

// Los que se distinguen por su código, no por el HTTP con el que viajan: casi todo lo
// de `auth` llega como 400, así que el status no alcanza para saber qué ha pasado.
const AUTH_CODES: Record<string, ApiErrorCode> = {
  invalid_credentials: 'wrong-credentials',
  email_not_confirmed: 'email-not-confirmed',
  user_already_exists: 'email-taken',
  email_exists: 'email-taken',
  weak_password: 'weak-password',
  validation_failed: 'invalid-email',
  over_request_rate_limit: 'rate-limited',
  over_email_send_rate_limit: 'rate-limited',
}

// El resto se distingue por el status. `unexpected` y no `network`: el problema no es la
// conexión de quien lo ve, así que decirle que la compruebe es un consejo falso.
function byStatus(status: number | undefined): ApiErrorCode {
  if (status === 429) return 'rate-limited'
  if (status !== undefined && status >= 500) return 'server'
  return 'unexpected'
}

export function authErrorCode(error: AuthError): ApiErrorCode {
  return AUTH_CODES[error.code ?? ''] ?? byStatus(error.status)
}

export function throwAuthError(error: AuthError): never {
  throw new ApiError(authErrorCode(error))
}

// El código de Postgres para RLS: una política que no deja pasar la fila, no un fallo
// del servidor. https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes
const RLS_DENIED = '42501'

export function postgrestErrorCode(
  error: PostgrestError,
  status: number | undefined,
): ApiErrorCode {
  if (error.code === RLS_DENIED) return 'forbidden'
  return byStatus(status)
}

export function throwPostgrestError(error: PostgrestError, status: number | undefined): never {
  throw new ApiError(postgrestErrorCode(error, status))
}
