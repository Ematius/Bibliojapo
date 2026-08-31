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
