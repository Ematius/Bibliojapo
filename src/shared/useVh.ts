import { useEffect } from 'react'

// Mantiene la custom property --vh actualizada solo cuando cambia el ancho de la
// ventana, nunca en cambios de alto (evita que la barra de URL móvil interrumpa
// animaciones de scroll en curso).
export function useVh(): void {
  useEffect(() => {
    let lastWidth = window.innerWidth
    let lastPx = 0

    const setVh = () => {
      lastPx = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${lastPx}px`)
    }

    const handleResize = () => {
      const width = window.innerWidth
      if (width !== lastWidth) {
        lastWidth = width
        setVh()
        return
      }

      // Mismo ancho: la barra de direcciones se ha movido, no ha girado la pantalla. Solo
      // sube si crece —al ocultarse hay más alto real del que se guardó al cargar—; si
      // encoge se ignora, que es lo que evita el salto a media lectura del libro.
      const px = window.innerHeight * 0.01
      if (px > lastPx) {
        lastPx = px
        document.documentElement.style.setProperty('--vh', `${px}px`)
      }
    }

    setVh()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])
}
