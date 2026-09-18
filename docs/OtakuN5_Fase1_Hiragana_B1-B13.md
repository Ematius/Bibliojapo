# OtakuN5 — Fase 1: Hiragana

## Contenido pedagógico completo de los bloques B1–B13

Este documento sigue la asignación exacta del archivo actualizado `REF_bloques_completo(1).txt`. No se añaden ni eliminan palabras del corpus. Las frases usan únicamente vocabulario desbloqueado hasta el bloque correspondiente y gramática cuyos kana ya pueden leerse en ese punto.

> **Convención:** durante la Fase 1, la columna `frase_kanji_si_aplica` se deja como `—` para no introducir kanji dentro de las frases antes de la fase específica de kanji. La columna `kanji` del vocabulario se conserva porque forma parte de los datos originales del REF.


---

## Fase 1 — B1

**Caracteres nuevos:** `あいうえおは`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あ||a|ah, oh|expresion|si
ああ||aa|ah, oh|expresion|si
いい/よい||ii/yoi|bueno|adjetivo-i|si
いいえ||iie|no|expresion|si
いえ|家|ie|casa, hogar|sustantivo|si
いえ||ie|no|expresion|si
え|絵|e|dibujo, imagen|sustantivo|si
え||e|eh, oh|expresion|si
ええ||ee|sí|expresion|si
お～||o|prefijo honorífico|expresion|si
はい||hai|sí|expresion|si
～はい|～杯|hai|vasos, tazas|contador|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
いえはいい。 | — | ie wa ii. | La casa está bien. | いえ; いい/よい (variante いい) | —
えはいい。 | — | e wa ii. | El dibujo está bien. | え; いい/よい (variante いい) | —
ああ、いい。 | — | aa, ii. | Ah, bien. | ああ; いい/よい (variante いい) | —
はい。 | — | hai. | Sí. | はい | —
いいえ。 | — | iie. | No. | いいえ | —
ええ。 | — | ee. | Sí. | ええ | —
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `は`
- F3: `—`
- F4: `—`
- F5: `—`
- F6: `—`

**Nota pedagógica:** B1 es todavía muy limitado. Se usa únicamente **は** como partícula. La entrada `いい/よい` se conserva completa en la tabla, pero en las frases solo se usa `いい`, porque `よ` todavía no se ha enseñado.

**Control B1: 12 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B2

**Caracteres nuevos:** `しるれとくそ`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
ある||aru|haber, existir|verbo-u|si
ある||aru|tener|verbo-u|si
あれ||are|eso, aquello|pronombre|si
いる|居る|iru|estar, existir|verbo-ru|si
いる|要る|iru|necesitar|verbo-u|si
うれしい||ureshii|feliz, contento|adjetivo-i|si
おいしい||oishii|delicioso|adjetivo-i|si
おくる||okuru|enviar|verbo-u|si
おそく||osoku|tarde|adverbio|si
おととい||ototoi|anteayer|sustantivo|si
おととし||ototoshi|año antepasado|sustantivo|si
そう/そうです||sou/sou desu|así, así es|expresion|si
それ||sore|eso|pronombre|si
とおく||tooku|lejos|adverbio|si
はく||haku|ponerse pantalones o zapatos|verbo-u|si
はし|橋|hashi|puente|sustantivo|si
はし||hashi|palillos|sustantivo|si
れい|零|rei|cero|numero|si
れい||rei|ejemplo|sustantivo|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
それはいい。 | — | sore wa ii. | Eso está bien. | それ | いい/よい (B1; variante いい)
あれはいい。 | — | are wa ii. | Aquello está bien. | あれ | いい/よい (B1; variante いい)
それはおいしい。 | — | sore wa oishii. | Eso está delicioso. | それ; おいしい | —
あれはおいしい。 | — | are wa oishii. | Aquello está delicioso. | あれ; おいしい | —
それはれい。 | — | sore wa rei. | Eso es un ejemplo. | それ; れい (ejemplo) | —
あれははし。 | — | are wa hashi. | Aquello es un puente. | あれ; はし (puente) | —
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `は`
- F3: `は`
- F4: `は`
- F5: `は`
- F6: `は`

