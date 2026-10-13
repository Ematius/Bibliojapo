# OtakuN5 — Fase 1: Modos de enseñanza

## Ampliación del documento maestro · las 185 palabras que no se pueden ilustrar

> **Qué problema resuelve.** El modelo actual asume que toda palabra se enseña
> con un dibujo. Eso funciona para 581 de las 766, pero las otras **185 no
> tienen imagen posible**: では no es un objeto, それ solo significa algo frente
> a これ, y ～まい no existe suelto. Forzar un dibujo en esos 185 casos enseña
> mal el idioma en una cuarta parte del curso.
>
> Esta ampliación **no cambia los 18 bloques**. Añade una columna a `words` y
> cinco tipos de plana nuevos, y saca del temario ろっぽん y にねん, que no eran
> palabras (§4.1).
>
> **La fuente del modo es la columna `modo` de `FASE1_DEFINITIVO.md`**, fila a
> fila y por id. Las listas del §9 son para leer: si chocan, manda FASE1.

---

## 1. El reparto real

| Modo | Palabras | Qué muestra la plana |
|---|---|---|
| `imagen` | **581** | Dibujo + palabra. Lo actual, sin cambios |
| `explicacion` | **68** | Función + cuándo se usa + ejemplo |
| `afijo` | **44** | Ejemplo montado con lo que lo precede |
| `sistema` | **25** | Tabla completa こそあど |
| `situacion` | **23** | Cuándo, a quién, qué se responde |
| `escala` | **15** | Posición relativa a sus vecinas |
| `interjeccion` | **10** | Audio + situación (sin texto posible) |
| | **766** | |

`modo` NO es lo mismo que `tipo`. `tipo` dice qué es gramaticalmente; `modo`
dice cómo se enseña. Dos pronombres pueden tener modos distintos: ここ es
`sistema` y みんな es `explicacion`.

---

## 2. Cambios en el modelo de datos

### 2.1 `words`

```sql
alter table public.words add column if not exists modo text;

alter table public.words drop constraint if exists words_modo_check;
alter table public.words add constraint words_modo_check check (
  modo is null or modo in
    ('imagen','explicacion','afijo','sistema','situacion','escala','interjeccion')
);

-- Un afijo no existe suelto: necesita saber a qué se pega y un ejemplo montado.
alter table public.words add column if not exists se_une_a text;   -- numero | sustantivo | raiz-verbal | adjetivo
alter table public.words add column if not exists ejemplos jsonb not null default '[]'::jsonb;

-- Para 'sistema' y 'escala': a qué familia pertenece y en qué puesto.
alter table public.words add column if not exists familia text;
alter table public.words add column if not exists familia_pos int;

-- Para 'situacion': con qué se responde o se empareja.
alter table public.words add column if not exists pareja_id text;
```

`ejemplos` tiene la misma forma que `examples` de `grammar`: una lista de
`{label, forms[]}`, una fila de tabla por elemento. Así `GrammarTable` la pinta
sin tocar nada, y la tabla de contadores del §4.1 cabe tal cual.

Hoy solo existe `modo` y su check. Las otras cinco columnas llegan con la
primera plana que las necesite.

### 2.2 Regla de render

| modo | ¿Pide imagen? | ¿Pide audio? | ¿Entra en el examen de reconocimiento? |
|---|---|---|---|
| imagen | sí | sí | sí |
| explicacion | no | sí | sí, por significado |
| afijo | no | sí | solo dentro de su ejemplo |
| sistema | no | sí | sí, pero contra su familia |
| situacion | no | **obligatorio** | sí, por situación |
| escala | no | sí | sí, ordenando la escala |
| interjeccion | no | **obligatorio** | solo por audio |

**`modo` e `image` no son excluyentes.** `modo` decide qué plana se muestra;
el dibujo es opcional en cualquier modo y obligatorio solo en `imagen`. Un afijo
puede tener su plana y además su dibujo: ～えん con una moneda es útil.

**Cómo publica `isComplete`.** Nunca exigió dibujo a cada palabra: pide que cada
lección de kana tenga al menos una palabra enseñable, y las que no lo son se caen
del tomo sin aviso. Ahora solo cuentan para eso las de modo `imagen`. Sin ese
ajuste, B3 (り, cuya única palabra es あまり) y B18 (ー, con ええ y うーん) no
se publicaban sin forzar un dibujo — el mismo fallo que tenía ぺ.

