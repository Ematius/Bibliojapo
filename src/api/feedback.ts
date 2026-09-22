// Los avisos que manda quien usa la app: un fallo, una idea, cualquier otra cosa.
//
// ⚠ EL ENVÍO ES SIMULADO. Hoy el mensaje se guarda en la base del servidor simulado —es
// decir, en el localStorage de quien escribe— y NO LE LLEGA A NADIE. Lo que sí es de
// verdad es la pantalla: su espera, sus errores y su acuse de recibo.
//
// El día de Supabase se reescribe SOLO este archivo, sin tocar el formulario:
//   1. Tabla `feedback` con RLS y una única política de INSERT —cualquiera puede
//      escribir, nadie puede leer—. Si se pudiera leer, los avisos de unos serían
//      visibles para otros.
//   2. `sendFeedback` pasa a ser un `insert` con la clave `anon`. El `user_id` lo pone
//      el servidor con `auth.uid()`, nunca el navegador.
//   3. El aviso por correo sale de un trigger o una Edge Function, no del cliente:
//      mandarlo desde aquí pediría una clave de correo en el bundle.
// Ver «La capa `api/`» y «Supabase — las reglas que no se negocian» en CLAUDE.md.
import { getSession } from './account'
import { mockServer } from './mockServer'

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
  await mockServer.sendFeedback({ ...input, context: collectContext() })
}
