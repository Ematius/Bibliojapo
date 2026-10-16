# La estructura de un tomo

**Este documento manda sobre el código, no lo describe.** Lo que arma un tomo
—`buildVolumePages` y lo que lo alimenta— se escribe contra esta tabla; si el código y
este documento no coinciden, el que está mal es el código.

Un tomo ES un bloque del temario, y no hay ni una línea de código por tomo. De eso se
sigue lo único que de verdad hay que entender: **la estructura es una sola, la misma para
los dieciocho tomos y para los pasillos que vengan.** Un tomo no tiene su propia forma:
pasa por estas nueve secciones, y la sección que no tenga con qué llenarse NO APARECE.
No sale vacía, no sale a medias, no sale con un hueco: no existe en ese tomo.

El B1 no es la estructura. Es esta estructura a la que le faltan trozos.

---

## Las nueve secciones, en este orden

| # | Sección | Qué planas genera | Qué la omite |
|---|---|---|---|
| 1 | **Portada** | 1 plana: el bloque, sus cuentas, lo que se podrá leer al terminarlo | nada: se pinta siempre |
| 2 | **Lección de kana** · una por kana del temario, en su orden | mnemotécnica + dibujo · ver y escuchar + pauta · 4 planas con su primera palabra · 1 plana por palabra extra **que no estrene dakuten** · repaso sorteado · mini examen | un kana sin palabras se queda en las 2 planas de presentación, y sale del repaso y de los exámenes |
| 3 | **Ortografía: el dakuten** | la regla · 1 plana por **palabra** del tomo que estrena un dakuten · repaso sorteado · mini examen | si el bloque no estrena ningún dakuten |
| 4 | **Gramática** · una sección por regla que el bloque estrena | la regla · 1 plana por **frase** que la estrena · repaso sorteado · mini examen | si el bloque no estrena reglas |
| 5 | **Palabras que el tomo promete** | 1 plana por palabra que el bloque cuenta y ninguna lección acoge, una vez apartadas las de dakuten | si no hay ninguna |
| 6 | **Frases que no estrenan regla** | 1 plana por frase del tomo construida solo con gramática ya dada | si todas sus frases pertenecen a una regla que este bloque estrena |
| 7 | **Repaso de kana** | aviso · 1 plana por palabra del tomo | si el tomo no tiene palabras |
| 8 | **Repaso final** | aviso · 1 plana por frase del tomo | si el tomo no tiene frases |
| 9 | **Examen global** | normas · bloque 1 · bloque 2 · bloque 3 · nota y sello | si el tomo no tiene ni frases ni palabras |

Las secciones 7 y 8 se llevan su aviso con ellas: un aviso que anuncia una sección que no
existe es peor que no avisar.

---

## Las reglas que no se negocian

### Una frase pertenece a UNA sección, y una palabra también

Una frase es de la regla que **este bloque estrena**; si no estrena ninguna, es de la
sección 6. Una palabra es de la lección de su kana, salvo que estrene un dakuten, y
entonces es de la sección 3.

Sin pertenencia única la misma frase se practica dos veces: pasó con el dakuten y la
cópula, que comparten un carácter, y salieron veintidós planas para once frases. **La
pertenencia no se adivina leyendo el texto de la frase.** Buscar subcadenas confunde una
forma con un trozo de otra —el negativo de un verbo con el de la cópula— y confunde una
forma con vocabulario que se escribe parecido: de las seis frases que una búsqueda daba
por desiderativas o negativas, las seis eran vocabulario. La pertenencia la declara el
temario.

### Ninguna sección de regla sin una frase que la practique

Una regla que se presenta y no se practica es una plana que explica algo y pasa a la
siguiente sección. **El generador se niega**: un bloque que estrena una regla sin ni una
frase que la use no se vuelca, y dice qué regla y qué bloque.

Y lo mismo con el texto de la regla: **una regla declarada sin explicación escrita hace
fallar al generador igual.** Hasta hoy una regla sin texto simplemente no aparecía, y esa
omisión silenciosa es exactamente el fallo que este documento existe para cerrar: el
temario promete una sección, el tomo sale sin ella y nadie se entera. Si el documento la
promete, o hay texto que la explique o el volcado se para.

Es la misma política que ya se aplica a los homógrafos sin declarar y a las formas que
llegan antes de su `bloque_min`. Un hueco que no grita es el hueco que se descubre dos
años tarde.

### Una regla de un kana no se declara antes de que su kana se enseñe

**Una regla cuyo carácter es un kana se declara en el bloque que enseña ese kana, o en
uno posterior — nunca antes. El generador lo comprueba y falla.**

La posesión estuvo declarada en el b10 y su partícula no se escribe hasta el b12: dos
tomos en los que el temario prometía una regla imposible de poner en una frase. Nadie lo
vio porque la regla no estaba anclada a ninguna lección y la comprobación no existía.

Mover la regla es una línea; adelantar el kana arrastraría las 56 lecciones, los
acumulados y las restricciones de deuda de fila. Así que **se mueve la regla, nunca el
kana.** Comprobadas las cinco reglas de partícula que el temario declara, solo la
posesión estaba desfasada; el tema (b1), la existencia (b11), la dirección (b15) y el
objeto directo (b16) cuadran.

### La frontera: ortografía es la sección 3 y las lecciones; gramática es la 4

**Ortografía son las marcas que transforman caracteres** —el dakuten, el handakuten, el
sokuon, la marca larga, el yōon—. No son reglas: son caracteres, y por eso viven en las
lecciones de kana (sección 2) y, el dakuten, en la 3.

**Gramática es lo que cambia el significado de una frase.** Esa es la sección 4, y solo
esa.