**Nota pedagógica:** Todavía no están disponibles `を`, `に`, `が`, `で` ni la forma `です`. Por ello se priorizan predicados con adjetivos-i y estructuras nominales muy simples.

**Control B2: 19 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B3

**Caracteres nuevos:** `ひふへほころの`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あそこ||asoko|allí|pronombre|si
あの||ano|aquel, aquella|pronombre|si
あの||ano|eh..., este...|expresion|si
あのう||anou|disculpe..., este...|expresion|si
いろいろ||iroiro|varios, diversos|adjetivo-na|si
くろく||kuroku|en negro|adverbio|si
ここ||koko|aquí|pronombre|si
この||kono|este, esta|pronombre|si
これ||kore|esto|pronombre|si
～ころ/～ごろ||koro/goro|aproximadamente, hacia|expresion|si
そこ||soko|ahí, ese lugar|pronombre|si
その||sono|ese, esa|pronombre|si
とうふ||toufu|tofu|sustantivo|si
ふろ||furo|baño|sustantivo|si
ほう||hou|manera, dirección|sustantivo|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
とうふはおいしい。 | — | toufu wa oishii. | El tofu está delicioso. | とうふ | おいしい (B2)
このえはいい。 | — | kono e wa ii. | Este dibujo está bien. | この | え (B1); いい/よい (B1; variante いい)
このいえのえはいい。 | — | kono ie no e wa ii. | El dibujo de esta casa está bien. | この | いえ (B1); え (B1); いい/よい (B1; variante いい)
これはいい。 | — | kore wa ii. | Esto está bien. | これ | いい/よい (B1; variante いい)
そこはいい。 | — | soko wa ii. | Ese lugar está bien. | そこ | いい/よい (B1; variante いい)
このとうふはおいしい。 | — | kono toufu wa oishii. | Este tofu está delicioso. | この; とうふ | おいしい (B2)
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `は`
- F3: `の; は`
- F4: `は`
- F5: `は`
- F6: `は`

**Nota pedagógica:** Con `の` ya disponible se pueden formar relaciones nominales como `いえのえ`. Las frases siguen evitando partículas o terminaciones que aún no puedan leerse.

**Control B3: 15 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B4

**Caracteres nuevos:** `かきけさすせた`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あした||ashita|mañana|sustantivo|si
いす||isu|silla|sustantivo|si
うるさい||urusai|ruidoso, molesto|adjetivo-i|si
かかる||kakaru|costar, tardar|verbo-u|si
かける||kakeru|ponerse gafas|verbo-ru|si
かける||kakeru|llamar por teléfono|verbo-ru|si
きれい||kirei|bonito, limpio|adjetivo-na|si
こたえ||kotae|respuesta|sustantivo|si
こたえかた||kotaekata|forma de responder|sustantivo|si
さあ||saa|bueno, venga|expresion|si
しかし||shikashi|pero, sin embargo|conjuncion|si
すし||sushi|sushi|sustantivo|si
する||suru|hacer|verbo-irregular|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
すしはおいしい。 | — | sushi wa oishii. | El sushi está delicioso. | すし | おいしい (B2)
このいす、きれい。 | — | kono isu, kirei. | Esta silla está limpia. | いす; きれい | この (B3)
こたえはこれ。 | — | kotae wa kore. | La respuesta es esta. | こたえ | これ (B3)
これはすし。 | — | kore wa sushi. | Esto es sushi. | すし | これ (B3)
これはいす？ | — | kore wa isu? | ¿Esto es una silla? | いす | これ (B3)
あしたはすし。 | — | ashita wa sushi. | Mañana, sushi. | あした; すし | —
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `—`
- F3: `は`
- F4: `は`
- F5: `は`
- F6: `は`

