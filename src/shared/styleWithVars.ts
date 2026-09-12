import type { CSSProperties } from 'react'

// Estilo en línea con custom properties CSS además de las propiedades estándar:
// `CSSProperties` no declara las `--variable`.
export type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>
