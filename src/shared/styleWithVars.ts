import type { CSSProperties } from 'react'

// Estilo en línea con custom properties CSS (--variable) además de las
// propiedades estándar de React — CSSProperties no las declara por defecto.
//
// Está aquí y no en un dominio porque el patrón es el mismo en todos: los
// valores de colocación viven en la config y llegan al CSS como variables.
export type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>