**Nota pedagógica:** Aunque `か` ya puede leerse, todavía no está disponible `で`, por lo que no se fuerza `ですか`. Se mantienen preguntas coloquiales breves cuando resultan naturales.

**Control B4: 13 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B5

**Caracteres nuevos:** `ちつてなにぬね`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あなた||anata|tú, usted|pronombre|si
いくつ||ikutsu|cuántos, qué edad|interrogativo|si
いつ||itsu|cuándo|interrogativo|si
うち||uchi|casa propia|sustantivo|si
おなか||onaka|estómago, barriga|sustantivo|si
そうして/そして||soushite/soshite|y, y entonces|conjuncion|si
たいてい||taitei|normalmente, por lo general|adverbio|si
～たち||tachi|plural de personas|expresion|si
たて||tate|longitud, altura|sustantivo|si
～つ||tsu|contador general de objetos|contador|si
つける||tsukeru|encender|verbo-ru|si
ない||nai|no haber, no tener|adjetivo-i|si
なる||naru|convertirse, llegar a ser|verbo-u|si
ぬる||nuru|pintar, untar|verbo-u|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
あなたはいえにいる。 | — | anata wa ie ni iru. | Tú estás en casa. | あなた | いえ (B1); いる (B2)
あなたたちはうちにいる。 | — | anata-tachi wa uchi ni iru. | Vosotros estáis en casa. | あなた; ～たち; うち | いる (B2)
これはきれいになる。 | — | kore wa kirei ni naru. | Esto se vuelve limpio o bonito. | なる | これ (B3); きれい (B4)
うちにある。 | — | uchi ni aru. | Está en casa. | うち | ある (B2)
あなたはここにいる。 | — | anata wa koko ni iru. | Tú estás aquí. | あなた | ここ (B3); いる (B2)
そうして、きれいになる。 | — | soushite, kirei ni naru. | Y entonces se vuelve limpio o bonito. | そうして/そして; なる | きれい (B4)
```

**Partículas / marcadores usados por frase:**
- F1: `は; に`
- F2: `は; に`
- F3: `は; に`
- F4: `に`
- F5: `は; に`
- F6: `に`

**Nota pedagógica:** La disponibilidad de `に` permite por primera vez construir localizaciones y cambios de estado más naturales con `いる`, `ある` y `なる`.

**Control B5: 14 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B6

**Caracteres nuevos:** `らりんも`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あちら||achira|allí, aquel lado|pronombre|si
いくら||ikura|cuánto|interrogativo|si
いつも||itsumo|siempre|adverbio|si
いもうとさん||imoutosan|hermana menor de otra persona|sustantivo|si
おとうとさん||otoutosan|hermano menor de otra persona|sustantivo|si
おもしろい||omoshiroi|interesante, divertido|adjetivo-i|si
かんたん||kantan|fácil, sencillo|adjetivo-na|si
くらい|暗い|kurai|oscuro|adjetivo-i|si
～くらい/ぐらい||kurai/gurai|aproximadamente|particula|si
こちら||kochira|aquí, este lado, esta persona|pronombre|si
こちらこそ||kochira koso|igualmente, el gusto es mío|expresion|si
こんな||konna|así, de este tipo|adjetivo-na|si
こんにちは||konnichiwa|hola, buenas tardes|saludo|si
～さん||san|señor, señora|expresion|si
さん|三|san|tres|numero|si
そちら||sochira|ahí, ese lado|pronombre|si
それから||sorekara|y después, después de eso|conjuncion|si
たいへん||taihen|muy, mucho|adverbio|si
たいへん||taihen|difícil, duro|adjetivo-na|si
たくさん||takusan|mucho, muchos|adverbio|si
つくりかた||tsukurikata|forma de hacer, receta|sustantivo|si
とても||totemo|muy|adverbio|si
ほんとう||hontou|realmente, de verdad|adverbio|si
もう||mou|ya|adverbio|si
もう||mou|otra vez, más|adverbio|si
もしもし||moshimoshi|hola, al teléfono|saludo|si
もちろん||mochiron|por supuesto|adverbio|si
もらう||morau|recibir|verbo-u|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
これはおもしろい。 | — | kore wa omoshiroi. | Esto es interesante. | おもしろい | これ (B3)
それもおもしろい。 | — | sore mo omoshiroi. | Eso también es interesante. | おもしろい | それ (B2)
これはとてもおもしろい。 | — | kore wa totemo omoshiroi. | Esto es muy interesante. | とても; おもしろい | これ (B3)
これはいくら？ | — | kore wa ikura? | ¿Cuánto cuesta esto? | いくら | これ (B3)
こんにちは。 | — | konnichiwa. | Hola / buenas tardes. | こんにちは | —
こちらこそ。 | — | kochira koso. | Igualmente; el gusto es mío. | こちらこそ | —
もちろん。 | — | mochiron. | Por supuesto. | もちろん | —
それから、する。 | — | sorekara, suru. | Y después, lo hago. | それから | する (B4)
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `も`
- F3: `は`
- F4: `は`
- F5: `—`
- F6: `—`
- F7: `—`
- F8: `—`

**Nota pedagógica:** Con `も` y el nuevo vocabulario aparecen frases más variadas. Se sigue evitando cualquier kana todavía no enseñado.

**Control B6: 28 entradas nuevas + 8 frases objetivo.**


---

## Fase 1 — B7

**Caracteres nuevos:** `まよやわみ`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あまり||amari|no mucho|adverbio|si
おまわりさん||omawarisan|policía|sustantivo|si
おやすみなさい||oyasuminasai|buenas noches|saludo|si
かいとうようし||kaitouyoushi|hoja de respuestas|sustantivo|si
かわいい||kawaii|bonito, adorable|adjetivo-i|si
さようなら||sayounara|adiós|saludo|si
しつれいしました||shitsurei shimashita|disculpe por la descortesía|saludo|si
しつれいします||shitsurei shimasu|con permiso, disculpe|saludo|si
すしや||sushiya|restaurante de sushi|sustantivo|si
すみません||sumimasen|disculpe, lo siento|saludo|si
つまらない||tsumaranai|aburrido, insignificante|adjetivo-i|si
ほんや||honya|librería|sustantivo|si
また||mata|otra vez, además|adverbio|si
みんな||minna|todos, todo el mundo|pronombre|si
やる||yaru|hacer|verbo-u|si
よく||yoku|a menudo|adverbio|si
よく||yoku|bien, hábilmente|adverbio|si
よろしく||yoroshiku|encantado; cuento contigo|saludo|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
これはかわいい。 | — | kore wa kawaii. | Esto es bonito. | かわいい | これ (B3)
それはつまらない。 | — | sore wa tsumaranai. | Eso es aburrido. | つまらない | それ (B2)
すみません。 | — | sumimasen. | Disculpe / lo siento. | すみません | —
おやすみなさい。 | — | oyasuminasai. | Buenas noches. | おやすみなさい | —
さようなら。 | — | sayounara. | Adiós. | さようなら | —
またね。 | — | mata ne. | Hasta luego. | また | —
よろしく。 | — | yoroshiku. | Encantado; cuento contigo. | よろしく | —
みんなもする。 | — | minna mo suru. | Todos también lo hacen. | みんな | する (B4)
```

