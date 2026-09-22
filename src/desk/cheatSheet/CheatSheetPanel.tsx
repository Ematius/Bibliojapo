import { useState } from 'react'
import { CheatSheetCard } from './CheatSheetCard'
import { CheatSheetList } from './CheatSheetList'

interface CheatSheetPanelProps {
  // Solo para pasarlo a la tarjeta: la lista no anima nada. Ver `useCheatSheetReveal.ts`.
  lifted: boolean
}

// Lo que se ve en la cara de la hoja levantada: primero la lista de tomos, con su selector
// de pasillo arriba, y al elegir uno, su chuleta.
//
// La elección vive aquí y no en `MyDesk` porque es de la HOJA, no de la mesa: bajar y volver
// a levantar la hoja no debería olvidar en qué tomo se estaba, igual que cerrar un libro no
// borra el punto de lectura.
//
// Bajar la hoja entera solo se hace pisando la mesa —ver `MyDesk.tsx`—, en los dos niveles:
// la lista no lleva aspa propia porque desde ahí ya se puede cambiar de pasillo o de tomo, y
// un «volver» ahí no llevaría a ningún sitio nuevo.
type CheatSheetStep = { level: 'list' } | { level: 'card'; blockId: string }

export function CheatSheetPanel({ lifted }: CheatSheetPanelProps) {
  const [step, setStep] = useState<CheatSheetStep>({ level: 'list' })

  if (step.level === 'card') {
    return (
      <CheatSheetCard
        blockId={step.blockId}
        lifted={lifted}
        onClose={() => setStep({ level: 'list' })}
      />
    )
  }

  return <CheatSheetList onSelect={(blockId) => setStep({ level: 'card', blockId })} />
}
