# Bloque 2 · ますてせん — lo que falta para que el tomo se abra

Verificado contra el repo el 02-10-2026. Marca las casillas según produzcas.
Comprobación: `node scripts/seed-content.mjs --dry-run` → cuando diga
«bloques publicados: 2», B2 se abre. Luego `npm run seed:content`.

Las rutas van **sin barra delante** y relativas a `content-media/`. Con barra,
`api/media.ts` las busca en el despliegue — ver «Las rutas» en CLAUDE.md.

---

## Ya está hecho

- [x] Las 8 lecciones de B2 en `blocks.ts`, en orden: dakuten · ま す て せ ん · desu · masu
- [x] Las tres reglas de gramática, con su explicación escrita (`grammar.ts`: `dakuten`, `desu`, `masu`)
- [x] Las 24 palabras del bloque en `vocabulary.ts`, las 9 de lección entre ellas
- [x] Las 14 frases en `sentences.ts`, con sus ids confirmados
- [x] Las fichas de ま す て せ ん existen en `kana.ts`, vacías
- [x] El `summary` de la portada, en el mapa `COVER` de `tools/build-blocks.mjs`
- [x] La media del temario viejo, recolocada a `content-media/hiragana/b3/`

## A · Ilustración mnemotécnica de cada kana

Antes de dibujar, el motivo: la ilustración sale de la mnemotecnia y no al revés —el
camino de る lo dibuja porque la mnemotecnia dice RUta—. Fijar el motivo de los cinco
es el primer paso de esta sección.

`content-media/hiragana/b2/images/` · limpia, sin el kana encima, motivo centrado

- [x] `hiragana-ma.webp` — ま
- [ ] `hiragana-su.webp` — す
- [ ] `hiragana-te.webp` — て
- [ ] `hiragana-se.webp` — せ
- [ ] `hiragana-n.webp` — ん

## B · Audio de cada kana

`content-media/hiragana/b2/audio/`

- [x] `ma.wav`
- [x] `su.wav`
- [x] `te.wav`
- [x] `se.wav`
- [x] `n.wav`

## C · Imágenes de apoyo de las 9 palabras

`content-media/hiragana/b2/images/imagesSupport/` · limpias, sin la palabra ni su
lectura escritas; eso mismo vale para `imageAlt`

- [x] `ima-now.webp` — いま · ahora
- [x] `mai-flat.webp` — まい · objetos planos (contador)
- [x] `isu-chair.webp` — いす · silla
- [x] `osu-push.webp` — おす · empujar, pulsar
- [x] `te-hand.webp` — て · mano
- [x] `sei-height.webp` — せい · altura, estatura
- [x] `sen-thousand.webp` — せん · mil
- [x] `en-yen.webp` — えん · yen
- [x] `han-half.webp` — はん · mitad, media

## D · Audio de las 9 palabras

`content-media/hiragana/b2/audio/word/`

- [x] `ima.wav`
- [x] `mai.wav`
- [x] `isu.wav`
- [x] `osu.wav`
- [x] `te.wav`
- [x] `sei.wav`
- [x] `sen.wav`
- [x] `en.wav`
- [x] `han.wav`

## E · Audio de las 14 frases — NO bloquea, y hoy no tiene dónde declararse

`content-media/hiragana/b2/audio/sentence/` · los 14 ids verificados en `sentences.ts`

- [ ] `aimasu.wav` — あいます。 Me encuentro con alguien.
- [ ] `aimasen.wav` — あいません。 No me encuentro con nadie.
- [ ] `iimasu.wav` — いいます。 Lo digo.
- [ ] `aoidesu.wav` — あおいです。 Es azul.
- [ ] `ooidesu.wav` — おおいです。 Hay muchos.
- [ ] `iedesu.wav` — いえです。 Es una casa.
- [ ] `hahadesu.wav` — ははです。 Es mi madre.
- [ ] `uedesu.wav` — うえです。 Está encima.
- [ ] `mazuidesu.wav` — まずいです。 Está malo.
- [ ] `amaidesu.wav` — あまいです。 Es dulce.
- [ ] `semaidesu.wav` — せまいです。 Es estrecho.
- [ ] `usuidesu.wav` — うすいです。 Es fino.
- [ ] `senseidesu.wav` — せんせいです。 Es profesor.
- [ ] `isudesu.wav` — いすです。 Es una silla.

## F · Los trazos de los 5 kana — uno a uno, con el trazador

Por kana: `outline`, `strokes`, `strokeViewBox`, `strokeOrder` y `mnemonic` en
`kana.ts`. Más `image`, `imageAlt` y `audio`, que apuntan a A y B.

El contorno y el lienzo ya no se pegan a mano: `node tools/kana-extract.mjs <kana>`
los saca de la fuente. Reproduce letra por letra el de る que ya estaba escrito.

- [ ] ま — trazador puesto, esperando los trazos
- [ ] す
- [ ] て
- [ ] せ
- [ ] ん

## G · Escribir la media en los archivos de autoría

- [x] `kana.ts` → `audio` de los 5 kana; `mnemonic` e `image`/`imageAlt` de ま. Faltan los
      de す て せ ん, y los `strokes`/`outline`/`strokeOrder` de los cinco — sección F
- [x] `vocabularyMedia.ts` → las 9 palabras, con `audio`, `image` e `imageAlt`
- [ ] `npm run seed:content`

---

## Lo que no entra en «publicado» pero se ve

- **`isComplete` no mira `outline` ni el audio del kana.** Comprueba `strokes`,
  `image` y `mnemonic`. Un kana con trazos pero sin `outline` publica el bloque y
  deja la silueta vacía en la plana mnemotécnica y en la pauta
  (`mnemonic/KanaStroke.tsx`, `writing/KanaTrace.tsx`).
- **El audio de las frases no tiene dónde vivir.** `sentences.ts` se regenera y no
  conserva nada escrito a mano; no existe un `sentenceMedia.ts` hermano de
  `vocabularyMedia.ts`, ni `lessonSource.ts` le pega media a las frases. Grabarlas
  pide ese archivo y su `withMedia` primero.