Un modo sin su plana no se publica, tenga dibujo o no: el volcado lo lista como
pendiente hasta que su plana exista.

---

## 3. こそあど — una tabla, no 25 palabras

Enseñar それ sola es imposible: significa «eso» **en contraste con** これ y あれ.
Se presenta la rejilla entera la primera vez y luego cada bloque desbloquea las
casillas que le tocan.

| | こ (cerca de mí) | そ (cerca de ti) | あ (lejos de los dos) | ど (pregunta) |
|---|---|---|---|---|
| **Cosa** | これ | それ | あれ | どれ |
| **Lugar** | ここ | そこ | あそこ | どこ |
| **+ sustantivo** | この | その | あの | どの |
| **Dirección (cortés)** | こちら | そちら | あちら | どちら |
| **Dirección (coloquial)** | こっち | そっち | あっち | どっち |
| **Tipo** | こんな | — | — | どんな |

**Regla que el alumno debe sacar solo:** la primera letra dice la distancia y el
resto dice la categoría. Sabiendo それ y ここ, se deduce そこ sin haberla visto.

`familia: 'kosoado'` · `familia_pos` = fila × 10 + columna.

Avisos de contenido: そんな y あんな **no están en el corpus N5** y la tabla
tendrá dos huecos. どなた (quién, cortés), どこか (algún sitio) y どう (cómo)
pertenecen a la familia pero no a la rejilla — van como nota al pie, no como
casilla. La fila de どう —こう/そう/ああ/どう— está incompleta en el N5: falta こう.

---

## 4. Afijos y contadores — nunca sueltos

45 entradas del corpus **no son palabras**: son sufijos y prefijos. La tilde del
CSV (`～まい`, `お～`) ya lo decía.

### 4.1 Los contadores cambian de lectura

Esto es lo que hace imposible enseñarlos sueltos:

| Contador | Para qué | 1 | 2 | 3 | 6 | 8 | 10 | ¿cuántos? |
|---|---|---|---|---|---|---|---|---|
| ～ほん | objetos largos | いっぽん | にほん | さんぼん | ろっぽん | はっぽん | じゅっぽん | なんぼん |
| ～まい | objetos planos | いちまい | にまい | さんまい | ろくまい | はちまい | じゅうまい | なんまい |
| ～にん | personas | ひとり | ふたり | さんにん | ろくにん | はちにん | じゅうにん | なんにん |
| ～さつ | libros | いっさつ | にさつ | さんさつ | ろくさつ | はっさつ | じゅっさつ | なんさつ |
| ～ひき | animales pequeños | いっぴき | にひき | さんびき | ろっぴき | はっぴき | じゅっぴき | なんびき |
| ～かい | veces | いっかい | にかい | さんかい | ろっかい | はっかい | じゅっかい | なんかい |
| ～はい | vasos, tazas | いっぱい | にはい | さんばい | ろっぱい | はっぱい | じゅっぱい | なんばい |
| ～つ | general | ひとつ | ふたつ | みっつ | むっつ | やっつ | とお | いくつ |

**Bug que esto destapó:** `ろっぽん` estaba en el corpus **como palabra
independiente**, y no lo es: es 六 + ～ほん. Ha salido de `words`, y con ella
にねん (二 + ～ねん), que era el mismo caso. Se enseñan como ejemplos de su
afijo. La frase ろっぽんあります。 se borró: B17 se queda con cinco.

いちにち, いちど, なんじ y なんにち **se quedan como palabras**: están
lexicalizadas. いちにち es «un día entero», no «1 día», y なんじ y なんにち son
interrogativos fijos que todos los manuales enseñan como unidad.

Y ～にん es doblemente irregular: ひとり y ふたり no siguen el patrón en absoluto.

### 4.2 El resto de afijos

| Afijo | Se une a | Ejemplo montado |
|---|---|---|
| お～ | sustantivo | おかね · おちゃ · おみせ |
| ～さん | nombre de persona | たなかさん |
| ～たち | persona | わたしたち · こどもたち |
| ～じん | país | にほんじん · アメリカじん |
| ～ご | país | にほんご · えいご |
| ～や | producto | ほんや · パンや · やおや |
| ～がる | raíz de adjetivo | ほしがる |
| ～すぎ | raíz verbal / adjetivo | たべすぎ |
| ～ながら | raíz -masu | たべながら |
| ～だけ | sustantivo | これだけ |
| ～ずつ | número | ひとつずつ |
| ～など | sustantivo | ほんなど |
| ～くらい/ぐらい | cantidad | さんじかんぐらい |
| ～ころ/～ごろ | hora | さんじごろ |