**Partículas / marcadores usados por frase:**
- F1: `は`
- F2: `は`
- F3: `—`
- F4: `—`
- F5: `—`
- F6: `ね`
- F7: `—`
- F8: `も`

**Nota pedagógica:** El bloque permite saludos y cierres conversacionales naturales como `またね`, además de predicados con adjetivos-i.

**Control B7: 18 entradas nuevas + 8 frases objetivo.**


---

## Fase 1 — B8

**Caracteres nuevos:** `むめを`


### Vocabulario nuevo

**Este bloque no desbloquea vocabulario nuevo en este corpus.** Se conservan igualmente el bloque y sus caracteres nuevos.

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
これをおくる。 | — | kore o okuru. | Envío esto. | — | これ (B3); おくる (B2)
それをぬる。 | — | sore o nuru. | Pinto eso. | — | それ (B2); ぬる (B5)
これをする。 | — | kore o suru. | Hago esto. | — | これ (B3); する (B4)
えをぬる。 | — | e o nuru. | Pinto el dibujo. | — | え (B1); ぬる (B5)
えをおくる。 | — | e o okuru. | Envío el dibujo. | — | え (B1); おくる (B2)
こたえをおくる。 | — | kotae o okuru. | Envío la respuesta. | — | こたえ (B4); おくる (B2)
```

**Partículas / marcadores usados por frase:**
- F1: `を`
- F2: `を`
- F3: `を`
- F4: `を`
- F5: `を`
- F6: `を`

**Nota pedagógica:** Este bloque introduce `む・め・を` pero **no desbloquea vocabulario nuevo en el corpus**. Las frases son de reciclaje y practican especialmente la partícula `を`.

**Control B8: 0 entradas nuevas + 6 frases objetivo.**


---

## Fase 1 — B9

**Caracteres nuevos:** `ゆ`


### Vocabulario nuevo

**Este bloque no desbloquea vocabulario nuevo en este corpus.** Se conservan igualmente el bloque y sus caracteres nuevos.

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
このえをぬる。 | — | kono e o nuru. | Pinto este dibujo. | — | この (B3); え (B1); ぬる (B5)
それをおくる。 | — | sore o okuru. | Envío eso. | — | それ (B2); おくる (B2)
みんなもする。 | — | minna mo suru. | Todos también lo hacen. | — | みんな (B7); する (B4)
```

