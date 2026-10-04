// Las páginas del álbum, por tomo. Mismo patrón que `blockPlanKana.ts`: un mapa por
// `blockId`, y el tomo sin arte todavía se queda sin entrada en vez de inventarse páginas.
// `MyDesk.tsx` concatena las de los tomos ganados, en el orden del temario, así que un tomo
// nuevo solo necesita traer aquí su propia entrada.
//
// No son URLs: son rutas de media, y hay que pasarlas por `mediaUrls` antes de ponerlas en
// un `src`. Con barra delante es el bloque 1, que es gratis y se queda en `public/`; sin
// ella, una clave del bucket — ver «Las rutas» en CLAUDE.md.
export const ANIME_PAGES: Readonly<Record<string, readonly string[]>> = {
  b1: ['/images/desk/anime/mangab1/1.webp', '/images/desk/anime/mangab1/2.webp', '/images/desk/anime/mangab1/3.webp'],
  b2: [
    'hiragana/b2/images/manga/1.webp',
    'hiragana/b2/images/manga/2.webp',
    'hiragana/b2/images/manga/3.webp',
  ],
}
