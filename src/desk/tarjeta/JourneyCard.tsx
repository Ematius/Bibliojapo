import type { JourneyTrack, TrackId } from '../../api/progress'
import './JourneyCard.scss'

// Lo que se lee en el carné: cuánto se lleva recorrido del N5 y qué tomos se han cerrado.
//
// No calcula nada: los cuatro frentes llegan contados del servidor. Contar en el navegador
// obligaría a traerse el temario entero, que del tomo 2 en adelante es de pago.
//
// Arcos y no barras porque son cuatro cifras pequeñas que se comparan entre sí: cuatro barras
// cortas en fila se leen como un gráfico, y cuatro círculos como cuatro sellos.

// En español porque es texto de interfaz: el contrato solo trae el identificador.
const TRACK_LABELS: Record<TrackId, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  vocabulary: 'Vocabulario',
}

// El arco se dibuja sobre una circunferencia de radio fijo en el sistema del SVG. El
// perímetro se calcula una vez porque es lo que parte el trazo en «pintado» y «por pintar».
const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function TrackDial({ track }: { track: JourneyTrack }) {
  const ratio = track.total > 0 ? Math.min(track.learned / track.total, 1) : 0

  return (
    <li className="journey-card__track">
      <p className="journey-card__name">{TRACK_LABELS[track.id]}</p>

      <svg className="journey-card__dial" viewBox="0 0 100 100" aria-hidden="true">
        {/* El surco entero, para que se vea lo que falta y no solo lo hecho. */}
        <circle className="journey-card__groove" cx="50" cy="50" r={RADIUS} />

        {/* Y lo recorrido encima. Empieza arriba y no a la derecha, que es donde
            un SVG pone el cero: de ahí el giro de un cuarto. */}
        <circle
          className="journey-card__arc"
          cx="50"
          cy="50"
          r={RADIUS}
          transform="rotate(-90 50 50)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
        />
      </svg>

      <p className="journey-card__percent">{Math.round(ratio * 100)}%</p>

      {/* Los dos números, además del porcentaje: «12 de 46» dice lo que queda de
          una forma que un tanto por ciento no dice. */}
      <p className="journey-card__count">
        {track.learned} de {track.total}
      </p>
    </li>
  )
}

interface JourneyCardProps {
  name: string
  // null mientras llega. Se enseñan los arcos vacíos en vez de un hueco: el carné ya tiene su
  // sitio hecho y verlo aparecer entero de golpe da un salto.
  tracks: JourneyTrack[] | null
  volumes: number
}

export function JourneyCard({ name, tracks, volumes }: JourneyCardProps) {
  return (
    <div className="journey-card">
      <p className="journey-card__owner">{name}</p>

      <ul className="journey-card__tracks">
        {(tracks ?? []).map((track) => (
          <TrackDial key={track.id} track={track} />
        ))}
      </ul>

      <p className="journey-card__volumes">
        {volumes === 0
          ? 'Ningún tomo cerrado todavía'
          : volumes === 1
            ? '1 tomo cerrado'
            : `${volumes} tomos cerrados`}
      </p>
    </div>
  )
}
