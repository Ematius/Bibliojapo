# Estructura de aprendizaje — Hiragana (JLPT N5)

> Documento de contenido, no de código. Define QUÉ se enseña y en qué orden.
> El cómo se enseña (ejercicios, UI, lector de tomos) vive aparte, en el código.
> Este archivo se carga en cada sesión desde `CLAUDE.md`.

---

## 1. Objetivo

Aprender el hiragana siguiendo la cadena:

**Kana → palabra → frase**

El orden de aprendizaje **no** sigue el gojūon. Los kana se ordenan buscando:

- Desbloquear vocabulario N5 útil.
- Crear frases reales lo antes posible.
- Reutilizar kana ya aprendidos.
- Introducir gramática solo cuando hace falta.
- Evitar caracteres aislados sin utilidad inmediata.
- Mantener una dificultad progresiva entre bloques.

---

## 2. Estructura general

```text
HIRAGANA
│
├── B1  → あ い う え お は
├── B2  → け か し と き こ
├── B3  → ひ ふ へ ほ る た
├── B4  → く さ す せ そ ち を
├── B5  → つ て ら り れ ろ
├── B6  → ぬ ま わ ん
├── B7  → ね な や の
├── B8  → に み む め
├── B9  → も ゆ よ
│
├── B10 → Dakuten / Handakuten
├── B11 → っ + vocales largas
└── B12 → Yōon
```

B1–B9 cubren los 46 kana base, sin repetir ninguno.
B10–B12 no traen kana nuevos: son transformaciones de los ya conocidos.

Los bloques pueden reajustarse si el vocabulario definitivo lo exige.

---

## 3. Regla principal

Cada bloque introduce un número pequeño de kana nuevos.
Todo lo aprendido antes debe poder reutilizarse.

```text
Kana nuevos
     ↓
Palabras nuevas
     ↓
Frases nuevas
     ↓
Gramática necesaria
     ↓
Reutilización de bloques anteriores
```

Un kana no se aprende porque sea el siguiente de la tabla tradicional.

---

## 4. Tipos de kana

Clasificación interna, para decidir dónde cae cada uno:

| Tipo | Qué es | Ejemplos |
|---|---|---|
| **Productivo** | Genera mucho vocabulario | い か し ん と |
| **Gramatical** | Su utilidad es construir frases | は を へ |
| **Huérfano** | Genera poco vocabulario; se coloca a mano | ぬ ゆ |
| **Derivado** | Se enseña como transformación de uno conocido | か→が, は→ば/ぱ, き→きゃ, つ→っ |

---

## 5. Pool de vocabulario

El vocabulario sale del vocabulario objetivo del JLPT N5 (≈ 800 palabras).
Durante hiragana se espera cubrir **≈ 225–300 palabras**. El número definitivo
depende del pool que acabemos usando.

Una palabra sube de prioridad cuando:

```text
+ Es útil / frecuente en N5
+ Reutiliza kana conocidos
+ Necesita pocos kana nuevos
+ Permite construir nuevas frases
+ Desbloquea estructuras gramaticales
```

---

## 6. Gramática Just-In-Time

La gramática no es un bloque aparte: entra cuando una palabra o una frase la
necesita.

```text
は
↓ se aprende como kana: "ha"
↓ aparece como partícula
↓ se introduce: は se pronuncia "wa" cuando es partícula
```

```text
を
↓ desbloquea: OBJETO + を + VERBO
```

---

## 7. Bloque 1

### Kana

```text
あ  い  う  え  お  は
```

`は` se adelanta respecto al orden tradicional porque permite crear frases desde
el primer bloque.

### Mnemotecnias (provisionales)

| Kana | Mnemotecnia |
|---|---|
| あ | Ancla |
| い | Dos íes |
| う | Uña |
| え | Esquiador |
| お | Ola |
| は | Hacha |

Provisionales: se pueden cambiar a mano.

### Vocabulario desbloqueado

