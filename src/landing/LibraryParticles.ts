// Sistema de partículas de polvo suspendido iluminado, en Canvas puro (sin React
// state, sin re-renders). Dos capas: "back" (detrás de la fachada, visible solo por
// el hueco) y "front" (unas pocas, por delante de todo durante el push-through).

interface RGB {
  r: number
  g: number
  b: number
}

export interface ParticlesConfig {
  count: number
  foregroundRatio: number
  colors: string[]
  sizeMin: number
  sizeMax: number
  rareSizeMax: number
  rareChance: number
  opacityMin: number
  opacityMax: number
  rareOpacityMax: number
  driftPx: number
  driftSeconds: number
  seed: number
}

type ParticleLayer = 'back' | 'front'

interface Particle {
  layer: ParticleLayer
  x: number
  y: number
  size: number
  baseOpacity: number
  color: RGB
  driftX: number
  driftY: number
  phase: number
  speed: number
  blur: boolean
}

interface LibraryParticlesOptions {
  backCanvas: HTMLCanvasElement
  frontCanvas: HTMLCanvasElement
  config: ParticlesConfig
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '')
  const num = parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export class LibraryParticles {
  private backCanvas: HTMLCanvasElement
  private frontCanvas: HTMLCanvasElement
  private config: ParticlesConfig
  private colors: RGB[]
  private backCtx: CanvasRenderingContext2D
  private frontCtx: CanvasRenderingContext2D
  private globalOpacity: number
  private rafId: number | null
  private startTime: number
  private random: () => number
  private particles: Particle[]
  private resizeObserver: ResizeObserver

  constructor({ backCanvas, frontCanvas, config }: LibraryParticlesOptions) {
    this.backCanvas = backCanvas
    this.frontCanvas = frontCanvas
    this.config = config
    this.colors = config.colors.map(hexToRgb)

    const backCtx = backCanvas.getContext('2d')
    const frontCtx = frontCanvas.getContext('2d')
    if (!backCtx || !frontCtx) throw new Error('[LibraryParticles] No se pudo obtener el contexto 2D de los canvas.')
    this.backCtx = backCtx
    this.frontCtx = frontCtx

    this.globalOpacity = 0
    this.rafId = null
    this.startTime = performance.now()

    this.random = createSeededRandom(config.seed)
    this.particles = this.createParticles()

    this.handleResize = this.handleResize.bind(this)
    this.tick = this.tick.bind(this)

    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(backCanvas)
    this.handleResize()
  }

  private createParticles(): Particle[] {
    const { count, foregroundRatio, sizeMin, sizeMax, rareSizeMax, rareChance, opacityMin, opacityMax, rareOpacityMax, driftPx, driftSeconds } =
      this.config

    const frontCount = Math.round(count * foregroundRatio)
    const backCount = count - frontCount
    const particles: Particle[] = []

    const makeParticle = (layer: ParticleLayer): Particle => {
      const isRare = this.random() < rareChance
      const size = isRare ? sizeMax + this.random() * (rareSizeMax - sizeMax) : sizeMin + this.random() * (sizeMax - sizeMin)
      const opacity = isRare ? opacityMax + this.random() * (rareOpacityMax - opacityMax) : opacityMin + this.random() * (opacityMax - opacityMin)

      return {
        layer,
        x: this.random(),
        y: this.random(),
        size,
        baseOpacity: opacity,
        color: this.colors[Math.floor(this.random() * this.colors.length)],
        driftX: (this.random() * 2 - 1) * driftPx,
        driftY: (this.random() * 2 - 1) * driftPx,
        phase: this.random() * Math.PI * 2,
        speed: (0.6 + this.random() * 0.8) / driftSeconds,
        blur: this.random() < 0.25,
      }
    }

    for (let i = 0; i < backCount; i++) particles.push(makeParticle('back'))
    for (let i = 0; i < frontCount; i++) particles.push(makeParticle('front'))

    return particles
  }

  private handleResize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    for (const canvas of [this.backCanvas, this.frontCanvas]) {
      const { clientWidth, clientHeight } = canvas
      canvas.width = Math.max(1, Math.round(clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(clientHeight * dpr))
    }

    this.backCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  setGlobalOpacity(value: number): void {
    this.globalOpacity = value
  }

  private drawLayer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, layer: ParticleLayer, elapsedSeconds: number): void {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    ctx.clearRect(0, 0, width, height)

    if (this.globalOpacity <= 0.001) return

    for (const particle of this.particles) {
      if (particle.layer !== layer) continue

      const oscillation = Math.sin(elapsedSeconds * particle.speed + particle.phase)
      const px = particle.x * width + particle.driftX * oscillation
      const py = particle.y * height + particle.driftY * Math.cos(elapsedSeconds * particle.speed * 0.8 + particle.phase)
      const opacity = particle.baseOpacity * this.globalOpacity

      if (opacity <= 0.005) continue

      const { r, g, b } = particle.color
      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
      if (particle.blur) ctx.filter = 'blur(0.6px)'
      ctx.arc(px, py, particle.size / 2, 0, Math.PI * 2)
      ctx.fill()
      if (particle.blur) ctx.filter = 'none'
    }
  }

  private tick(now: number): void {
    const elapsedSeconds = (now - this.startTime) / 1000
    this.drawLayer(this.backCtx, this.backCanvas, 'back', elapsedSeconds)
    this.drawLayer(this.frontCtx, this.frontCanvas, 'front', elapsedSeconds)
    this.rafId = requestAnimationFrame(this.tick)
  }

  start(): void {
    if (this.rafId !== null) return
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  destroy(): void {
    this.stop()
    this.resizeObserver.disconnect()
  }
}
