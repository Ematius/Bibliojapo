// Los avisos que manda quien usa la app: un fallo, una idea, cualquier otra cosa.
//
// El aviso se guarda en la tabla `feedback`, que solo admite escribir: nadie puede
// leer los avisos desde la app, ni los suyos.
//
// ⚠ NO AVISA POR CORREO. El mensaje llega a la base y ahí se queda hasta que alguien
// mire el panel. El correo tiene que salir de un trigger o una Edge Function, nunca
// de aquí: mandarlo desde el navegador pediría una clave de correo en el bundle.
// Ver «La capa `api/`» y «Supabase — las reglas que no se negocian» en CLAUDE.md.
import { getSession } from './account'
import { ApiError } from './apiError'
import { supabase } from './supabase'

export type { FeedbackContext, FeedbackKind, FeedbackReport } from './contract'
import type { FeedbackContext, FeedbackKind } from './contract'

// Lo que nadie escribiría a mano en el formulario y sin lo cual un fallo no se puede
// reproducir. Se recoge al enviar y no al abrir la pantalla: la ruta es la de antes de
// venir aquí solo si se navegó, así que vale la del momento del envío.
function collectContext(): FeedbackContext {
  return {
    route: window.location.pathname,
    userAgent: window.navigator.userAgent,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    sentAt: new Date().toISOString(),
    accountId: getSession().account?.id ?? null,
  }
}

export async function sendFeedback(input: {
  kind: FeedbackKind
  message: string
  email: string
}): Promise<void> {
  if (!input.message.trim()) throw new ApiError('empty-message')

  const context = collectContext()
  // `account_id` no viaja: lo pone la propia tabla con `auth.uid()`, y su política
  // rechaza cualquier otro. Firmar un aviso con la cuenta de otro es imposible.
  const { error } = await supabase.from('feedback').insert({
    kind: input.kind,
    message: input.message,
    email: input.email,
    route: context.route,
    user_agent: context.userAgent,
    viewport: context.viewport,
  })

  if (error) throw new ApiError('network')
}
