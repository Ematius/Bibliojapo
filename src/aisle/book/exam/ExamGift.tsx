import { BookButton } from '../parts/BookButton'
import './ExamGift.scss'

// Los cinco fotogramas del sobre, en orden de apertura. Van los cinco al DOM y se
// encienden por turnos: cambiando el `src` sobre la marcha, el primer pase se vería a
// tirones mientras el navegador descarga cada imagen. Ver `giftOpening.ts`.
const ENVELOPE_FRAMES = [
  '/images/hallways/letter/envelope-closed.webp',
  '/images/hallways/letter/envelope-open-25.webp',
  '/images/hallways/letter/envelope-open-50.webp',
  '/images/hallways/letter/envelope-open-75.webp',
  '/images/hallways/letter/envelope-open-100.webp',
]

const LETTER_PAPER = '/images/desk/hoja-frente.webp'

// La plana del regalo: el sobre cerrado, y dentro una carta corta.
//
// NACE APAGADO Y SIN PODER PULSARSE. El regalo es por aprobar, así que quien enciende el
// sobre y prepara la carta es `finalExam.ts`, al estampar el sello verde —o al entrar, si
// el tomo ya venía sellado—. Suspender no cambia nada: el sobre se queda como está.
//
// LA CARTA NACE CON SUS DOS VERSIONES YA ESCRITAS, las dos ocultas: `giftLetter.ts` decide
// cuál enseñar —sin cuenta no hay % que dar ni tomo 2 que abrir, así que ese aviso pide
// crear una— y solo entonces se deja pulsar «Recibir regalo». Así la animación de apertura
// nunca se encuentra la carta a medio escribir.
export function ExamGift() {
  return (
    <div className="exam-gift" data-exam-gift>
      {/* Lo que se ve mientras el sobre está apagado. `finalExam.ts` lo cambia por el de
          abajo en cuanto el tomo queda aprobado. */}
      <p className="exam-gift__note" data-gift-note>
        Dentro hay un regalo por cerrar el tomo. El lacre solo cede con el sello verde.
      </p>

      <p className="exam-gift__note exam-gift__note--ready" data-gift-ready hidden>
        El lacre ha cedido.
      </p>

      <div className="exam-gift__stage">
        <div className="exam-gift__envelope" data-gift-envelope>
          {ENVELOPE_FRAMES.map((src, index) => (
            <img
              className="exam-gift__frame"
              // El primero es el único que se ve al llegar; los otros cuatro esperan
              // apagados a que los encienda la animación.
              data-gift-frame={index}
              src={src}
              alt={index === 0 ? 'Un sobre lacrado con un sello verde' : ''}
              key={src}
            />
          ))}
        </div>

        {/* La carta. Nace oculta dentro del sobre y `giftOpening.ts` la trae hacia delante
            cuando termina la apertura. */}
        <div className="exam-gift__letter" data-gift-letter hidden>
          <div
            className="exam-gift__paper"
            style={{ backgroundImage: `url('${LETTER_PAPER}')` }}
          >
            {/* Sin cuenta: no hay % que enseñar —el carné es de la cuenta— ni tomo 2 que
                abrir todavía, así que el mensaje pide crear una en vez de prometer algo
                que el navegador no puede cumplir solo. */}
            <p
              className="exam-gift__letter-line"
              data-gift-no-account
              data-gift-line="only"
              hidden
            >
              Para acceder a este regalo, que se guardará en tu escritorio, deberás hacerte
              una cuenta. Muchas gracias por aprender con nosotros.
            </p>

            {/* Con cuenta: la enhorabuena, los % del carné ya actualizados al tomo recién
                aprobado —los rellena `giftLetter.ts`— y el aviso del regalo y del tomo
                siguiente. */}
            <div className="exam-gift__congrats" data-gift-account hidden>
              <p className="exam-gift__letter-line" data-gift-line="intro">
                ¡Enhorabuena! Has aprobado, y ahora tu conocimiento ha aumentado:
              </p>

              <ul className="exam-gift__percents" data-gift-percents />

              <p className="exam-gift__letter-line" data-gift-line="outro">
                Te hemos regalado una chuleta que estará en tu escritorio
                y unas paginas de anime, y también acceso al
                siguiente tomo. ¡Felicidades! Sigue así.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apagado de nacimiento: lo enciende `finalExam.ts` y nadie más, y solo cuando la
          carta ya está escrita —ver `giftLetter.ts`—. */}
      <BookButton className="exam-gift__open" data-gift-open="true" disabled>
        Recibir regalo
      </BookButton>
    </div>
  )
}
