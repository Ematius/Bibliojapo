// Las páginas del álbum, por tomo. Mismo patrón que `blockPlanKana.ts`: un mapa por
// `blockId`, y el tomo sin arte todavía —todos menos el 1— se queda sin entrada en vez de
// inventarse páginas. `MyDesk.tsx` concatena las de los tomos ganados, en el orden del
// temario, así que un tomo nuevo solo necesita traer aquí su propia entrada.
export const ANIME_PAGES: Readonly<Record<string, readonly string[]>> = {
  b1: ['/images/desk/anime/mangab1/1.webp', '/images/desk/anime/mangab1/2.webp', '/images/desk/anime/mangab1/3.webp'],
}
