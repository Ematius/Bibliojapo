# BOF — Biblioteca Oficial de Frikis

App de aprendizaje de japonés con estética de biblioteca y manga. Se entra por
unas puertas talladas, se recorre el vestíbulo, se elige pasillo —Hiragana,
Katakana, Kanji o Vocabulario— y dentro se leen tomos de manga con los que
estudiar la sección.

**Fase actual:** el recorrido de entrada (portada, puerta, vestíbulo y pasillo).
Todavía no hay contenido de estudio ni backend.

## Puesta en marcha

```bash
npm install
npm run dev
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en <http://localhost:5173> |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve el resultado de `build` |
| `npm run lint` | Oxlint |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

React 19 y Vite para la aplicación, SCSS para los estilos (sin CSS-in-JS ni
Tailwind), GSAP para todas las animaciones de entrada, salida y transición, y
React Router para la navegación. El despliegue va a Vercel, con el reescritura a
`index.html` de `vercel.json` para que las rutas del SPA funcionen al recargar.

## Recorrido y rutas

```text
/                    portada: el valle, con la caminante que sube por el sendero
/entrada             la fachada y la apertura de las puertas
/biblioteca          el vestíbulo, con los carteles de cada pasillo
/pasillo/:aisleId    la estantería de una sección
```

La portada solo se ve en la primera visita: al cruzar la puerta se guarda una
marca en `localStorage` y a partir de ahí se entra directamente frente a ella.
La única forma de volver al valle es «Inicio» en la barra. Ver
[`src/shared/journey.ts`](src/shared/journey.ts).

## Organización

Las carpetas agrupan por dominio, no por tipo de archivo: el componente, sus
estilos, su configuración y sus hooks viven juntos.

```text
src/
  landing/    la portada del valle
  entrance/   la fachada y la apertura de puertas
  hall/       el vestíbulo y los carteles
  aisle/      el pasillo
  shared/     lo usado por más de un dominio (la barra, el registro de pasillos)
  styles/     tokens globales y estilos base
```

Un dominio solo se crea cuando empieza una funcionalidad nueva, y algo pasa a
`shared/` únicamente cuando lo necesitan dos dominios distintos.

## Convenciones

Los valores visuales viven como custom properties en
[`src/styles/root.scss`](src/styles/root.scss) y se usan siempre por token,
nunca con el valor a pelo. Las clases siguen BEM en inglés; el texto de la
interfaz va en español. Para el alto de la ventana se usa `var(--vh)` y nunca
`100vh`, porque el hook `useVh` solo lo actualiza cuando cambia el ancho y así la
barra de URL del móvil no interrumpe ninguna animación.

Cada dominio guarda sus valores ajustables —posiciones, duraciones, curvas— en
un archivo de configuración propio, para que afinar una animación no obligue a
tocar el código que la ejecuta.

## Añadir un pasillo

1. Añadir la entrada en [`src/shared/aisles.ts`](src/shared/aisles.ts) con su
   id, su nombre y su ilustración.
2. Añadir su cartel en
   [`src/hall/aisleSignsConfig.ts`](src/hall/aisleSignsConfig.ts) con la
   posición sobre el arco correspondiente.

No hay componente que crear ni ruta que registrar: el pasillo es el mismo para
las cuatro secciones y la ruta sale del id.