---

## 5. Saludos — por situación y en pares

Lo que falta no es la traducción, es **cuándo, a quién y qué se responde**.
Cada ficha necesita: situación, registro (formal/informal) y pareja.

| Dices | Cuándo | Te responden |
|---|---|---|
| おはようございます | por la mañana | おはようございます |
| こんにちは | de día | こんにちは |
| こんばんは | de noche | こんばんは |
| ありがとうございます | te han ayudado | どういたしまして |
| どうもありがとう | versión más corta | どういたしまして |
| いただきます | antes de comer | — |
| ごちそうさまでした | después de comer | — |
| いってきます | sales de casa | いってらっしゃい* |
| ただいま | vuelves a casa | おかえりなさい* |
| はじめまして | primer encuentro | はじめまして → よろしく |
| よろしく | cierras la presentación | こちらこそ |
| しつれいします | entras o te vas de un sitio | — |
| しつれいしました | te vas tras molestar | — |
| ごめんください | llamas a una puerta | いらっしゃいませ (en tienda) |
| いらっしゃいませ | **solo lo dice el dependiente** | (no se responde) |
| さようなら | despedida larga | さようなら |
| では、また | despedida informal | では、また |
| おげんきで | no os veréis en tiempo | — |
| ごめんなさい | te disculpas | — |
| すみません | disculpa **o** llamar la atención | — |
| もしもし | **solo al teléfono** | もしもし |

\* いってらっしゃい y おかえりなさい **no están en el corpus N5**. Se mencionan
como respuesta, no se enseñan como palabra.

**Tres que el alumno confunde siempre y hay que contrastar explícitamente:**

- **すみません vs ごめんなさい** — すみません sirve para disculparse *y* para
  llamar a un camarero. ごめんなさい es solo disculpa, y más personal.
- **さようなら vs では、また** — さようなら suena a despedida larga; entre amigos
  resulta raro. En japonés cotidiano se usa mucho menos de lo que los manuales
  sugieren.
- **いらっしゃいませ** — el alumno nunca la dirá, solo la oirá. Enseñarla como
  comprensión, no como producción.

---

## 6. Escalas — se aprenden en orden, no sueltas

### Grado

```
ぜんぶ  →  たくさん  →  とても / たいへん  →  だいたい  →  すこし / ちょっと  →  あまり
todo       mucho         muy                 bastante      un poco            poco
```

### Frecuencia

```
いつも  →  よく  →  たいてい  →  ときどき  →  あまり
siempre    a menudo  normalmente  a veces      casi nunca
```

### Pares opuestos

| | |
|---|---|
| まだ (todavía no) | ↔ もう (ya) |
| ちょっと (un poco) | ↔ もっと (más) |

**Aviso de gramática camuflada: あまり exige verbo en negativo.**
あまりおいしくない = «no está muy bueno». **あまりおいしい es incorrecto.**
No es vocabulario, es una regla de concordancia, y debe ir en la ficha.

Lo mismo con **まだ**, que suele pedir negativo (まだです / まだたべていません).

**Tres homónimos que NO van en escala:** たいへん «difícil», もう «otra vez» y
よく «bien». Comparten forma con los de las escalas, pero no ocupan ningún
puesto en ellas: son `explicacion`.

---

## 7. Interjecciones — solo con audio

Diez entradas que **por texto son indistinguibles**. El CSV traduce あ y ああ
exactamente igual («ah, oh»), y え, ええ, えー y えっ se solapan. La diferencia
es duración y entonación.

| | Lectura | Qué comunica |
|---|---|---|
| あ | corta | sorpresa breve, caer en la cuenta |
| ああ | larga | comprensión, resignación |
| え | corta, subiendo | «¿cómo?», no has oído |
| えっ | cortada | sorpresa fuerte, incredulidad |
| ええ | larga | «sí» suave, asentir |
| えー | larga, dudando | «mmm», ganar tiempo |
| うーん | larga, nasal | duda, no convencido |
| あの | alargada | titubeo antes de pedir algo |
| あのう | más alargada | lo mismo, más cortés |
| さあ | — | «venga», o «no sé» |

