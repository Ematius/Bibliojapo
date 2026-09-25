// Avisa por correo de cada aviso nuevo de Contacta. La dispara un Database Webhook de
// la tabla `feedback`, nunca el navegador: la clave de Resend no puede viajar en el
// bundle, o cualquiera podría mandar correo en tu nombre.
//
// Se despliega desde el panel —Edge Functions— y lee sus tres secretos de ahí mismo.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FEEDBACK_TO = Deno.env.get('FEEDBACK_TO')
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

interface FeedbackRow {
  id: string
  kind: 'bug' | 'idea' | 'other'
  message: string
  email: string
  route: string
  user_agent: string
  viewport: string
  account_id: string | null
}

const KIND_LABEL: Record<FeedbackRow['kind'], string> = {
  bug: 'Algo se ha roto',
  idea: 'Una idea',
  other: 'Otra cosa',
}

// Lo que escribe quien avisa va dentro de un correo HTML: sin escapar, un mensaje con
// etiquetas podría colar enlaces o formato en el aviso que te llega.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

Deno.serve(async (request) => {
  if (request.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('nope', { status: 401 })
  }
  if (!RESEND_API_KEY || !FEEDBACK_TO) {
    return new Response('faltan secretos', { status: 500 })
  }

  const { record } = (await request.json()) as { record: FeedbackRow }

  const rows = [
    ['Tipo', KIND_LABEL[record.kind] ?? record.kind],
    ['Responder a', record.email || '— no dejó correo —'],
    ['Cuenta', record.account_id ?? 'sin cuenta'],
    ['Pantalla', record.route],
    ['Ventana', record.viewport],
    ['Navegador', record.user_agent],
  ]

  const html = `
    <h2>${escapeHtml(KIND_LABEL[record.kind] ?? record.kind)}</h2>
    <p style="white-space:pre-wrap;font-size:16px">${escapeHtml(record.message)}</p>
    <hr>
    <table style="font:14px sans-serif;color:#555">
      ${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(String(v))}</td></tr>`).join('')}
    </table>
  `

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Hasta que haya un dominio verificado en Resend, este remitente es el único
      // que se puede usar, y solo llega a tu propia dirección.
      from: 'Bibliojapo <onboarding@resend.dev>',
      to: FEEDBACK_TO,
      reply_to: record.email || undefined,
      subject: `Bibliojapo · ${KIND_LABEL[record.kind] ?? record.kind}`,
      html,
    }),
  })

  // El aviso YA está guardado en la tabla: si el correo falla, no se pierde nada, así
  // que se responde el fallo para que quede en los registros y no se reintenta.
  if (!sent.ok) return new Response(await sent.text(), { status: 502 })

  return new Response('ok')
})
