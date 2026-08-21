import { useEffect } from 'react'

// Mantiene la custom property --vh actualizada solo cuando cambia el ancho de la
// ventana, nunca en cambios de alto (evita que la barra de URL móvil interrumpa
// animaciones de scroll en curso).
export function useVh(): void {
  useEffect(() => {
    let lastWidth = window.innerWidth

    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    }

    const handleResize = () => {
      const width = window.innerWidth
      if (width === lastWidth) return
      lastWidth = width
      setVh()
    }

    setVh()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])
}
