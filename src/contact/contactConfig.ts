import type { ApiErrorCode } from '../api/apiError'
import type { FeedbackKind } from '../api/feedback'

// Los tres motivos, con lo que se lee de cada uno. El orden es el de la urgencia: lo
// primero que se ofrece es avisar de algo roto, que es para lo que existe la pantalla.
export const FEEDBACK_KINDS: readonly { id: FeedbackKind; label: string }[] = [
  { id: 'bug', label: 'Algo no funciona' },
  { id: 'idea', label: 'Una idea' },
  { id: 'other', label: 'Otra cosa' },
]

// Cada mensaje dice qué hacer. Los códigos que no puede devolver este formulario caen
// en el genérico: si llegaran aquí sería un fallo nuestro, no suyo.
export const CONTACT_ERRORS: Record<ApiErrorCode, string> = {
  network: 'No se ha podido enviar. Vuelve a intentarlo.',
  'empty-message': 'Cuéntanos qué ha pasado antes de enviar.',
  'invalid-email': 'Ese correo no parece válido. Déjalo en blanco si prefieres.',
  'missing-name': 'No se ha podido enviar. Vuelve a intentarlo.',
  'weak-password': 'No se ha podido enviar. Vuelve a intentarlo.',
  'email-taken': 'No se ha podido enviar. Vuelve a intentarlo.',
  'wrong-credentials': 'No se ha podido enviar. Vuelve a intentarlo.',
  unauthorized: 'No se ha podido enviar. Vuelve a intentarlo.',
  forbidden: 'No se ha podido enviar. Vuelve a intentarlo.',
  'not-found': 'No se ha podido enviar. Vuelve a intentarlo.',
}
