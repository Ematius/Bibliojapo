# BOF — Biblioteca Oficial de Frikis
## Instrucciones para Claude Code

---

## Descripción del proyecto

BOF es una app de aprendizaje de japonés con estética de biblioteca / manga.
El usuario entra por unas puertas de madera tallada, recorre pasillos,
elige en qué pasillo va a entrar — puede ser Hiragana, Katakana, Kanji
o Vocabulario. Una vez dentro hay una estantería donde puede elegir tomos
de manga. Al elegir un tomo entra en una temática manga donde aprenderá
el contenido correspondiente al pasillo: lee, hace ejercicios y pruebas,
y al terminar guarda el tomo en su estantería personal.

**Fase actual:** Landing page — animación de entrada con imágenes reales
(fachada exterior con puertas → apertura de puertas → interior de la biblioteca).
**Stack:** React + Vite + SCSS + GSAP (sin CSS-in-JS, sin Tailwind).
**Despliegue:** Vercel (equipo: ematius' projects).
**Backend:** Todavía no — se añadirá más adelante (probablemente Firebase o Supabase).

---

## Reglas inamovibles

- **Nunca reescribir un archivo desde cero** salvo que se pida explícitamente.
  Usar siempre ediciones quirúrgicas (buscar y reemplazar, insertar bloque, etc.).
- **Nunca hacer commit ni push** sin confirmación explícita del usuario.
  Palabras clave para autorizar: "haz commit", "sube los cambios", "push".
- **Nunca tocar** `CLAUDE.md`, los scripts de `package.json` ni la configuración
  de Vercel sin preguntar primero.
- **Nunca instalar paquetes nuevos** sin preguntar primero.
- Si una tarea es ambigua, **preguntar antes de actuar**.

---

## Forma de trabajar — atomicidad máxima

Cada unidad de trabajo debe ser **la cosa más pequeña posible que tenga sentido por sí sola**.

### Qué significa en la práctica

- Un componente nuevo → un solo archivo, sin estilos suyos todavía.
- Los estilos de ese componente → siguiente paso, archivo propio.
- Una animación → su propia función o timeline, sin mezclar con lógica de estado.
- Un hook → un solo archivo, un solo propósito.
- Una corrección → solo las líneas afectadas, nada más.

### Lo que nunca se hace en un solo paso

- Crear componente + estilos + animación + lógica juntos.
- Refactorizar mientras se añade funcionalidad.
- Mover archivos y editarlos al mismo tiempo.
- Arreglar un bug y aprovechar para "mejorar" código cercano.

### Antes de cada tarea

1. Describir en una frase qué se va a hacer exactamente.
2. Listar los archivos que se van a tocar.
3. Esperar confirmación si hay cualquier duda.

### Después de cada tarea

- Resumir qué se hizo y qué quedó pendiente para el siguiente paso.
- No continuar con el siguiente paso sin que el usuario lo pida.

---

## Reglas de idioma

| Qué | Idioma |
|---|---|
| Código (funciones, variables, clases, nombres de archivo) | Inglés |
| Comentarios en el código | Español |
| Nombres de clase SCSS | Inglés (BEM: `.block__element--modifier`) |
| Texto de la UI (botones, etiquetas, copy) | Español |
| Mensajes de commit de Git | Inglés, imperativo (`Add door animation`) |

---

## Stack técnico

```
React 18     — UI
Vite 5       — build tool
SCSS (Sass)  — estilos, sin CSS-in-JS
GSAP 3       — todas las animaciones de entrada/salida/transición (obligatorio)
page-flip    — física de paso de páginas estilo manga
```

---

## Design tokens

Todos los valores visuales viven en `_root.scss` como custom properties de CSS.
**Nunca usar valores hardcodeados** — siempre `var(--nombre-del-token)`.

### Paleta de colores

```scss
/* Piedra — estructura de la biblioteca */
--color-stone:        #c8b89a;  /* piedra beige envejecida */
--color-stone-dark:   #a8956f;  /* piedra en sombra */
--color-stone-deep:   #7a6a52;  /* piedra profunda */

/* Madera — puertas, estanterías, marcos */
--color-wood:         #8b5e3c;  /* madera tostada */
--color-wood-dark:    #5c3a1e;  /* madera oscura */
--color-wood-deep:    #3a2210;  /* madera muy oscura */

/* Latón y luz — linternas, herrajes, acentos */
--color-brass:        #d4a843;  /* latón cálido */
--color-brass-glow:   #f0c96a;  /* resplandor de linterna */
--color-amber:        #e8932a;  /* luz ámbar */

/* Papel — páginas, fondo de contenido */
--color-cream:        #f5edd8;  /* papel cálido */
--color-parchment:    #e8d9b8;  /* pergamino */

/* Vegetación — hiedra decorativa */
--color-ivy:          #6b8c5a;  /* hiedra apagada */
--color-ivy-dark:     #4a6340;  /* hiedra en sombra */

/* Texto */
--color-ink:          #2c1f0e;  /* tinta marrón oscura */
--color-ink-soft:     rgba(44, 31, 14, 0.6);

/* Fondo general — lo que hay fuera/detrás de la biblioteca */
--color-bg:           #1a1208;  /* oscuro cálido */

/* Tonos por sección de aprendizaje */
--color-hiragana:     #c4956a;  /* terracota suave */
--color-hiragana-deep:#9a6a42;
--color-katakana:     #8a9e6b;  /* verde oliva */
--color-katakana-deep:#627041;
--color-kanji:        #b8845a;  /* ocre rojizo */
--color-kanji-deep:   #8a5c38;
--color-vocab:        #c4a84a;  /* dorado latón */
--color-vocab-deep:   #9a7e2e;
```

### Tipografía

```scss
--font-display: 'Shippori Mincho', serif;      /* japonés / cabeceras */
--font-roman:   'Cinzel', serif;               /* logotipo BOF */
--font-body:    'Zen Kaku Gothic New', system-ui, sans-serif;
```

### Movimiento

```scss
--ease-book:       cubic-bezier(0.36, 0.02, 0.16, 1);
--duration-flip:   520ms;
--duration-door:   1700ms;
--duration-fast:   280ms;
--duration-slow:   900ms;
```

### Layout

```scss
--vh:            /* establecido por el hook useVh — nunca usar 100vh directamente */
--panel-width:   min(20rem, 86vw);
```

---

## Organización de archivos

La estructura de carpetas sigue el principio de **agrupación por dominio** (feature folders),
no por tipo de archivo. Cada carpeta representa un conjunto funcional completo.

### Regla principal
Todo lo que pertenece a la misma funcionalidad va en la misma carpeta,
independientemente de si es un componente, un estilo, un hook o una utilidad.

```
src/
  landing/          ← todo lo de la landing: componentes, estilos, hooks, animaciones
  aisle/            ← todo lo del pasillo
  reading/          ← todo lo del lector de tomos
  shared/           ← lo único que va fuera: componentes/hooks usados en más de un dominio
  styles/           ← excepción justificada: tokens globales, reset, tipografía base
```

### Cuándo crear una carpeta nueva
Solo cuando empieza una funcionalidad nueva. No antes.
Nunca crear carpetas vacías "por si acaso".

### Cuándo mover algo a `shared/`
Solo cuando el mismo componente o hook se necesita en dos dominios distintos.
Hasta ese momento, vive en el dominio donde nació.

### Lo que nunca se hace
- Carpetas por tipo (`components/`, `hooks/`, `utils/`) a nivel global.
- Archivos de estilos en una carpeta separada del componente al que pertenecen.
- Mover un archivo a `shared/` "por si acaso lo reutilizo luego".

---

## Principios de animación

- Todas las animaciones de entrada/salida usan **timelines de GSAP**,
  no keyframes CSS. Los keyframes CSS solo para estados hover o loops decorativos.
- Nunca poner `filter: drop-shadow()` en un elemento que GSAP esté animando
  (fuerza repintado completo en cada frame — jank garantizado).
- Usar `--vh` en lugar de `100vh` en todas partes. El hook `useVh` lo actualiza
  solo cuando cambia el ancho, nunca en cambios de altura (barra de URL móvil).

---

## Flujo de Git

- Rama única: `main`.
- Claude Code hace commit solo cuando el usuario lo pide explícitamente.
- Formato: `<tipo>: <descripción corta en inglés>`
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `style:` solo visual / CSS
  - `refactor:` reestructura sin cambio de comportamiento
  - `chore:` configuración, dependencias

---

## Errores conocidos — no repetir

- **`scaleX(-1)` en StPageFlip** rompe todo el texto. Solución correcta: invertir
  el orden de páginas en el DOM y avanzar con `flipPrev()`.
- **`showCover: true` + páginas invertidas** confunde el índice de página de
  StPageFlip. Verificar el índice manualmente al cambiar el número de páginas.
- **Imágenes binarias en base64 por la API de Vercel** se corrompen. Usar SVG
  generado en código o imágenes alojadas en una URL externa.
- **`filter: drop-shadow` en el contenedor del libro** causa jank en cada frame
  del flip. StPageFlip dibuja sus propias sombras — no añadir más encima.
- **Listener de resize sin filtro de ancho** actualiza `--vh` cuando el navegador
  móvil muestra/oculta la barra de URL, lo que interrumpe StPageFlip mid-gesture.
  Siempre comparar `window.innerWidth` antes y después antes de actualizar.