Confundirlas fue lo que puso el handakuten de B17 y el yōon de B18 en la línea
«Gramática:» del temario, describiendo ortografía como si fuera una regla. Ya está
corregido. No se les inventa entrada en `grammar.ts`: las 56 lecciones de kana —46 base,
el sokuon, la marca larga, los tres yōon y los 5 del handakuten— ya las cubren.

### Una sección de gramática puede estrenar un carácter

`particle-o` enseña un carácter que no aparece dentro de ninguna palabra del temario, así
que no tiene lección de kana en ningún bloque: **se presenta dentro de su propia sección
de gramática.** No es una excepción tolerada, es un caso de la estructura: una sección de
regla puede traer un carácter nuevo y tiene que presentarlo. Si la estructura no lo
contempla, ese carácter no aparece en ninguna página de todo el pasillo.

### Los contadores solo miran las lecciones de kana

Una sección de gramática no enseña ningún carácter. Contarla infla el carné con kana que
nadie ha visto, y con las reglas de hoy el error sería de ocho.

---

## El examen global

Tres bloques, y entra todo lo del tomo sin preguntarlo tres veces:

| Bloque | Qué pregunta | Con qué pista |
|---|---|---|
| 1 | todas las **palabras** del tomo | su dibujo o su color y su sonido, sin texto |
| 2 | todas las **frases** del tomo | su rōmaji |
| 3 | las mismas frases, en otro orden | solo el audio |

El rōmaji se queda y el español se cae: con las frases en dos bloques hay sitio para dos
pistas, y para una palabra la pista «kana» no existe —lo que se pide escribir *es* el
kana—.

Se aprueba con **≥5/10 en cada bloque**, y es el único sitio de todo el tomo que sella.
Ni las lecciones ni las secciones de regla sellan: su mini examen no da ni quita nada.

---

## Estado a 16-10-2026: lo que hoy incumple este contrato

Medido por script sobre `content/` y contra las tablas, que coinciden.

**Cerrados el 16-10-2026**, con seis frases nuevas —el temario pasa de 155 a 161—: la
partícula de tema ya tiene frase en el b1 (el tomo 1 está publicado y la declaraba desde
el primer día sin enseñarla), la cópula negativa en el b3, el pasado en el b5 con tres, y
la posesión en el b12, a donde se movió su regla.

Y con ellos se cerró la razón de fondo de que la cópula negativa no tuviera ni una en
dieciocho tomos: `sentenceUnits` releía el texto de una pieza conjugada y la は del sufijo
salía «ha», así que el generador rechazaba la frase y no se podía escribir. Ahora cada
pieza se lee donde está declarada.

| Qué | Causa |
|---|---|
| **`nai` (b13) sigue sin frase que lo practique** | su frase está escrita y verificada —pasa el segmentador limpia— pero quedó fuera de la tanda del 16-10. Entra en la siguiente, y hasta entonces el b13 presenta la regla sin practicarla |
| **`tai` (b6) sigue sin frase que lo practique** | el segmentador no apila la cópula sobre una forma conjugada: en `たいです` lee el adjetivo `いたい` en vez de la raíz más el sufijo, con cualquier verbo. Y `たい` a secas es registro llano en un tomo que lleva desde el b2 en cortés, así que no se mete una frase llana para tapar el hueco. **Segundo arreglo del aparato pendiente:** que `segment()` pueda apilar `copula-pres-af` sobre una forma. Lo van a necesitar `たいです`, `たくないです` y todo lo que venga |
| **La misma frase practicada dos veces** en toda sección de dakuten | la pertenencia se adivina por subcadenas, y el dakuten de la cópula vive dentro de ella |
| **El volcado y el lector no usan el mismo criterio** para decidir si una palabra se puede enseñar: el volcado mira su modo, el lector solo mira que tenga audio y dibujo | dos verdades sobre el mismo dato, en dos archivos |
| **Palabras con dakuten pedidas antes de explicarlo** | hoy viven en la lección de su kana, y la sección 3 va detrás. La tabla de arriba ya lo resuelve |
| **Tres hojas derechas en blanco** en el examen, una por bloque | el número de pruebas de cada bloque es par y los resultados ocupan una sola hoja |

---

## Pendiente: la regla de cada bloque la declara el documento

Hoy la declaran DOS sitios, y no dicen lo mismo: la prosa de la línea «Gramática:» de
`FASE1_DEFINITIVO.md`, y `RULES_BY_BLOCK`, una lista escrita a mano en
`tools/build-blocks.mjs`. La lista se queda corta en seis bloques, y por eso el tomo 1 no
tiene su plana de la partícula de tema.

**`RULES_BY_BLOCK` se muere.** La regla la declara el temario, en un campo legible a
máquina, gemelo de los dos que el parser ya lee:

```text
**Kana nuevos:** …
**Dakuten que traen:** …
**Reglas que estrena:** desu · masu
```

Por **id**, nunca en prosa, separadas por `·`, y `—` cuando el bloque no estrena ninguna.
`readDocument()` lo lee con un regex gemelo de los otros dos y `build-blocks.mjs` lo
vuelca tal cual. La línea «Gramática:» en prosa **se sustituye** por este campo: dejar las
dos es volver a tener dos verdades, que es exactamente el fallo que esto cierra. La
explicación en prosa de cada regla ya vive en la sección G0–G7 del propio documento.

**Un id declarado que no exista en `grammar.ts`, o que exista sin explicación escrita,
hace fallar al generador. No se salta.** Un campo legible a máquina que admite ids que no
llevan a ningún sitio no es mejor que la prosa: es la misma omisión silenciosa con otra
sintaxis.

Mientras el campo no exista, cualquier recuento de reglas por bloque hay que leerlo
contra la línea «Gramática:» del documento y no contra `blocks.ts`.
