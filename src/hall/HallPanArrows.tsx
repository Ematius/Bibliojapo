import './HallPanArrows.scss'

export function HallPanArrows({
  reach,
  onPan,
}: {
  reach: { left: boolean; right: boolean }
  onPan: (direction: 1 | -1) => void
}) {
  return (
    <>
      <button
        className="hall-pan hall-pan--left"
        type="button"
        onClick={() => onPan(1)}
        disabled={!reach.left}
        aria-label="Mirar a la izquierda del vestíbulo"
      >
        <Chevron />
      </button>

      <button
        className="hall-pan hall-pan--right"
        type="button"
        onClick={() => onPan(-1)}
        disabled={!reach.right}
        aria-label="Mirar a la derecha del vestíbulo"
      >
        <Chevron />
      </button>
    </>
  )
}

// Apunta a la izquierda; la flecha de la derecha lo voltea desde el CSS.
function Chevron() {
  return (
    <svg className="hall-pan__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M15 4 L7 12 L15 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