**Regla de render:** una interjección sin audio **no se publica**. Es la única
categoría donde el audio no es un complemento sino el contenido.

---

## 8. Explicación — las 68 restantes

Subfamilias para que la plana pueda contrastar en vez de definir:

**Conectores (6).** しかし · でも · だから · それから · そして · じゃあ
→ でも y しかし significan lo mismo: **でも es coloquial, しかし es escrito**.
Si no se contrastan, el alumno los usa al azar.

**では / それでは / じゃあ** — es el caso que disparó todo esto. Los tres son el
mismo conector en tres registros: じゃあ (coloquial) · では (neutro) ·
それでは (formal). Marca el cierre o el cambio de tema: では、また.

**Interrogativos no-こそあど (10).** いつ · いくら · いくつ · なに/なん · なぜ ·
どうして · だれ · なんじ · なんにち · いかが
→ なぜ y どうして significan lo mismo: **どうして es hablado, なぜ es escrito**.

**Pronombres personales (9).** わたし · わたくし · ぼく · あなた · じぶん ·
みんな · みなさん · だれか · なにか
→ **Aviso importante: あなた casi no se usa en japonés real.** Suena distante o
íntimo según el contexto; lo normal es el nombre de la persona + さん. Enseñarla
sin esa nota produce alumnos que suenan raros.
→ ぼく es masculino informal; わたくし es muy formal.

**Adverbios de tiempo y modo (26).** まいにち · まいあさ · いま · すぐに ·
ゆっくりと · まっすぐ · ちょうど · はじめて · いちど · いっしょ · たぶん · など

**Fórmulas (14).** はい · いいえ · ください · おねがいします · どうぞ ·
どうも · そうですか · そうですね · こちらこそ · もちろん
→ **ください vs おねがいします**: ください va detrás del objeto
(みずをください); おねがいします va sola o detrás de un sustantivo.

---

## 9. Las listas completas

### modo: afijo (44)

```csv
kana|romaji|espanol|tipo|modo
お～|o|prefijo honorífico|expresion|afijo
～ころ/～ごろ|koro/goro|aproximadamente, hacia|expresion|afijo
～たち|tachi|plural de personas|expresion|afijo
～つ|tsu|contador general de objetos|contador|afijo
～くらい/ぐらい|kurai/gurai|aproximadamente|particula|afijo
～さん|san|señor, señora|expresion|afijo
～がる|garu|mostrar sensación|expresion|afijo
～すぎ|sugi|demasiado, más de|expresion|afijo
～ずつ|zutsu|cada uno, de uno en uno|particula|afijo
～だけ|dake|solo, solamente|particula|afijo
～ながら|nagara|mientras|particula|afijo
～など|nado|etcétera, entre otros|particula|afijo
～かげつ|kagetsu|meses|contador|afijo
～にん|nin|personas|contador|afijo
～じん|jin|nacionalidad, persona de...|expresion|afijo
～がつ|gatsu|mes del año|contador|afijo
～にち|nichi|día del mes, días|contador|afijo
～まえ|mae|delante de, antes de|expresion|afijo
～ねん|nen|años|contador|afijo
～かかん|kakan|durante ... días|contador|afijo
～しゅうかん|shuukan|semanas|contador|afijo
～じゅう|juu|durante, a lo largo de|expresion|afijo
～ちゅう|chuu|durante, en medio de|expresion|afijo
～じ|ji|hora en punto|contador|afijo
～とき|toki|cuando, en el momento de|sustantivo|afijo
～じかん|jikan|número de horas|contador|afijo
～ほん|hon|objetos largos y cilíndricos|contador|afijo
なん～|nan|qué tipo de, qué|interrogativo|afijo
～ふん|fun|minutos|contador|afijo
～ご|go|idioma, lengua|expresion|afijo
～えん|en|yen|contador|afijo
～ひき|hiki|animales pequeños|contador|afijo
～さい|sai|años de edad|contador|afijo
～や|ya|tienda de, comerciante de|sustantivo|afijo
～かい|kai|piso, planta|contador|afijo
～かい|kai|veces|contador|afijo
～がわ|gawa|lado|sustantivo|afijo
～こ|ko|contador de objetos pequeños|contador|afijo
～だい|dai|contador de máquinas y vehículos|contador|afijo
～ど|do|veces, ocasiones|contador|afijo
～はい|hai|vasos, tazas|contador|afijo
～ばん|ban|número, turno|contador|afijo
～まい|mai|objetos planos|contador|afijo
～さつ|satsu|contador de libros|contador|afijo
```

