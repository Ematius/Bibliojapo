import { useState } from 'react'
import { ChuletaCard } from './ChuletaCard'
import { ChuletaList } from './ChuletaList'

interface SheetChuletaProps {
  // Solo para pasarlo a la tarjeta: la lista no anima nada. Ver `useChuletaReveal.ts`.
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
type ChuletaStep = { level: 'list' } | { level: 'card'; blockId: string }

export function SheetChuleta({ lifted }: SheetChuletaProps) {
  const [step, setStep] = useState<ChuletaStep>({ level: 'list' })

  if (step.level === 'card') {
    return (
      <ChuletaCard
        blockId={step.blockId}
        lifted={lifted}
        onClose={() => setStep({ level: 'list' })}
      />
    )
  }

  return <ChuletaList onSelect={(blockId) => setStep({ level: 'card', blockId })} />
}
