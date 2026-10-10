import { BookButton } from '../parts/BookButton'
import './ExamRules.scss'

// La plana que anuncia el examen final de verdad: el que sella. Explica las reglas
// ANTES de empezar porque, una vez pulsado «Empezar», el libro deja de pasar página
// por gesto — ver `finalExam.ts`. Es la única vez que hay que leer las normas antes
// de actuar, no después de encontrarse con ellas a medias.
//
// Los dos estados —«Empezar» o «ya conseguido»— nacen los dos en el DOM y
// `finalExam.ts` decide cuál se ve, en cuanto sepa si el tomo ya tiene el sello.
// Mientras lo pregunta, se ve «Empezar»: es lo que hay casi siempre.
export function ExamRules() {
  return (
    <div className="exam-rules">
      <p className="exam-rules__eyebrow">El examen final</p>
      <h2 className="exam-rules__title">Antes de empezar</h2>

      <p className="exam-rules__body">
        Este examen no avisa de nada mientras se hace: ni si una tarjeta está bien
        puesta ni si una frase está bien construida. El resultado sale al terminar
        cada bloque, y una vez pulsado «Siguiente» no se puede volver atrás a
        cambiar una respuesta.
      </p>

      <p className="exam-rules__body">
        Son tres bloques seguidos, y cada uno saca su propia nota sobre 10. Hacen
        falta un 5 en <strong>los tres</strong>: si uno se queda corto, el examen se
        suspende entero aunque los otros vayan bien, y hay que repetirlo desde el
        principio.
      </p>

      <p className="exam-rules__body">Al aprobar se sella el tomo y se abre el siguiente.</p>

      <div className="exam-rules__actions">
        <BookButton className="exam-rules__start" data-exam-start="true">
          Empezar
        </BookButton>

        {/* Con el examen por delante el libro deja de pasar hoja por gesto, así que sin
            este botón no habría forma de volver al temario. */}
        <BookButton className="exam-rules__back" data-exam-back="true">
          Volver al temario
        </BookButton>

        {/* Solo con el tomo ya sellado, donde ocupa el sitio que deja «Empezar».
            Pide un intento nuevo por la misma puerta que «Reintentar»: el examen
            nace en blanco y el sello ya ganado no entra en juego. */}
        <BookButton className="exam-rules__retake" data-exam-retake="true" hidden>
          Volver a hacerlo
        </BookButton>
      </div>

      <p className="exam-rules__done" data-exam-done hidden>
        Este tomo ya tiene su sello. Se puede seguir leyendo sin volver a examinarse, y
        repetir el examen no lo pone en juego.
      </p>
    </div>
  )
}

// Los tres bloques, en fila, con la pista de cada uno. La misma idea que
// `FinalScope`/`FinalReviewScope`: un vistazo a lo que entra antes de entrar.
export function ExamScope() {
  return (
    <div className="exam-scope">
      <ol className="exam-scope__list">
        <li className="exam-scope__item">
          <span className="exam-scope__number">1</span>
          <span className="exam-scope__label">Rōmaji → hiragana</span>
        </li>
        <li className="exam-scope__item">
          <span className="exam-scope__number">2</span>
          <span className="exam-scope__label">Español → hiragana</span>
        </li>
        <li className="exam-scope__item">
          <span className="exam-scope__number">3</span>
          <span className="exam-scope__label">Audio → hiragana</span>
        </li>
      </ol>

      <p className="exam-scope__note">
        Las mismas 15 frases del tomo, en las tres, cada vez con menos ayuda.
      </p>
    </div>
  )
}
