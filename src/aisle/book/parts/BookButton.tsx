import type { ComponentPropsWithoutRef } from 'react'
import './BookButton.scss'

type BookButtonProps = ComponentPropsWithoutRef<'button'>

// Un botón del libro: latón sobre papel.
//
// Existe porque el mismo botón estaba escrito cuatro veces —animar el trazo,
// escuchar el kana, borrar la pizarra, escuchar la palabra— y cambiar su aspecto
// obligaba a tocar cuatro archivos y acordarse de los cuatro. Ahora el aspecto
// vive en un sitio y cada hoja solo dice dónde va el suyo.
//
// ── Qué pone aquí y qué pone quien lo usa ──────────────────────────────────
// Aquí: cómo se ve —el latón, el papel al pasar por encima, el foco, el apagado—.
// Quien lo usa: dónde se coloca y qué dice, a través de su propia clase. Es lo que
// permite que el de la tarjeta baje cinco unidades y el de la pauta no, sin que
// ninguno de los dos sepa cómo se pinta un botón.
//
// ── Por qué NO lleva onClick ───────────────────────────────────────────────
// Puede llevarlo —acepta todo lo que acepta un <button>—, pero dentro del tomo no
// sirve de nada: page-flip clona estas páginas y un manejador de React se queda en
// la copia que nadie ve. Ahí el clic se cablea a mano buscando el botón por su
// clase. Ver `bookAudio.ts`, `kanaBoard.ts` y `kanaStrokeAnimation.ts`.
//
// ── Por qué tiene que seguir siendo un <button> ────────────────────────────
// No es solo semántica: page-flip deja pasar la pulsación sobre <button> y <a>, y
// la anula en todo lo demás para poder arrastrar la hoja. Un <div> pulsable con
// este mismo aspecto pasaría página cada vez que se tocase.
export function BookButton({ className, type, ...rest }: BookButtonProps) {
  return (
    <button
      // `type` por defecto y no heredado del HTML: un <button> sin tipo dentro de
      // un formulario lo envía, y eso es un fallo que no aparece hasta el día que
      // alguien meta uno de estos en un formulario.
      type={type ?? 'button'}
      className={className ? `book-button ${className}` : 'book-button'}
      {...rest}
    />
  )
}