| Palabra | Significado |
|---|---|
| え | dibujo |
| は | diente |
| はは | madre |
| いえ | casa |
| うえ | arriba |
| あお | azul (sustantivo) |
| あおい | azul (adjetivo) |
| いい | bueno |
| おおい | muchos / abundante |
| あう | encontrarse |
| いう | decir |
| はい | sí |
| いいえ | no |

Cobertura: **13 palabras** de ~800 N5 (≈ 1,6 %) con **6 de 46** kana (≈ 13 %).

### Frases desbloqueadas

Patrón: `TEMA + は + PREDICADO`

| Japonés | Significado |
|---|---|
| いえ は あおい | La casa es azul. |
| え は あおい | El dibujo es azul. |
| いえ は おおい | Hay muchas casas. |
| はは は いい | Mi madre es buena. |

---

## 8. Forma de un bloque

```text
Block
│
├── id
├── kana nuevos
├── kana reutilizados
│
├── mnemotecnias
│
├── vocabulario desbloqueado
│   ├── palabra
│   ├── lectura
│   ├── significado
│   ├── categoría
│   └── kana requeridos
│
├── frases desbloqueadas
│   ├── japonés
│   ├── significado
│   ├── vocabulario utilizado
│   └── gramática requerida
│
├── gramática nueva
│
└── progreso
    ├── kana aprendidos
    ├── vocabulario aprendido
    └── % N5
```

---

## 9. Relación entre datos

```text
Kana → Vocabulary → Sentence → Grammar → Block
```

Un bloque **no duplica datos**: guarda referencias.

```text
Kana        あ い え は
              ↓
Vocabulary  いえ
              ↓
Sentence    いえはあおい
              ↓
Grammar     は como partícula
              ↓
Block 1
```

---

## 10. Principio de reutilización

Una vez aprendido un elemento, **no vuelve a marcarse como nuevo**.

```text
B1 → いえ
B2 → palabra que contiene い + kanaNuevo

El sistema reconoce:
  い        = conocido
  kanaNuevo = nuevo
```

Esto permite calcular automáticamente qué palabras puede aprender el usuario
después de cada bloque.

---

## 11. Arquitectura conceptual

```text
N5 Curriculum
│
├── KanaRepository
├── VocabularyRepository
├── GrammarRepository
├── SentenceRepository
└── BlockRepository
        └── determina qué contenido aparece en cada bloque
```

El contenido va separado del sistema de ejercicios:

```text
CONTENIDO   Kana / vocabulario / frases / gramática
    ↓
CURRÍCULO   Bloques
    ↓
APRENDIZAJE Ejercicios
    ↓
PROGRESO    Estado del usuario
```

Así se pueden cambiar los ejercicios sin tocar el contenido del curso.

## 2.1 estructura de todo el contenido 

FASE 1 — HIRAGANA
Bloque	Caracteres	Nuevas	Acum.	% N5
B1	あいうえおは (6)	9	9	1,1%
B2	しるれとくそ (6)	15	24	2,8%
B3	ひふへほころの (7)	14	38	4,5%
B4	かきけさすせた (7)	12	50	5,9%
B5	ちつてなにぬね (7)	14	64	7,6%
B6	らりんも (4)	24	88	10,4%
B7	まよやわみむめをゆ (9)	17	105	12,4%
B8	dakuten がざだば (16)	68	173	20,4%
B9	ぱ゚ + っ + ー (7)	12	185	21,9%
B10	yōon ゃゅょ (3)	12	197	23,3%

Fase 1 total: 210/846 → 24,8%

B7 fusiona los antiguos B7-B9: む め を ゆ no desbloquean vocabulario propio (ninguna palabra hiragana-nativa del corpus los necesita en solitario), pero hay que enseñarlos para cerrar el silabario antes de los dakuten.

FASE 2 — KATAKANA
Bloque	Caracteres	Nuevas	Acum.	% N5
B1	アイストー (5)	1	1	0,1%
B2	ハカフコテノホレ (8)	13	14	1,7%
B3	ルンタヒツナエキ (8)	17	31	3,7%
B4	ヘラチメセロクシ (8)	15	46	5,4%
B5	ネリオケム (5)	5	51	6,0%
B6	モウサソニヌマミヤユヨワ (11)	1	52	6,1%
B7	ッ (1)	9	61	7,2%
B8	ャュョァィゥェォ (8)	9	70	8,3%