**Partículas / marcadores usados por frase:**
- F1: `を`
- F2: `を`
- F3: `も`

**Nota pedagógica:** Este bloque introduce `ゆ` pero **no desbloquea vocabulario nuevo en el corpus**. Como no hay una entrada disponible que use `ゆ` en este punto, las frases son de repaso y no se inventa vocabulario externo.

**Control B9: 0 entradas nuevas + 3 frases objetivo.**


---

## Fase 1 — B10

**Caracteres nuevos:** `がぎぐげござじずぜぞだぢづでどばびぶべぼ`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あがる||agaru|subir|verbo-u|si
あびる||abiru|ducharse, bañarse|verbo-ru|si
ありがとうございます||arigatou gozaimasu|muchas gracias|saludo|si
いかが||ikaga|cómo, qué tal|interrogativo|si
いただきます||itadakimasu|expresión antes de comer|saludo|si
えらぶ||erabu|elegir|verbo-u|si
おいでになる||oide ni naru|venir, ir o estar (honorífico)|verbo-u|si
おげんきで||ogenki de|cuídese, que le vaya bien|saludo|si
おじいさん||ojiisan|abuelo, anciano|sustantivo|si
おにぎり||onigiri|bola de arroz|sustantivo|si
おねがいします||onegaishimasu|por favor|expresion|si
おはようございます||ohayou gozaimasu|buenos días|saludo|si
おばあさん||obaasan|abuela, anciana|sustantivo|si
かぎ||kagi|llave|sustantivo|si
かばん||kaban|bolso, cartera|sustantivo|si
かぶる||kaburu|ponerse en cabeza|verbo-u|si
かんがえる||kangaeru|pensar, considerar|verbo-ru|si
～がる||garu|mostrar sensación|expresion|si
ください||kudasai|por favor, deme|expresion|si
こんばんは||konbanwa|buenas noches (saludo)|saludo|si
ごちそうさまでした||gochisousama deshita|gracias por la comida|saludo|si
ごめんください||gomen kudasai|hola, se puede|saludo|si
ごめんなさい||gomennasai|lo siento, perdón|saludo|si
さいご||saigo|final, último|sustantivo|si
～すぎ||sugi|demasiado, más de|expresion|si
～ずつ||zutsu|cada uno, de uno en uno|particula|si
そうですか||sou desu ka|ah, ya veo|expresion|si
そうですね||sou desu ne|sí, así es; veamos|expresion|si
そば||soba|cerca, al lado|sustantivo|si
それでは||soredewa|entonces, en ese caso|expresion|si
ただいま||tadaima|ya estoy en casa|saludo|si
ただしい||tadashii|correcto|adjetivo-i|si
たばこ||tabako|tabaco, cigarrillos|sustantivo|si
たぶん||tabun|quizá, probablemente|adverbio|si
だいたい||daitai|aproximadamente, en general|adverbio|si
だから||dakara|por eso, por lo tanto|conjuncion|si
～だけ||dake|solo, solamente|particula|si
だんだん||dandan|gradualmente, poco a poco|adverbio|si
できる||dekiru|poder, ser capaz|verbo-ru|si
では||dewa|entonces, bien|expresion|si
でも||demo|pero, sin embargo|conjuncion|si
～ど|～度|do|veces, ocasiones|contador|si
ど||do|sábado (abreviatura)|sustantivo|si
どう||dou|cómo, de qué manera|interrogativo|si
どういたしまして||dou itashimashite|de nada|saludo|si
どうして||doushite|por qué|interrogativo|si
どうぞ||douzo|por favor, adelante|expresion|si
どうも||doumo|gracias, mucho|expresion|si
どうもありがとう||doumo arigatou|muchas gracias|saludo|si
どこ||doko|dónde|interrogativo|si
どこか||dokoka|algún lugar, en algún sitio|pronombre|si
どちら||dochira|cuál, qué dirección|interrogativo|si
どなた||donata|quién|interrogativo|si
どの||dono|qué, cuál|interrogativo|si
どれ||dore|cuál de varios|interrogativo|si
どんな||donna|qué tipo de|interrogativo|si
～ながら||nagara|mientras|particula|si
なぜ||naze|por qué|interrogativo|si
～など||nado|etcétera, entre otros|particula|si
にぎやか||nigiyaka|animado, concurrido|adjetivo-na|si
はじめに||hajime ni|al principio, primero|adverbio|si
はじめまして||hajimemashite|encantado de conocerle|saludo|si
ぼく||boku|yo (masculino informal)|pronombre|si
まずい||mazui|malo de sabor, desagradable|adjetivo-i|si
まだ||mada|todavía, aún|adverbio|si
もんだいようし||mondaiyoushi|hoja de preguntas|sustantivo|si
もんだいれい||mondairei|pregunta de ejemplo|sustantivo|si
やじるし||yajirushi|flecha|sustantivo|si
りんご||ringo|manzana|sustantivo|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
ぼくはいえにいる。 | — | boku wa ie ni iru. | Yo estoy en casa. | ぼく | いえ (B1); いる (B2)
どこにいる？ | — | doko ni iru? | ¿Dónde estás? | どこ | いる (B2)
りんごをえらぶ。 | — | ringo o erabu. | Elijo una manzana. | りんご; えらぶ | —
どうしてそれをする？ | — | doushite sore o suru? | ¿Por qué haces eso? | どうして | それ (B2); する (B4)
どこでする？ | — | doko de suru? | ¿Dónde lo haces? | どこ | する (B4)
かばんをおくる。 | — | kaban o okuru. | Envío el bolso. | かばん | おくる (B2)
ありがとうございます。 | — | arigatou gozaimasu. | Muchas gracias. | ありがとうございます | —
おはようございます。 | — | ohayou gozaimasu. | Buenos días. | おはようございます | —
こんばんは。 | — | konbanwa. | Buenas noches. | こんばんは | —
それでは、また。 | — | soredewa, mata. | Entonces, hasta luego. | それでは | また (B7)
```

**Partículas / marcadores usados por frase:**
- F1: `は; に`
- F2: `に`
- F3: `を`
- F4: `を`
- F5: `で`
- F6: `を`
- F7: `—`
- F8: `—`
- F9: `—`
- F10: `—`

**Nota pedagógica:** Con los dakuten quedan disponibles `が`, `で` y las grafías necesarias para `です` y muchas expresiones conversacionales. A partir de aquí las frases pueden ser bastante más completas.

**Control B10: 69 entradas nuevas + 10 frases objetivo.**


---

## Fase 1 — B11

**Caracteres nuevos:** `ぱぴぷぺぽっー`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
あさって||asatte|pasado mañana|sustantivo|si
あっち||acchi|allí, aquel lado|pronombre|si
いってきます||ittekimasu|me voy, hasta luego|saludo|si
えっ||e|eh, qué|expresion|si
こっち||kocchi|aquí, este lado|pronombre|si
せっけん|石鹸|sekken|jabón|sustantivo|si
そっち||socchi|ahí, ese lado|pronombre|si
どっち||docchi|cuál, qué dirección|interrogativo|si
まっすぐ||massugu|recto, directamente|adverbio|si
もっていく||motte iku|llevar algo|verbo-u|si
もっと||motto|más|adverbio|si
りっぱ||rippa|espléndido, excelente|adjetivo-na|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
あさって、いってきます。 | — | asatte, ittekimasu. | Pasado mañana, me voy. | あさって; いってきます | —
これをもっていく。 | — | kore o motte iku. | Me llevo esto. | もっていく | これ (B3)
どっちがいい？ | — | docchi ga ii? | ¿Cuál es mejor? | どっち | いい/よい (B1; variante いい)
こっちはりっぱです。 | — | kocchi wa rippa desu. | Este lado es espléndido. | こっち; りっぱ | —
せっけんはここです。 | — | sekken wa koko desu. | El jabón está aquí. | せっけん | ここ (B3)
もっとする。 | — | motto suru. | Hago más. | もっと | する (B4)
えっ、そっち？ | — | e, socchi? | ¿Eh, por ahí? | えっ; そっち | —
そっちはどう？ | — | socchi wa dou? | ¿Qué tal por ahí? | そっち | どう (B10)
```

