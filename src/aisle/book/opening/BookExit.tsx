import './BookExit.scss'

interface BookExitProps {
  onDismiss: () => void
}

// La salida del tomo cuando el libro llega a los bordes de la ventana. Lo que devuelve el tomo
// a la balda es el velo de detrás, y en una pantalla baja el libro crece hasta taparlo entero:
// sin esto no queda un solo trozo donde pulsar para cerrarlo.
//
// Cuelga del body y no de `VolumeOpening`: el libro se centra con un `transform`, y eso hace de
// bloque contenedor de sus descendientes `fixed`, así que el botón se saldría de la pantalla
// junto con el borde del libro en vez de quedarse en la esquina.
export function BookExit({ onDismiss }: BookExitProps) {
  return (
    <button
      className="book-exit"
      type="button"
      onClick={onDismiss}
      aria-label="Devolver el tomo a la balda"
      // Con el tomo fuera de la balda el pasillo no se recorre. Ver `useScenePan`.
      data-no-pan
    >
      <svg className="book-exit__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M7 7 L17 17 M17 7 L7 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