Fase 2 total: 76/846 → 9,0%

B6 fusiona bloques que no aportaban vocabulario propio (ニヌマミヤユヨワ: cero préstamos del corpus los usan en solitario), pero completan el silabario katakana.

FASE 3 — KANJI
Bloque	Kanji	Acum.	Nuevas	Acum.	% N5
K1	出月一七三二人 (7)	7	19	19	2,2%
K2	日大今先口来上 (7)	14	20	39	4,6%
K3	週十手八四毎生 (7)	21	21	60	7,1%
K4	年九入学間下前 (7)	28	21	81	9,6%
K5	時五六本中休小 (7)	35	20	101	11,9%
K6	何語分国後母午名校 (9)	44	19	120	14,2%
K7	外半少店父白見金万会 (10)	54	19	139	16,4%
K8	社話円北千南古右多女 (10)	64	12	151	17,8%
K9	電子安山左書木男百目 (10)	74	13	164	19,4%
K10	車気川新東水火空立聞 (10)	84	12	176	20,8%
K11	天耳花行西言読買足道 (10)	94	10	186	22,0%
K12	長雨食飲駅高魚 (7)	101	7	193	22,8%

Fase 3 total: 204/846 → 24,1% (101 de los 103 kanji históricos aparecen en el corpus; 友 y 土 solo aparecen dentro de compuestos con caracteres N4+, así que quedan en Fase 4)

FASE 4 — VOCABULARIO (pasillos temáticos)
Pasillo	Palabras	Acum.	% N5
P1 Familia y personas	22	22	2,6%
P2 Cuerpo y salud	20	42	5,0%
P3 Clima y naturaleza	31	73	8,6%
P4 Colores	7	80	9,5%
P5 Casa y vida diaria	16	96	11,3%
P6 Comida y bebida	19	115	13,6%
P7 Ciudad y lugares	7	122	14,4%
P8 Tiempo y rutina	19	141	16,7%
P9 Objetos y ropa	15	156	18,4%
P10 Verbos generales	58	214	25,3%
P11 Adjetivos generales	39	253	29,9%
P12 Otros (sin clasificar)	103	356	42,1%

Fase 4 total: 356/846 → 42,1%

Estos pasillos son una primera clasificación automática por palabras clave del glosario español. P12 "Otros" es demasiado grande (103 palabras, 29% de la fase) — necesita revisión manual para repartirlo en pasillos más específicos.

Resumen de las 4 fases
Fase	Palabras	% N5 individual	% N5 acumulado
1. Hiragana	210	24,8%	24,8%
2. Katakana	76	9,0%	33,8%
3. Kanji	204	24,1%	57,9%
4. Vocabulario	356	42,1%	100%
---

## 12. Anexo — catálogo de ejercicios y tablas de bloques

Movido desde `CLAUDE.md` el 18-09-2026: es temario, no regla, y allí se cargaba
entero en cada sesión.

### Ejercicios

Catálogo de tipos de ejercicio: qué existe y para qué sirve cada uno. Cada fila
es un ejercicio de `src/exercises/`, escrito una sola vez y válido para cualquier
pasillo. Los ejemplos con そ / そら son ilustrativos: el contenido real sale de
`docs/estructura-aprendizaje.md`.