### modo: sistema (25)

```csv
kana|romaji|espanol|tipo|modo
あれ|are|eso, aquello|pronombre|sistema
それ|sore|eso|pronombre|sistema
あそこ|asoko|allí|pronombre|sistema
あの|ano|aquel, aquella|pronombre|sistema
ここ|koko|aquí|pronombre|sistema
この|kono|este, esta|pronombre|sistema
これ|kore|esto|pronombre|sistema
そこ|soko|ahí, ese lugar|pronombre|sistema
その|sono|ese, esa|pronombre|sistema
あちら|achira|allí, aquel lado|pronombre|sistema
こちら|kochira|aquí, este lado, esta persona|pronombre|sistema
こんな|konna|así, de este tipo|adjetivo-na|sistema
そちら|sochira|ahí, ese lado|pronombre|sistema
どう|dou|cómo, de qué manera|interrogativo|sistema
どこ|doko|dónde|interrogativo|sistema
どこか|dokoka|algún lugar, en algún sitio|pronombre|sistema
どちら|dochira|cuál, qué dirección|interrogativo|sistema
どなた|donata|quién|interrogativo|sistema
どの|dono|qué, cuál|interrogativo|sistema
どれ|dore|cuál de varios|interrogativo|sistema
どんな|donna|qué tipo de|interrogativo|sistema
あっち|acchi|allí, aquel lado|pronombre|sistema
こっち|kocchi|aquí, este lado|pronombre|sistema
そっち|socchi|ahí, ese lado|pronombre|sistema
どっち|docchi|cuál, qué dirección|interrogativo|sistema
```

### modo: situacion (23)

```csv
kana|romaji|espanol|tipo|modo
こんにちは|konnichiwa|hola, buenas tardes|saludo|situacion
もしもし|moshimoshi|hola, al teléfono|saludo|situacion
おやすみなさい|oyasuminasai|buenas noches|saludo|situacion
さようなら|sayounara|adiós|saludo|situacion
しつれいしました|shitsurei shimashita|disculpe por la descortesía|saludo|situacion
しつれいします|shitsurei shimasu|con permiso, disculpe|saludo|situacion
すみません|sumimasen|disculpe, lo siento|saludo|situacion
よろしく|yoroshiku|encantado; cuento contigo|saludo|situacion
ありがとうございます|arigatou gozaimasu|muchas gracias|saludo|situacion
いただきます|itadakimasu|expresión antes de comer|saludo|situacion
おげんきで|ogenki de|cuídese, que le vaya bien|saludo|situacion
おはようございます|ohayou gozaimasu|buenos días|saludo|situacion
こんばんは|konbanwa|buenas noches (saludo)|saludo|situacion
ごちそうさまでした|gochisousama deshita|gracias por la comida|saludo|situacion
ごめんください|gomen kudasai|hola, se puede|saludo|situacion
ごめんなさい|gomennasai|lo siento, perdón|saludo|situacion
ただいま|tadaima|ya estoy en casa|saludo|situacion
どういたしまして|dou itashimashite|de nada|saludo|situacion
どうもありがとう|doumo arigatou|muchas gracias|saludo|situacion
はじめまして|hajimemashite|encantado de conocerle|saludo|situacion
いってきます|ittekimasu|me voy, hasta luego|saludo|situacion
いらっしゃいませ|irasshaimase|bienvenido, qué desea|saludo|situacion
では、また|dewa mata|hasta luego|saludo|situacion
```

### modo: escala (15)

```csv
kana|romaji|espanol|tipo|modo
たいてい|taitei|normalmente, por lo general|adverbio|escala
いつも|itsumo|siempre|adverbio|escala
たいへん|taihen|muy, mucho|adverbio|escala
たくさん|takusan|mucho, muchos|adverbio|escala
とても|totemo|muy|adverbio|escala
もう|mou|ya|adverbio|escala
あまり|amari|no mucho|adverbio|escala
よく|yoku|a menudo|adverbio|escala
だいたい|daitai|aproximadamente, en general|adverbio|escala
まだ|mada|todavía, aún|adverbio|escala
もっと|motto|más|adverbio|escala
ちょっと|chotto|un poco|adverbio|escala
ときどき|tokidoki|a veces|adverbio|escala
すこし|sukoshi|un poco|adverbio|escala
ぜんぶ|zenbu|todo, completamente|adverbio|escala
```

