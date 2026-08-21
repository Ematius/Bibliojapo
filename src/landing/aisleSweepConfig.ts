// Barrido lateral de la entrada al pasillo elegido.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en el hook.

export const AISLE_SWEEP = {
  durationSeconds: 1.05,
  ease: 'power2.inOut',
  // Cuánto se va la escena actual hacia la derecha, como fracción del ancho de la
  // ventana. No llega a 1 a propósito: la entrada sigue asomando mientras el
  // pasillo la cubre, que es lo que da la sensación de giro de cámara.
  stageDriftRatio: 0.32,
}