| # | Ejercicio | Qué aparece | Qué hace el usuario | Objetivo |
| -: | --- | --- | --- | --- |
| 1 | 🧠 **Mnemotecnia** | Dibujo mnemotécnico + **そ** + `so` | Observa la asociación visual | Crear recuerdo inicial |
| 2 | 👁️ **Introducción** | **そ** + `so` + audio | Ve y escucha el hiragana | Asociar forma + sonido |
| 3 | 🔎 **Reconocimiento** | **そ** + varias opciones: `so`, `ki`, `a`… | Elige `so` | Hiragana → sonido |
| 4 | 🔄 **Reconocimiento inverso** | `so` + varios hiraganas | Elige **そ** | Sonido → hiragana |
| 5 | 🧩 **Parejas** | Hiraganas y sus lecturas | Une **そ ↔ so** junto a hiraganas ya aprendidos | Consolidar asociaciones |
| 6 | 🔊 **Reconocimiento auditivo** | Se escucha **「so」** + 6 tarjetas de hiragana | Elige **そ** | Sonido → forma, sin romaji |
| 7 | 🖼️ **Primera palabra real** | Imagen + palabra, por ejemplo **そら** + audio | Observa que **そ** forma parte de una palabra | Introducir el hiragana en contexto |
| 8 | 🧱 **Completar palabra visual** | 🖼️ cielo + **◯ら** | Entre 6 tarjetas elige **そ** | Aplicarlo dentro de una palabra |
| 9 | 🎧 **Completar palabra por audio** | 🖼️ cielo + audio **「そら」**, pero **sin hiragana ni romaji** | Entre 6 tarjetas elige **そ** | Reconocimiento auditivo contextual |
| 10 | ✅ **Repaso final** | Mezcla de 3–5 pruebas anteriores | Responde sin introducción | Comprobar retención |

---


### Ejercicios de aprendizaje

| Fase               | Nº | Ejercicio                                    |
| ------------------ | -: | -------------------------------------------- |
| **Aprender**       |  1 | Mnemotecnia                                  |
|                    |  2 | Hiragana + romaji + audio                    |
| **Reconocer**      |  3 | Hiragana → romaji                            |
|                    |  4 | Romaji → hiragana                            |
|                    |  5 | Parejas                                      |
| **Escuchar**       |  6 | Audio → hiragana                             |
| **Contextualizar** |  7 | Presentar palabra real + imagen              |
|                    |  8 | Completar viendo la imagen, es kana y roma   |
| **Recordar**       |  9 | Completar con kana y roma usando  audio |
| **Consolidar**     | 10 | Repaso mixto                                 |


### Estructura del aprendizaje — los bloques

#### Bloques completos de la fase hiragana

##### Fase hiragana base (B1–B9)

| Bloque | Kana | Acum. | % base (46) | Palabras | Acum. |  % N5 |
| ------ | ---: | ----: | ----------: | -------: | ----: | ----: |
| B1     |    6 |     6 |       13,0% |       13 |    13 |  1,6% |
| B2     |    6 |    12 |       26,1% |       25 |    38 |  4,8% |
| B3     |    6 |    18 |       39,1% |       25 |    63 |  7,9% |
| B4     |    7 |    25 |       54,3% |       31 |    94 | 11,8% |
| B5     |    6 |    31 |       67,4% |       31 |   125 | 15,6% |
| B6     |    4 |    35 |       76,1% |       30 |   155 | 19,4% |
| B7     |    4 |    39 |       84,8% |       30 |   185 | 23,1% |
| B8     |    4 |    43 |       93,5% |       24 |   209 | 26,1% |
| B9     |    3 |    46 |        100% |       19 |   228 | 28,5% |

##### Fase derivada (B10–B12)

| Bloque | Formas nuevas | Acum. | % silabario (110) | Palabras | Acum. |  % N5 |
| ------ | ------------- | ----: | ----------------: | -------: | ----: | ----: |
| B10    | 25 (dakuten)  |    71 |             64,5% |       61 |   289 | 36,1% |
| B11    | 6 (ぱ行 + っ) |    77 |             70,0% |        8 |   297 | 37,1% |
| B12    | 33 (yōon)     |   110 |              100% |        7 |   304 | 38,0% |

##### Orden de aprendizaje del hiragana

