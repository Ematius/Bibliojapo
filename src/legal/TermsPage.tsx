import { Link } from 'react-router-dom'
import { SiteNav } from '../shared/SiteNav'
import { CONTACT_EMAIL, LAST_UPDATED, MINIMUM_AGE, RESPONSIBLE_NAME } from './legalInfo'
import './LegalPage.scss'

// Aviso legal y condiciones de uso. Van juntos porque quien los busca busca lo mismo: quién
// hay detrás y qué puede esperar.
//
// Sin NIF ni domicilio fiscal: hoy es un proyecto personal gratuito y no hay actividad
// económica que declarar. El día que se cobre, esto se amplía —y con ello llegan las
// condiciones de contratación, que son otra cosa y todavía no existen.
export function TermsPage() {
  const mailto = 'mailto:' + CONTACT_EMAIL

  return (
    <main className="legal-page">
      <article className="legal-page__sheet">
        <h1 className="legal-page__title">Aviso legal y condiciones</h1>
        <p className="legal-page__updated">Última actualización: {LAST_UPDATED}</p>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Quién hay detrás</h2>
          <p className="legal-page__text">
            Bibliojapo lo hace {RESPONSIBLE_NAME}, a título personal. No es una empresa ni una
            academia: es un proyecto propio para aprender japonés tomo a tomo. El contacto es{' '}
            <a className="legal-page__link" href={mailto}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">En qué estado está</h2>
          <p className="legal-page__text">
            En construcción, y se dice por delante: el temario está a medias y se va escribiendo
            mientras la app ya se usa. Los tomos que faltan se ven en la estantería y avisan de
            que todavía no están escritos. Puede haber fallos, puede haber erratas en el
            contenido y puede que algo deje de funcionar un rato.
          </p>
          <p className="legal-page__text">
            Si encuentras algo roto,{' '}
            <Link className="legal-page__link" to="/contact">
              cuéntanoslo
            </Link>
            : llega mucho antes que si esperamos a encontrarlo nosotros.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Tu cuenta</h2>
          <p className="legal-page__text">
            Hace falta tener {MINIMUM_AGE} años o más. El primer tomo se lee entero sin cuenta;
            a partir de ahí se pide una para que tus sellos no vivan solo en este navegador.
          </p>
          <p className="legal-page__text">
            Es tuya y es personal: no la compartas. Tú eliges la contraseña y tú la cuidas. Si
            crees que alguien ha entrado en ella, cámbiala y avísanos.
          </p>
          <p className="legal-page__text">
            Puedes irte cuando quieras. El botón para borrarla tú mismo todavía no está puesto;
            hasta que lo esté, pídemelo por{' '}
            <Link className="legal-page__link" to="/contact">
              Contacta
            </Link>{' '}
            o por correo y la borro yo, sin preguntarte por qué.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Qué cuesta</h2>
          <p className="legal-page__text">
            Hoy, nada. Mientras el temario esté a medias, todo es gratis: del segundo tomo en
            adelante hay que registrarse, pero no pagar. Nadie paga por un curso a medio
            escribir.
          </p>
          <p className="legal-page__text">
            El día que el temario esté entero, parte del contenido pasará a ser de pago. Cuando
            llegue se avisará antes y con claridad, y lo que ya hayas conseguido seguirá siendo
            tuyo: una insignia ganada no se retira.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">De quién es el contenido</h2>
          <p className="legal-page__text">
            El japonés no es de nadie, pero las ilustraciones, los textos, las mnemotecnias, los
            audios y el código de Bibliojapo sí. Puedes usarlos para aprender todo lo que
            quieras; lo que no puedes es copiarlos, redistribuirlos ni publicarlos por tu cuenta
            sin permiso.
          </p>
          <p className="legal-page__text">
            Tampoco vale extraer el temario de forma automática ni volcarlo a otro sitio. Si
            quieres usar algo de aquí para algo tuyo, pregunta: lo más probable es que la
            respuesta sea sí.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Hasta dónde llega mi responsabilidad</h2>
          <p className="legal-page__text">
            Bibliojapo se ofrece tal cual, sin garantizar que esté libre de errores ni que
            aprender aquí te lleve a aprobar ningún examen oficial. Pongo cuidado en que el
            contenido sea correcto, y cuando se me señala un fallo lo corrijo, pero no respondo
            de los daños que pueda causarte un error del temario o una caída del servicio.
          </p>
          <p className="legal-page__text">
            Nada de esto recorta los derechos que te da la ley como consumidor.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Si esto cambia</h2>
          <p className="legal-page__text">
            Estas condiciones se irán actualizando conforme crezca la app. Cuando cambie algo
            que te afecte de verdad, lo verás avisado dentro de la app.
          </p>
        </section>

        <section className="legal-page__section">
          <h2 className="legal-page__heading">Qué ley se aplica</h2>
          <p className="legal-page__text">
            La española. Si eres consumidor, puedes reclamar ante los tribunales de tu lugar de
            residencia.
          </p>
        </section>

        <p className="legal-page__text">
          <Link className="legal-page__link" to="/privacidad">
            Política de privacidad
          </Link>
        </p>
      </article>

      <SiteNav />
    </main>
  )
}
