// page-flip 2.0.7 se publica sin tipos y sin campo `module` en su package.json.
// Esto declara la parte de su API que usamos, para no tener que apagar `strict`
// ni sembrar `any` por el lector.
declare module 'page-flip' {
  export interface PageFlipSettings {
    width: number
    height: number
    size: 'fixed' | 'stretch'
    minWidth: number
    maxWidth: number
    minHeight: number
    maxHeight: number
    // Con la portada activada, page-flip trata la primera y la última página
    // como tapas sueltas. Ver el comentario del lector: combinado con el orden
    // invertido que pide la lectura japonesa, descuadra el índice.
    showCover: boolean
    drawShadow: boolean
    flippingTime: number
    usePortrait: boolean
    startZIndex: number
    autoSize: boolean
    maxShadowOpacity: number
    mobileScrollSupport: boolean
    swipeDistance: number
    clickEventForward: boolean
    useMouseEvents: boolean
    showPageCorners: boolean
    disableFlipByClick: boolean
    startPage: number
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: Partial<PageFlipSettings>)
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    turnToPage(page: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    on(event: string, callback: (event: { data: unknown; object: unknown }) => void): void
    destroy(): void
  }
}
