// No es un hook ni escucha cambios: se pregunta al montar la animación, que es
// cuando hay que decidir si se anima o se coloca. Devuelve `false` donde no hay
// `matchMedia` — el peor caso es animar de más, nunca dejar algo a medio colocar.
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