| # | Caracteres | Nuevas | Acum. |
|---|---|---:|---:|
| B1 | あ い う え お は (6) | 13 | 13 |
| B2 | け か し と き こ (6) | 15 | 38 |
| B3 | ひ ふ へ ほ る た (6) | 25 | 63 |
| B4 | く さ す せ そ ち +を (7) | 31 | 94 |
| B5 | つ て ら り れ ろ (6) | 31 | 125 |
| B6 | ぬ ま わ ん (4) | 30 | 155 |
| B7 | ね な や の (4) | 30 | 185 |
| B8 | に み む め (4) | 24 | 209 |
| B9 | も ゆ よ (3) | 19 | 228 |
| B10 | dakuten が ざ だ ば | 61 | 289 |
| B11 | ぱ + っ + vocal larga | 8 | 297 |
| B12 | yōon きゃ しゃ ちゃ… | 7 | 304 |

##### Frases desbloqueadas al final del bloque B1

| Frase | Español |
|---|---|
| いえはあおい | La casa es azul |
| いえはいい | La casa es buena |
| いえはおおい | Hay muchas casas |
| えはあおい | El cuadro es azul |
| えはいい | El cuadro es bueno |
| えはおおい | Hay muchos cuadros |
| うえはあおい | Lo de arriba es azul |
| うえはいい | Lo de arriba está bien |
| あおはいい | El azul es bonito |
| あおはおおい | Hay mucho azul |
| はははいい | Mi madre es buena |
| はははいう | Mi madre dice |
| ははいい | El diente está bien |
| ははおおい | Hay muchos dientes |
| はい / いいえ | Sí / No |

#	Kana nuevos	Formas acum.	% de 80	Palabras	Acum.	% N5
B1	ア イ ス ト ー (5)	7	8,8%	1	1	0,1%
B2	ハ フ コ ツ テ ホ レ (7)	23	28,8%	13	14	1,8%
B3	ン ル ヒ ナ タ カ ラ (7)	34	42,5%	22	36	4,5%
B4	ヘ メ ク マ キ モ リ ウ (8)	46	57,5%	15	51	6,4%
B5	ロ シ ム エ チ セ ケ ソ (8)	59	73,8%	15	66	8,3%
B6	ネ オ サ ニ ノ ヌ ミ (7)	67	83,8%	5	71	8,9%
B7	ヤ ユ ヨ ワ ッ (5)	72	90,0%	6	77	9,6%
B8	ャ ュ ョ ァ ィ ゥ ェ ォ (8)	80	100%	10	87	10,9%

Las formas incluyen los dakuten/handakuten que entran con su fila. B3 es el bloque estrella: 22 palabras.

Ahora calculo la de kanji.

Tabla kanji — 12 bloques, 100 kanji
#	Kanji nuevos	Acum.	% de 100	Palabras	Acum.	% N5
K1	一 二 三 四 五 六 七 (7)	7	7%	14	14	1,8%
K2	人 月 年 時 分 八 九 (7)	14	14%	16	30	3,8%
K3	今 来 大 毎 半 男 女 (7)	21	21%	17	47	5,9%
K4	何 週 子 学 出 十 百 (7)	28	28%	17	64	8,0%
K5	生 円 中 口 小 校 万 (7)	35	35%	17	81	10,1%
K6	日 千 先 火 水 木 金 (7)	42	42%	20	101	12,6%
K7	高 入 友 話 見 休 土 上 下 (9)	51	51%	16	117	14,6%
K8	手 電 外 前 後 左 右 東 西 南 (10)	61	61%	12	129	16,1%
K9	国 名 車 気 北 父 母 私 目 耳 (10)	71	71%	14	143	17,9%
K10	空 天 足 体 山 川 田 雨 花 駅 (10)	81	81%	11	154	19,3%
K11	道 語 読 書 行 食 飲 買 立 店 (10)	91	91%	11	165	20,6%
K12	聞 会 安 新 古 長 多 少 社 (9)	100	100%	9	174	21,8%


Balance de las tres fases
Fase	Bloques	Caracteres	Palabras brutas	Nuevas reales	Acum. único	% N5
Hiragana	12	46 base (110 formas)	304	304	304	38,0%
Katakana	8	46 base (80 formas)	87	87	391	48,9%
Kanji	12	100 kanji	174	68	459	57,4%
FALTANTE	—	—	—	~341	800	42,6%

