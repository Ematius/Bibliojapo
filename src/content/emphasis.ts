// Lo resaltado dentro de un texto del temario, marcado con dos asteriscos:
//
//   'mientras **A**rturo pide el poder de la **A**mistad'
//
// La marca es del CONTENIDO, no del diseño: dice «esto es el sonido del kana», no «esto va en
// negrita», y por eso se puede cambiar el aspecto de los 46 kana tocando una regla de CSS.
//
// Una marca dentro del texto y no la frase partida en trozos porque el temario se escribe a
// mano: una frase con asteriscos se lee y se corrige de un vistazo, y una lista no.
export interface TextPart {
  text: string
  emphasized: boolean
}

export function splitEmphasis(text: string): TextPart[] {
  // Al partir por una expresión con grupo, lo capturado queda en las posiciones impares:
  // fuera, dentro, fuera, dentro… Así se sabe qué va marcado sin recorrer el texto a mano.
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((chunk, index) => ({ text: chunk, emphasized: index % 2 === 1 }))
    // Dos marcas seguidas, o una al principio, dejan trozos vacíos por medio.
    .filter((part) => part.text !== '')
}
