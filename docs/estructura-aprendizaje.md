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