### modo: interjeccion (10)

```csv
kana|romaji|espanol|tipo|modo
あ|a|ah, oh|expresion|interjeccion
ああ|aa|ah, oh|expresion|interjeccion
え|e|eh, oh|expresion|interjeccion
ええ|ee|sí|expresion|interjeccion
あの|ano|eh..., este...|expresion|interjeccion
あのう|anou|disculpe..., este...|expresion|interjeccion
さあ|saa|bueno, venga|expresion|interjeccion
えっ|e|eh, qué|expresion|interjeccion
うーん|uun|mmm, veamos|expresion|interjeccion
えー|ee|mmm, veamos|expresion|interjeccion
```

### modo: explicacion (68)

```csv
kana|romaji|espanol|tipo|modo
いいえ|iie|no|expresion|explicacion
いえ|ie|no|expresion|explicacion
はい|hai|sí|expresion|explicacion
おそく|osoku|tarde|adverbio|explicacion
そう/そうです|sou/sou desu|así, así es|expresion|explicacion
とおく|tooku|lejos|adverbio|explicacion
くろく|kuroku|en negro|adverbio|explicacion
しかし|shikashi|pero, sin embargo|conjuncion|explicacion
あなた|anata|tú, usted|pronombre|explicacion
いくつ|ikutsu|cuántos, qué edad|interrogativo|explicacion
いつ|itsu|cuándo|interrogativo|explicacion
そうして/そして|soushite/soshite|y, y entonces|conjuncion|explicacion
いくら|ikura|cuánto|interrogativo|explicacion
こちらこそ|kochira koso|igualmente, el gusto es mío|expresion|explicacion
それから|sorekara|y después, después de eso|conjuncion|explicacion
ほんとう|hontou|realmente, de verdad|adverbio|explicacion
もちろん|mochiron|por supuesto|adverbio|explicacion
また|mata|otra vez, además|adverbio|explicacion
みんな|minna|todos, todo el mundo|pronombre|explicacion
いかが|ikaga|cómo, qué tal|interrogativo|explicacion
おねがいします|onegaishimasu|por favor|expresion|explicacion
ください|kudasai|por favor, deme|expresion|explicacion
そうですか|sou desu ka|ah, ya veo|expresion|explicacion
そうですね|sou desu ne|sí, así es; veamos|expresion|explicacion
それでは|soredewa|entonces, en ese caso|expresion|explicacion
たぶん|tabun|quizá, probablemente|adverbio|explicacion
だから|dakara|por eso, por lo tanto|conjuncion|explicacion
だんだん|dandan|gradualmente, poco a poco|adverbio|explicacion
では|dewa|entonces, bien|expresion|explicacion
でも|demo|pero, sin embargo|conjuncion|explicacion
どうして|doushite|por qué|interrogativo|explicacion
どうぞ|douzo|por favor, adelante|expresion|explicacion
どうも|doumo|gracias, mucho|expresion|explicacion
なぜ|naze|por qué|interrogativo|explicacion
はじめに|hajime ni|al principio, primero|adverbio|explicacion
ぼく|boku|yo (masculino informal)|pronombre|explicacion
まっすぐ|massugu|recto, directamente|adverbio|explicacion
じゃ/じゃあ|ja/jaa|bueno, entonces|conjuncion|explicacion
そうしましょう|sou shimashou|hagámoslo así|expresion|explicacion
ちょうど|choudo|exactamente, justo|adverbio|explicacion
すぐ・に|sugu/ni|inmediatamente|adverbio|explicacion
ゆっくり・と|yukkuri to|despacio, tranquilamente|adverbio|explicacion
いま|ima|ahora|adverbio|explicacion
じょうずに|jouzu ni|bien, hábilmente|adverbio|explicacion
まいにち|mainichi|cada día|adverbio|explicacion
まいげつ/まいつき|maigetsu/maitsuki|cada mes|adverbio|explicacion
まいしゅう|maishuu|cada semana|adverbio|explicacion
まいねん/まいとし|mainen/maitoshi|cada año|adverbio|explicacion
なん/なに|nan/nani|qué|interrogativo|explicacion
なにか|nanika|algo|pronombre|explicacion
なんにち|nannichi|qué día del mes|interrogativo|explicacion
なんじ|nanji|qué hora|interrogativo|explicacion
いちばん|ichiban|primero, el más|adverbio|explicacion
まいあさ|maiasa|cada mañana|adverbio|explicacion
まいばん|maiban|cada noche|adverbio|explicacion
わたし|watashi|yo|pronombre|explicacion
わたくし|watakushi|yo, formal|pronombre|explicacion
いっしょ|issho|juntos|adverbio|explicacion
じぶん|jibun|uno mismo|pronombre|explicacion
だれ|dare|quién|interrogativo|explicacion
だれか|dareka|alguien|pronombre|explicacion
ちかく|chikaku|cerca, en las proximidades|adverbio|explicacion
はじめて|hajimete|por primera vez|adverbio|explicacion
みなさん|minasan|todos, todo el mundo|pronombre|explicacion
いちど|ichido|una vez|adverbio|explicacion
たいへん|taihen|difícil, duro|adjetivo-na|explicacion
もう|mou|otra vez, más|adverbio|explicacion
よく|yoku|bien, hábilmente|adverbio|explicacion
```

