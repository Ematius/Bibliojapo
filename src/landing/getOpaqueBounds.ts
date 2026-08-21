// Detecta el bounding box real de los píxeles opacos de un PNG con transparencia,
// para poder rotar/posicionar la puerta respecto a su silueta visible y no respecto
// al lienzo transparente completo del archivo.

export interface OpaqueBounds {
  x: number
  y: number
  width: number
  height: number
}

const boundsCache = new WeakMap<HTMLImageElement, OpaqueBounds>()
const ALPHA_THRESHOLD = 10

export function getOpaqueBounds(image: HTMLImageElement, fallback: OpaqueBounds | null = null): OpaqueBounds {
  const cached = boundsCache.get(image)
  if (cached) return cached

  const { naturalWidth: width, naturalHeight: height } = image

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('[getOpaqueBounds] No se pudo obtener el contexto 2D del canvas.')

  ctx.drawImage(image, 0, 0)

  const { data } = ctx.getImageData(0, 0, width, height)

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width
    for (let x = 0; x < width; x++) {
      const alpha = data[(rowOffset + x) * 4 + 3]
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  let bounds: OpaqueBounds

  if (maxX === -1) {
    console.warn(
      `[getOpaqueBounds] "${image.currentSrc || image.src}" no tiene transparencia real detectable. ` +
        'Usando fallback manual (o el PNG completo si no se proporcionó ninguno).',
    )
    bounds = fallback ?? { x: 0, y: 0, width, height }
  } else {
    bounds = {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    }

    const isFullCanvas = bounds.x === 0 && bounds.y === 0 && bounds.width === width && bounds.height === height

    if (isFullCanvas) {
      console.warn(
        `[getOpaqueBounds] El bounding box de "${image.currentSrc || image.src}" ocupa el PNG completo. ` +
          'Puede no tener el margen transparente esperado — revisa el asset o ajusta el fallback.',
      )
    }
  }

  boundsCache.set(image, bounds)
  return bounds
}

// Calcula cómo escalar y desplazar la imagen de la puerta para que su bounding box
// opaco encaje exactamente en el contenedor (el contenedor es el que define el pivote real).
export function fitDoorImageToContainer(
  imgEl: HTMLImageElement,
  containerEl: HTMLElement,
  fallback: OpaqueBounds | null = null,
): OpaqueBounds {
  const bounds = getOpaqueBounds(imgEl, fallback)
  const containerRect = containerEl.getBoundingClientRect()

  const scaleX = containerRect.width / bounds.width
  const scaleY = containerRect.height / bounds.height

  imgEl.style.width = `${imgEl.naturalWidth * scaleX}px`
  imgEl.style.height = `${imgEl.naturalHeight * scaleY}px`
  imgEl.style.left = `${-bounds.x * scaleX}px`
  imgEl.style.top = `${-bounds.y * scaleY}px`

  return bounds
}
