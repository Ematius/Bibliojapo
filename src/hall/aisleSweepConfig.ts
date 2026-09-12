// Barrido lateral de la entrada al pasillo elegido.

export const AISLE_SWEEP = {
  durationSeconds: 1.05,
  ease: 'power2.inOut',
  // Cuánto se va la escena actual hacia la derecha, en fracción del ancho de la ventana.
  // No llega a 1 a propósito: la entrada sigue asomando, y eso es lo que da el giro.
  stageDriftRatio: 0.32,
}