**Partículas / marcadores usados por frase:**
- F1: `—`
- F2: `を`
- F3: `が`
- F4: `は`
- F5: `は`
- F6: `—`
- F7: `—`
- F8: `は`

**Nota pedagógica:** Se introducen handakuten, sokuon `っ` y chōon `ー`. Las frases aprovechan formas como `あさって`, `どっち` y `もっていく`.

**Control B11: 12 entradas nuevas + 8 frases objetivo.**


---

## Fase 1 — B12

**Caracteres nuevos:** `ゃゅょ`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
いらっしゃいませ||irasshaimase|bienvenido, qué desea|saludo|si
きょうと||kyouto|Kioto|sustantivo|si
ごしゅじん||goshujin|marido de otra persona|sustantivo|si
しょうゆ||shouyu|salsa de soja|sustantivo|si
じゃ/じゃあ||ja/jaa|bueno, entonces|conjuncion|si
そうしましょう||sou shimashou|hagámoslo así|expresion|si
ちゃわん||chawan|cuenco para arroz|sustantivo|si
ちょうど||choudo|exactamente, justo|adverbio|si
ちょっと||chotto|un poco|adverbio|si
とうきょう||toukyou|Tokio|sustantivo|si
りょこうがいしゃ||ryokougaisha|agencia de viajes|sustantivo|si
りょこうする||ryokou suru|viajar|verbo-irregular|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
いらっしゃいませ。 | — | irasshaimase. | Bienvenido; ¿qué desea? | いらっしゃいませ | —
しょうゆはここです。 | — | shouyu wa koko desu. | La salsa de soja está aquí. | しょうゆ | ここ (B3)
ちゃわんはそこです。 | — | chawan wa soko desu. | El cuenco está ahí. | ちゃわん | そこ (B3)
とうきょうにりょこうする。 | — | toukyou ni ryokou suru. | Viajo a Tokio. | とうきょう; りょこうする | —
きょうとにりょこうする。 | — | kyouto ni ryokou suru. | Viajo a Kioto. | きょうと; りょこうする | —
りょこうがいしゃはどこですか。 | — | ryokougaisha wa doko desu ka. | ¿Dónde está la agencia de viajes? | りょこうがいしゃ | どこ (B10)
ごしゅじんはどこですか。 | — | goshujin wa doko desu ka. | ¿Dónde está su marido? | ごしゅじん | どこ (B10)
じゃあ、そうしましょう。 | — | jaa, sou shimashou. | Entonces, hagámoslo así. | じゃ/じゃあ; そうしましょう | —
ちょっと、すみません。 | — | chotto, sumimasen. | Un momento, disculpe. | ちょっと | すみません (B7)
```

**Partículas / marcadores usados por frase:**
- F1: `—`
- F2: `は`
- F3: `は`
- F4: `に`
- F5: `に`
- F6: `は; か`
- F7: `は; か`
- F8: `—`
- F9: `—`

**Nota pedagógica:** La introducción de `ゃ・ゅ・ょ` desbloquea yōon y permite palabras como `きょうと`, `しょうゆ` y `りょこうする`.

**Control B12: 12 entradas nuevas + 9 frases objetivo.**


---

## Fase 1 — B13 (cruce con Fase 2)

**Caracteres nuevos:** `['(requiere katakana ya conocido)']`


### Vocabulario nuevo

```csv
kana|kanji|romaji|español|tipo|es_nuevo_en_este_bloque
うーん||uun|mmm, veamos|expresion|si
えー||ee|mmm, veamos|expresion|si
けしゴム||keshigomu|goma de borrar|sustantivo|si
すぐ・に||sugu/ni|inmediatamente|adverbio|si
では、また||dewa mata|hasta luego|saludo|si
ゆっくり・と||yukkuri to|despacio, tranquilamente|adverbio|si
```

### Frases objetivo

```text
frase_kana | frase_kanji_si_aplica | romaji | español | palabras_nuevas_usadas | palabras_recicladas_usadas
うーん、どうしよう？ | — | uun, dou shiyou? | Mmm, ¿qué hago? | うーん | どう (B10); する (B4, forma volitiva しよう)
えー、ほんとう？ | — | ee, hontou? | Eh, ¿de verdad? | えー | ほんとう (B6)
けしゴムはここです。 | — | keshigomu wa koko desu. | La goma de borrar está aquí. | けしゴム | ここ (B3)
すぐにおくる。 | — | sugu ni okuru. | Lo envío inmediatamente. | すぐ・に | おくる (B2)
ゆっくりとぬる。 | — | yukkuri to nuru. | Pinto despacio. | ゆっくり・と | ぬる (B5)
では、また。 | — | dewa mata. | Hasta luego. | では、また | —
```

**Partículas / marcadores usados por frase:**
- F1: `—`
- F2: `—`
- F3: `は`
- F4: `に`
- F5: `と`
- F6: `—`

**Nota pedagógica:** Este bloque está marcado expresamente en el REF como **cruce con Fase 2**. `けしゴム` contiene katakana (`ゴム`), por lo que esa frase presupone el katakana necesario, tal como indica el propio bloque. No se generaliza esta excepción a ningún otro bloque.

**Control B13 (cruce con Fase 2): 6 entradas nuevas + 6 frases objetivo.**


---

# FASE 1 COMPLETA

- **Bloques desarrollados:** 13
- **Filas de vocabulario:** 218
- **Frases objetivo:** 88
- **Bloques sin vocabulario propio:** B8 y B9
- **Bloque de cruce con Fase 2:** B13

El contenido no introduce palabras externas al REF. Cuando un bloque no permite una estructura más rica sin usar caracteres todavía no enseñados, se mantiene una frase más simple en lugar de anticipar contenido posterior.