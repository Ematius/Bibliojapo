import { Link } from 'react-router-dom'
import { SiteNav } from '../shared/SiteNav'
import {
  CONTACT_EMAIL,
  LAST_UPDATED,
  MINIMUM_AGE,
  PROCESSORS,
  RESPONSIBLE_NAME,
} from './legalInfo'
import './LegalPage.scss'

// La política de privacidad. Obligatoria desde que se guarda un correo, y eso pasa en cuanto
// alguien crea su cuenta: no espera al día del pago.
//
// Escrita para leerse, no para cubrirse: quien entra aquí quiere saber qué se guarda de él, y
// una plantilla de bufete de ocho mil palabras no se lo cuenta.
export function PrivacyPage() {
  const mailto = 'mailto:' + CONTACT_EMAIL

  return (
    <main className="legal-page">
      <article className="legal-page__sheet">
        <h1 className="legal-page__title">Política de privacidad</h1>
        <p className="legal-page__updated">Última actualización: {LAST_UPDATED}</p>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Quién guarda tus datos</h2>
          <p className="legal-page__text">
            Bibliojapo es un proyecto personal de {RESPONSIBLE_NAME}. No hay empresa detrás:
            soy una persona construyéndolo, y respondo yo de lo que se guarda. Para cualquier
            cosa de esta página, escribe a{' '}
            <a className="legal-page__link" href={mailto}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Qué se guarda, y para qué</h2>
          <p className="legal-page__text">
            Lo mínimo para que la biblioteca funcione. Nada se vende, nada se cede a
            anunciantes y no se construye ningún perfil tuyo.
          </p>
          <ul className="legal-page__list">
            <li className="legal-page__item">
              <strong>Tu nombre y tu correo</strong>, si creas una cuenta: identifican tu carné
              y sirven para escribirte si hay que recuperar el acceso. Tu contraseña no se
              guarda; se guarda un resumen cifrado del que no se puede volver atrás.
            </li>
            <li className="legal-page__item">
              <strong>Tu progreso</strong>: qué tomos has sellado, tus insignias y por dónde
              ibas leyendo. Es lo que hace que tu avance te siga de un dispositivo a otro.
            </li>
            <li className="legal-page__item">
              <strong>Lo que nos cuentas por Contacta</strong>: el mensaje y, si lo dejas, tu
              correo para poder contestarte.
            </li>
            <li className="legal-page__item">
              <strong>Datos técnicos de visita</strong>: qué pantallas se abren y desde qué
              tipo de dispositivo, en cifras agregadas. No llevan tu nombre ni permiten
              reconocerte entre una visita y la siguiente.
            </li>
          </ul>
          <p className="legal-page__text">
            La base legal es simple: tu cuenta y tu progreso se tratan porque hacen falta para
            darte el servicio que has pedido; los avisos de Contacta, porque los mandas tú.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Quién más los toca</h2>
          <p className="legal-page__text">
            Bibliojapo no tiene servidores propios. Se apoya en estos proveedores, y cada uno
            ve solo lo que necesita para su parte:
          </p>
          <ul className="legal-page__list">
            {PROCESSORS.map((processor) => (
              <li className="legal-page__item" key={processor.name}>
                <strong>{processor.name}</strong>: {processor.purpose}.
              </li>
            ))}
          </ul>
          <p className="legal-page__text">
            Lo que te identifica —tu cuenta y tu progreso— se guarda en servidores de Supabase
            en París, así que no sale de la Unión Europea. Vercel y Google sí son empresas
            estadounidenses, y los datos técnicos que ven al servirte la web —tu dirección IP,
            tu navegador— pueden tratarse fuera del Espacio Económico Europeo, amparados en los
            marcos de transferencia que reconoce la Comisión Europea.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Qué se guarda en tu navegador</h2>
          <p className="legal-page__text">
            Bibliojapo no usa cookies de publicidad ni de seguimiento, y por eso no te recibe
            un cartel pidiéndote permiso. Lo que sí deja en tu dispositivo es esto, y todo
            ello hace falta para que la app responda a lo que le pides:
          </p>
          <ul className="legal-page__list">
            <li className="legal-page__item">
              <strong>Tu sesión</strong>, para no pedirte la contraseña en cada pantalla.
            </li>
            <li className="legal-page__item">
              <strong>Tus preferencias</strong>: si quieres volver a ver el vídeo de entrada, si
              prefieres el guía del vestíbulo abierto o cerrado.
            </li>
            <li className="legal-page__item">
              <strong>Tu progreso sin cuenta</strong>: el primer tomo se lee sin registrarse, y
              sus sellos y su marcapáginas se quedan aquí hasta que creas tu cuenta, que los
              absorbe.
            </li>
          </ul>
          <p className="legal-page__text">
            Puedes borrarlo cuando quieras desde los datos del sitio en tu navegador. Si lo
            haces sin tener cuenta, perderás el progreso que no esté subido.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Cuánto tiempo</h2>
          <p className="legal-page__text">
            Mientras tengas la cuenta. Cuando la borras se van tu correo, tu nombre y tu
            progreso, y no queda copia. Los avisos que hayas mandado por Contacta pueden
            quedarse sin tus datos de contacto, porque lo que hay que arreglar sigue ahí
            aunque tú te vayas.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Lo que puedes exigir</h2>
          <p className="legal-page__text">
            Tienes derecho a saber qué datos tuyos hay, a corregirlos, a llevártelos, a limitar
            su uso, a oponerte y a que se borren. Para cualquiera de esas cosas, escribe a{' '}
            <a className="legal-page__link" href={mailto}>
              {CONTACT_EMAIL}
            </a>{' '}
            o cuéntanoslo por{' '}
            <Link className="legal-page__link" to="/contact">
              Contacta
            </Link>
            , y te contesto yo.
          </p>
          <p className="legal-page__text">
            El botón para borrar tu cuenta tú mismo todavía no está puesto: es de lo primero que
            falta por hacer. Hasta que lo esté, pídemelo y la borro yo, sin preguntarte por qué.
          </p>
          <p className="legal-page__text">
            Si crees que no lo he hecho bien, puedes reclamar ante la Agencia Española de
            Protección de Datos.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Edad</h2>
          <p className="legal-page__text">
            Para tener cuenta hay que tener {MINIMUM_AGE} años o más. Por debajo de esa edad
            hace falta el permiso de quien te tenga a su cargo, y Bibliojapo no está preparado
            para comprobarlo.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Si esto cambia</h2>
          <p className="legal-page__text">
            La app está en construcción, así que esta página se irá quedando corta. Cuando
            cambie algo que te afecte de verdad, lo verás avisado en la propia app y no
            escondido en una fecha nueva aquí arriba.
          </p>
        </section>

        <p className="legal-page__text">
          <Link className="legal-page__link" to="/legal">
            Aviso legal y condiciones de uso
          </Link>
        </p>
      </article>

      <SiteNav />
    </main>
  )
}
