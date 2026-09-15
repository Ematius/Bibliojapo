import { useLayoutEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import './AnimeAlbum.scss'

// Los mangas de un tomo ganado: su portada con el número y, detrás, sus planas.
export interface AnimeChapter {
  blockId: string
  volumeNumber: number
  images: readonly string[]
}

interface AnimeAlbumProps {
  // En orden de lectura. El álbum los invierte él solo para page-flip.
  chapters: AnimeChapter[]
}

type AlbumPage =
  | { kind: 'title'; key: string; volumeNumber: number }
  | { kind: 'image'; key: string; src: string }
  | { kind: 'blank'; key: string }

// El álbum de anime, dentro de la cara abierta del libro de la mesa. Es un `VolumeReader`
// sin nada dentro de las hojas: cada página es una imagen suelta, sin ejercicios, sin
// audio, sin sello.
//
// Se lee a la japonesa, igual que `VolumeReader`: las páginas van INVERTIDAS en el DOM y el
// libro se abre por la última, que es la primera plana. Ver la nota de allí sobre
// `scaleX(-1)`.
export function AnimeAlbum({ chapters }: AnimeAlbumProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const templateRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)

  // El hueco donde vive el álbum es `.desk-object__face`, medido en `%` del objeto — nunca
  // en píxeles fijos. page-flip sí los pide, así que hay que medirlo aquí, igual que
  // `ShelfVolume` mide el libro grande contra la ventana.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => setSize({ width: container.clientWidth, height: container.clientHeight })
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const template = templateRef.current
    const mount = mountRef.current
    if (!template || !mount || !size || size.width <= 0 || size.height <= 0) return

    // Mismo motivo que en `VolumeReader`: page-flip se apropia de los nodos y `destroy()`
    // se los lleva por delante, así que a la librería se le entregan copias.
    const holder = document.createElement('div')
    holder.className = 'anime-album__book'
    mount.appendChild(holder)

    const pages = [...template.querySelectorAll('.anime-album__page')].map(
      (node) => node.cloneNode(true) as HTMLElement,
    )
    pages.forEach((node) => holder.appendChild(node))

    const flip = new PageFlip(holder, {
      width: size.width / 2,
      height: size.height,
      size: 'fixed',
      showCover: false,
      usePortrait: false,
      autoSize: true,
      flippingTime: 700,
      disableFlipByClick: true,
      useMouseEvents: true,
      showPageCorners: true,
      mobileScrollSupport: false,
    })

    flip.loadFromHTML(pages)
    flip.turnToPage(pages.length - 1)

    return () => {
      flip.destroy()
      mount.replaceChildren()
    }
    // `chapters` entra para volver a montar si la lista cambia: page-flip no sabe añadir
    // páginas a un libro que ya existe.
  }, [size, chapters])

  const readingOrder: AlbumPage[] = chapters.flatMap((chapter) => [
    { kind: 'title', key: `title-${chapter.blockId}`, volumeNumber: chapter.volumeNumber },
    ...chapter.images.map((src) => ({ kind: 'image', key: src, src }) as const),
  ])
  // Número par siempre: con uno impar page-flip empareja las hojas corridas y la primera
  // plana caería a la IZQUIERDA, que en un libro japonés es la segunda.
  if (readingOrder.length % 2 === 1) readingOrder.push({ kind: 'blank', key: 'blank' })

  return (
    <div className="anime-album" ref={containerRef}>
      {readingOrder.length === 0 ? (
        <p className="anime-album__empty">Todavía no hay ninguna página.</p>
      ) : (
        <>
          <div className="anime-album__template" ref={templateRef}>
            {[...readingOrder].reverse().map((page) => (
              <div className="anime-album__page" key={page.key} data-density="soft">
                {page.kind === 'title' ? (
                  <div className="anime-album__title">
                    <p className="anime-album__kicker">Mangas obtenidos en el</p>
                    <h2 className="anime-album__volume">Tomo {page.volumeNumber}</h2>
                  </div>
                ) : page.kind === 'image' ? (
                  <img src={page.src} alt="" draggable="false" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="anime-album__mount" ref={mountRef} />
        </>
      )}
    </div>
  )
}
