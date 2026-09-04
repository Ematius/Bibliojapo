// ¿El sistema pide que no se mueva nada?
//
// La consulta estaba escrita once veces, una en cada animación, con cuatro
// nombres distintos para lo mismo. Aquí solo hay una, y de paso queda un único
// sitio donde mirar qué se considera «reducir movimiento».
//
// No es un hook ni escucha cambios: se pregunta en el momento de montar la
// animación, que es cuando hay que decidir si se anima o se coloca. Alguien que
// cambie la preferencia a mitad de una animación verá la que ya estaba en curso
// — recargar la pantalla es el gesto que arregla eso, y no compensa mantener un
// listener por pantalla para ese caso.
//
// Devuelve `false` allí donde no hay `matchMedia`: el peor caso es animar de más,
// nunca dejar una pantalla a medio colocar.
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
