import type { ComponentPropsWithoutRef } from 'react'
import './BookButton.scss'

type BookButtonProps = ComponentPropsWithoutRef<'button'>

// Un botón del libro: latón sobre papel. Aquí vive cómo se ve; dónde se coloca lo dice
// quien lo usa, con su propia clase.
//
// Tiene que seguir siendo un <button>: page-flip deja pasar la pulsación sobre <button> y
// <a>, y la anula en todo lo demás para poder arrastrar la hoja. Un <div> con este mismo
// aspecto pasaría página cada vez que se tocase.
//
// Acepta `onClick`, pero dentro del tomo no sirve: page-flip clona estas páginas y el
// manejador se queda en la copia que nadie ve. Ahí el clic se cablea a mano buscando el
// botón por su clase.
export function BookButton({ className, type, ...rest }: BookButtonProps) {
  return (
    <button
      // Sin tipo, un <button> dentro de un formulario lo envía.
      type={type ?? 'button'}
      className={className ? `book-button ${className}` : 'book-button'}
      {...rest}
    />
  )
}