Las 581 restantes son `modo: imagen` y no se listan: son todas las que no
aparecen arriba. Entre ellas está え «dibujo» (絵), que antes figuraba por error
entre las interjecciones por compartir forma con え «eh».

---

## 10. Checklist de implementación

**Esquema**

- [x] `words.modo` con su check de 7 valores
- [ ] `words.se_une_a`, `words.ejemplos` (jsonb)
- [ ] `words.familia`, `words.familia_pos`
- [ ] `words.pareja_id`
- [ ] `volume()` devuelve los campos nuevos; `contract.ts` detrás

**Render — lo que desbloquea la publicación**

- [x] `isComplete`: «ninguna palabra enseñable» cuenta solo las de modo `imagen`
- [x] Audio **obligatorio** para `interjeccion` y `situacion` (ya lo era para todas)
- [ ] Ejercicios y exámenes con palabras sin dibujo: hoy las escogen por su
      dibujo. Va con la primera plana nueva, que es cuando se puede ver
- [ ] Plana nueva por modo (5 tipos: explicacion, afijo, sistema, situacion, escala)
- [ ] Un modo sin su plana no se publica, como pasa hoy con la gramática

**Contenido**

- [x] **Sacar ろっぽん y にねん de `words`**: no son palabras, son 六 + ～ほん
      y 二 + ～ねん. Pasan a `ejemplos` de su afijo cuando exista la columna
- [ ] Rellenar `ejemplos` de los 44 afijos (tabla §4). El documento trae escritos
      unos 22; los demás se escriben a mano cuando toque
- [ ] Rellenar `familia`/`familia_pos` de los 25 de こそあど (tabla §3)
- [ ] Rellenar `pareja_id` de los saludos (tabla §5)
- [ ] Marcar あまり y まだ como «exige negativo» en su ficha
- [ ] Nota de uso real en あなた, さようなら, いらっしゃいませ
- [ ] Contrastes explícitos: でも/しかし · なぜ/どうして · すみません/ごめんなさい ·
      ください/おねがいします · じゃあ/では/それでは

**Lo que NO cambia**

- [ ] Los 18 bloques, su orden y su vocabulario
- [ ] Las conjugaciones y las 12 formas
- [ ] B1 y su media

### En qué orden

El mínimo está hecho: la columna, su check y el ajuste de publicación. Lo que
queda va por tramos, y **lo primero es contenido, no código** — las grabaciones
que faltan en B1 y el arte de B2.

1. **`sistema` (こそあど) y `afijo` (contadores)**, cuando haya tres o cuatro
   bloques más. Son las dos que de verdad cambian el aprendizaje, y las dos
   necesitan lo mismo: `modo` en `volume()` y el reparto por modo en el lector.
   Se monta una vez, con la primera. **Antes `sistema`**, porque sus datos salen
   completos del §3 y los `ejemplos` de los afijos están a medias.
2. **Las otras tres planas** —`explicacion`, `situacion`, `escala`—, al acabar
   el hiragana. No arrastran nada.

Con la primera plana entran los ejercicios y los exámenes, que hoy escogen las
palabras por su dibujo. No antes: hasta que haya una plana en pantalla no se
puede ver si funciona.
