# OtakuN5 — Fase 1: Hiragana
## Documento definitivo · pool 766 · 18 bloques

> **Verificado por script.** 766 filas, 766 ids únicos, 155 frases sin un solo
> kana fuera de su bloque, 126 verbos con raíz derivada por regla y ninguno sin
> ella. Cobertura 766/766, sin residuo.
>
> **Sustituye a TODO documento anterior de la Fase 1**, incluida la versión
> «pool 763», que contenía cinco errores corregidos aquí (ver §0.1).

---

## 0. Qué cambia y por qué

### 0.1 Correcciones sobre la versión «763»

| # | Error | Corrección |
|---|---|---|
| 1 | El filtro de «hiragana puro» rechazaba **ー** (que es técnicamente un carácter katakana) y los signos **・** y **、**, dejando fuera 5 palabras | Pool **768**. Entran うーん, えー, すぐ・に, では、また, ゆっくり・と |
| 2 | Los 5 verbos compuestos con する salían **sin raíz**: la derivación cortaba en el paréntesis | そうじし, けっこんし, さんぽし, べんきょうし, れんしゅうし |
| 3 | Se declaraban **121 verbos** | Son **126**. Los 121 salían de descartar los 5 rotos |
| 4 | La tabla de control decía **726 palabras** | Era una tabla obsoleta. Manda el CSV: **768** |
| 5 | B1 figuraba con **17 filas** en la tabla y 20 en el CSV | Son **20** |

### 0.2 El cambio de fondo

**El pool anterior al rediseño era incorrecto.** Se usaban 210 palabras. El
error fue excluir las palabras que tienen forma en kanji (いえ/家, はは/母,
あおい/青い) por asumir que pertenecían a la fase de kanji. A nivel N5 esas
palabras **se leen y escriben en kana**; el kanji se reencuentra en la Fase 3.
Criterio correcto: *toda palabra cuya lectura sea hiragana puro se enseña en
Fase 1*.

| | Antes | Ahora |
|---|---|---|
| Pool Fase 1 | 210 | **766** (90,8 % del N5) |
| Bloques | 13 | **18** |
| B1 | 13 palabras | **20** (no pierde ninguna) |
| Conjugación disponible | B7 | **B2** |
| です disponible | B10 | **B2** |
| Dakuten | bloque propio | **inline, con su kana base** |
| Handakuten | mezclado | **B17, los 5 juntos con っ** |

> **REGLA ABSOLUTA DE FASE 1: nunca se muestra un kanji.** La columna `kanji`
> existe en los datos porque la Fase 3 la necesita, pero la interfaz de Fase 1
> no la pinta jamás: ni en fichas, ni en frases, ni en ejercicios.

---

## 1. Resumen

| Métrica | Valor |
|---|---|
| Bloques | 18 |
| Lecciones de kana | **56** (46 base + っ ー ゃ ゅ ょ + 5 handakuten) |
| Dakuten | 20, **inline, no son lección** |
| Palabras | **766** |
| Verbos | **126** (85 godan · 32 ichidan · 9 irregulares) |
| Frases objetivo | **155** |
| Cobertura | **90,8 % del vocabulario N5** (766 / 844) |

**Denominadores para la app:** `N5_WORD_COUNT = 844` · `HIRAGANA_BASE_COUNT = 56`.
Los porcentajes se calculan sobre **filas del CSV**, que es lo que cuenta la app.

---

## 2. Modelo de datos

### 2.1 Cambios en `words`

`units` (jsonb, sílaba a sílaba) **ya existe y es mejor** que kana/romaji
planos, porque los ejercicios parten la palabra en tarjetas. **No lo
sustituyas.** Solo faltan cuatro columnas:

```sql
ALTER TABLE words ADD COLUMN tipo          text;  -- conjugations.aplica_a filtra por él
ALTER TABLE words ADD COLUMN grupo_verbal  text;  -- godan | ichidan | irregular | null
ALTER TABLE words ADD COLUMN raiz_masu     text;  -- solo verbos
ALTER TABLE words ADD COLUMN kanji         text;  -- se guarda, NO se muestra en Fase 1
```

`tipo` ∈ { sustantivo, verbo-u, verbo-ru, verbo-irregular, adjetivo-i,
adjetivo-na, adverbio, particula, conjuncion, expresion, contador, saludo,
interrogativo, pronombre, numero }

> **Regla de oro:** un verbo es **una** fila. します / しました **no son
> palabras**: son formas generadas. Nunca se crean como vocabulario.

### 2.2 Tabla `conjugations` — 11 filas fijas

```csv
id|nombre|patron|registro|bloque_min|aplica_a
masu-pres-af|Presente afirmativo|{raiz}ます|cortes|b2|verbo-u,verbo-ru,verbo-irregular
masu-pres-neg|Presente negativo|{raiz}ません|cortes|b2|verbo-u,verbo-ru,verbo-irregular
masu-pas-af|Pasado afirmativo|{raiz}ました|cortes|b5|verbo-u,verbo-ru,verbo-irregular
masu-pas-neg|Pasado negativo|{raiz}ませんでした|cortes|b5|verbo-u,verbo-ru,verbo-irregular
tai|Querer hacer|{raiz}たい|neutro|b6|verbo-u,verbo-ru,verbo-irregular
nai|Negativo llano|{raiz_nai}ない|llano|b13|verbo-u,verbo-ru,verbo-irregular
masho|Invitación|{raiz}ましょう|cortes|b18|verbo-u,verbo-ru,verbo-irregular
copula-pres-af|Es|{palabra}です|cortes|b2|sustantivo,adjetivo-na,adjetivo-i
copula-pres-neg|No es|{palabra}ではありません|cortes|b3|sustantivo,adjetivo-na
copula-pas-af|Era|{palabra}でした|cortes|b5|sustantivo,adjetivo-na,adjetivo-i
copula-pas-neg|No era|{palabra}ではありませんでした|cortes|b5|sustantivo,adjetivo-na
```

**Tres avisos:**

1. `aplica_a` es multivalor → **`text[]`**. Sus valores coinciden exactamente
   con los `tipo` de las palabras, así que el filtro es directo:
   `w.tipo = any(c.aplica_a)`, sin traducción.
2. `bloque_min` **no se compara como texto** ('b10' < 'b3' alfabéticamente) ni
   contra `blocks.position` del pasillo — eso bloquearía en katakana formas ya
   dominadas. Compara contra la **posición en la cadena global** (BLOCK_CHAIN).
3. `lessons.kana_id` es NOT NULL y una lección de gramática no tiene kana.
   Hace falta columna `tipo` en `lessons` con `kana_id` nullable, y que la regla
   se ancle **al bloque**, no a la frase.

### 2.3 Cómo se calcula `raiz_masu`

| Grupo | Regla | Ejemplo |
|---|---|---|
| **ichidan** (`verbo-ru`) | quitar る | たべる → たべ |
| **godan** (`verbo-u`) | última sílaba u → i | ある → あり · かく → かき |
| **irregular** | tabla fija | する → し · くる → き · そうじする → そうじし |

Tabla u→i: う→い, く→き, ぐ→ぎ, す→し, つ→ち, ぬ→に, ぶ→び, む→み, る→り.

> **Caso crítico: いる son DOS verbos.** 居る *estar* (ichidan → います) y
> 要る *necesitar* (godan → いります). Misma lectura, grupo distinto, ids
> distintos. Si comparten fila, la conjugación sale mal.

### 2.4 Generar los `units` de una forma conjugada

**No hace falta una tabla de 104 kana.** Una forma es siempre raíz conocida +
uno de 11 sufijos fijos, así que bastan dos piezas:

1. **Los units de los 11 sufijos**, escritos a mano una vez:
   ます = [ま/ma, す/su] · ませんでした = [ま/ma, せ/se, ん/n, で/de, し/shi, た/ta] …
2. **La transformación de la raíz**, que sale de los units que la palabra ya
   tiene en su fila:
   - *ichidan*: quitar el último unit. Sin tabla.
   - *godan*: sustituir el último unit por su fila-i → **9 pares**, los de §2.3.
   - *irregular*: `raiz_masu` ya viene escrita.

**Dos avisos:** っ y ー **no son entradas de tabla, son reglas** — っ duplica la
consonante siguiente (まっすぐ → ma-s-su-gu) y ー alarga la vocal anterior
(うーん → uun). Y la tabla de lecturas debe ser **independiente** de la tabla
`kana`: los 20 dakuten no son lección, así que no estarían ahí, y un godan en
ぐ (およぐ → およぎます) necesita el rōmaji de ぎ.

### 2.5 Por qué la secuencia de kana es la que es

**(a) Pareja verbal.** Para conjugar un godan terminado en X hace falta su
fila-i: く→き, つ→ち, む→み, ぬ→に, ふ→ひ, る→り, す→し, ぐ→ぎ, ぶ→び.
Por eso き va con く, ち con つ, etc. Sin esta regla había **34 verbos**
introducidos antes de poder conjugarse; ahora quedan **3**, por diseño.
**No reordenes los bloques: romperías esas 34 conjugaciones.**

**(b) Dakuten inline.** Cada kana trae su par sonoro en su mismo bloque.
Excepción: B1 queda limpio y su ば pasa a B2.

### 2.6 Los 3 desfases documentados

| Verbo | Entra | Conjugable | Motivo |
|---|---|---|---|
| あう | B1 | B2 | あいます necesita ま, す (B2) |
| いう | B1 | B2 | いいます necesita ま, す (B2) |
| おす | B2 | B3 | おします necesita し (B3) |

Se muestran en forma de diccionario hasta entonces. Ningún otro verbo desfasa.

### 2.7 Los 126 verbos

id|kana|espanol|grupo_verbal|raiz_masu|bloque
au|あう|encontrarse, ver|godan|あい|b1
iu|いう|decir|godan|いい|b1
osu|おす|empujar, pulsar|godan|おし|b2
suu|すう|fumar, inhalar|godan|すい|b2
agaru|あがる|subir|godan|あがり|b3
aru|ある|haber, existir|godan|あり|b3
aru-2|ある|tener|godan|あり|b3
iru|いる|estar, existir|ichidan|い|b3
iru-2|いる|necesitar|godan|いり|b3
uru|うる|vender|godan|うり|b3
oshieru|おしえる|enseñar, informar|ichidan|おしえ|b3
oriru|おりる|bajarse|ichidan|おり|b3
kau|かう|comprar|godan|かい|b3
kaesu|かえす|devolver|godan|かえし|b3
kaeru|かえる|volver a casa|godan|かえり|b3
kakaru|かかる|costar, tardar|godan|かかり|b3
kasu|かす|prestar|godan|かし|b3
kariru|かりる|pedir prestado|ichidan|かり|b3
kangaeru|かんがえる|pensar, considerar|ichidan|かんがえ|b3
shimaru|しまる|cerrarse|godan|しまり|b3
shiru|しる|saber, conocer|godan|しり|b3
suru|する|hacer|irregular|し|b3
deru|でる|salir, aparecer|ichidan|で|b3
hairu|はいる|entrar|godan|はいり|b3
hashiru|はしる|correr|godan|はしり|b3
hajimaru|はじまる|empezar, comenzar|godan|はじまり|b3
haru-2|はる|pegar, adherir|godan|はり|b3
magaru|まがる|girar, doblar|godan|まがり|b3
owaru|おわる|terminar|godan|おわり|b4
komaru|こまる|tener problemas, preocuparse|godan|こまり|b4
sasu|さす|levantar, abrir un paraguas|godan|さし|b4
suwaru|すわる|sentarse|godan|すわり|b4
denwa-suru|でんわする|llamar por teléfono|irregular|でんわし|b4
naru|なる|convertirse, llegar a ser|godan|なり|b4
hanasu|はなす|hablar|godan|はなし|b4
wakaru|わかる|entender, comprender|godan|わかり|b4
utau|うたう|cantar|godan|うたい|b5
kotaeru|こたえる|responder|ichidan|こたえ|b5
souji-suru|そうじ（する）|limpiar, limpieza|irregular|そうじし|b5
dasu|だす|sacar, enviar|godan|だし|b5
neru|ねる|dormir, acostarse|ichidan|ね|b5
miseru|みせる|mostrar|ichidan|みせ|b5
miru|みる|ver, mirar|ichidan|み|b5
watasu|わたす|entregar, pasar|godan|わたし|b5
wataru|わたる|cruzar, atravesar|godan|わたり|b5
aku|あく|abrirse|godan|あき|b6
arau|あらう|lavar|godan|あらい|b6
aruku|あるく|caminar|godan|あるき|b6
iku-yuku|いく/ゆく|ir|godan|いき|b6
okiru|おきる|levantarse|ichidan|おき|b6
oku|おく|poner, colocar|godan|おき|b6
okuru|おくる|enviar|godan|おくり|b6
kaku|かく|escribir|godan|かき|b6
kieru|きえる|apagarse, desaparecer|ichidan|きえ|b6
kiku|きく|oír, escuchar, preguntar|godan|きき|b6
kiru|きる|cortar|godan|きり|b6
kiru-2|きる|vestirse, ponerse ropa|ichidan|き|b6
kuru|くる|venir|irregular|き|b6
saku|さく|florecer|godan|さき|b6
dekiru|できる|poder, ser capaz|ichidan|でき|b6
naku|なく|hacer sonido, cantar un animal|godan|なき|b6
nakusu|なくす|perder algo|godan|なくし|b6
narau|ならう|aprender|godan|ならい|b6
haku|はく|ponerse pantalones o zapatos|godan|はき|b6
hataraku|はたらく|trabajar|godan|はたらき|b6
migaku|みがく|cepillar, pulir|godan|みがき|b6
chigau|ちがう|ser diferente|godan|ちがい|b7
tomaru|とまる|pararse, detenerse|godan|とまり|b7
toru|とる|tomar, coger|godan|とり|b7
toru-2|とる|hacer una foto|godan|とり|b7
akeru|あける|abrir|ichidan|あけ|b8
ageru|あげる|dar, elevar|ichidan|あげ|b8
kakeru|かける|ponerse gafas|ichidan|かけ|b8
kakeru-2|かける|llamar por teléfono|ichidan|かけ|b8
kesu|けす|borrar, apagar|godan|けし|b8
tatsu|たつ|estar de pie, levantarse|godan|たち|b8
tsukau|つかう|usar|godan|つかい|b8
tsuku|つく|llegar|godan|つき|b8
tsukuru|つくる|hacer, crear|godan|つくり|b8
tsukeru|つける|encender|ichidan|つけ|b8
dekakeru|でかける|salir|ichidan|でかけ|b8
matsu|まつ|esperar|godan|まち|b8
asobu|あそぶ|jugar, divertirse|godan|あそび|b9
abiru|あびる|ducharse, bañarse|ichidan|あび|b9
erabu|えらぶ|elegir|godan|えらび|b9
kaburu|かぶる|ponerse en cabeza|godan|かぶり|b9
tobu|とぶ|volar, saltar|godan|とび|b9
narabu|ならぶ|ponerse en fila|godan|ならび|b9
hiku|ひく|tirar de, jalar|godan|ひき|b9
hiku-2|ひく|tocar un instrumento|godan|ひき|b9
fuku|ふく|soplar|godan|ふき|b9
furu|ふる|llover, nevar|godan|ふり|b9
ireru|いれる|meter, poner dentro|ichidan|いれ|b10
umareru|うまれる|nacer|ichidan|うまれ|b10
kumoru|くもる|nublarse|godan|くもり|b10
tsukareru|つかれる|cansarse|ichidan|つかれ|b10
hareru|はれる|despejarse, hacer sol|ichidan|はれ|b10
motsu|もつ|tener, llevar, sostener|godan|もち|b10
morau|もらう|recibir|godan|もらい|b10
wasureru|わすれる|olvidar|ichidan|わすれ|b10
oide-ni-naru|おいでになる|venir, ir o estar (honorífico)|godan|おいでになり|b11
oyogu|およぐ|nadar|godan|およぎ|b11
yobu|よぶ|llamar, invitar|godan|よび|b11
noru|のる|subir, montar en|godan|のり|b12
oboeru|おぼえる|recordar, memorizar|ichidan|おぼえ|b13
noboru|のぼる|subir, escalar|godan|のぼり|b13
yaru|やる|hacer|godan|やり|b13
shimeru|しめる|cerrar|ichidan|しめ|b14
shimeru-2|しめる|atar, apretar|ichidan|しめ|b14
sumu|すむ|vivir, residir|godan|すみ|b14
tanomu|たのむ|pedir, solicitar|godan|たのみ|b14
tsutomeru|つとめる|trabajar para, servir|ichidan|つとめ|b14
nomu|のむ|beber|godan|のみ|b14
yasumu|やすむ|descansar, faltar|godan|やすみ|b14
yomu|よむ|leer|godan|よみ|b14
taberu|たべる|comer|ichidan|たべ|b15
naraberu|ならべる|poner en fila, ordenar|ichidan|ならべ|b15
shinu|しぬ|morir|godan|しに|b16
nugu|ぬぐ|quitarse ropa|godan|ぬぎ|b16
nuru|ぬる|pintar, untar|godan|ぬり|b16
kekkon-suru|けっこん（する）|casarse, matrimonio|irregular|けっこんし|b17
sanpo-suru|さんぽ（する）|pasear, paseo|irregular|さんぽし|b17
motte-iku|もっていく|llevar algo|godan|もっていき|b17
benkyou-suru|べんきょう（する）|estudiar, estudio|irregular|べんきょうし|b18
ryokou-suru|りょこうする|viajar|irregular|りょこうし|b18
renshuu-suru|れんしゅう（する）|practicar, práctica|irregular|れんしゅうし|b18
---

## 3. Lecciones de gramática

Se insertan como lección propia (`tipo: gramatica`) dentro de su bloque, **detrás
de las lecciones de kana**, antes de las frases. **G0 es página recurrente:**
reaparece en cada bloque que trae dakuten nuevos, con el ejemplo de ese bloque, no
un texto copiado — y cae junto a las demás reglas, no al principio del tomo: lo
primero que usa un dakuten es です, y ningún bloque enseña una palabra con un
dakuten que estrene él mismo.

**G0 · El dakuten " — recurrente desde B2**

> Dos rayitas arriba a la derecha cambian el sonido del kana:
> **て → で** · **は → ば** · **か → が** · **さ → ざ** · **た → だ**
> No es un carácter nuevo: es el mismo kana con la voz activada.

**G1 · La cópula です — B2**

> **A は B です** = «A es B»: cierra la frase y afirma lo que dice. Hace el
> trabajo de «ser» y «estar», pero no es un verbo: no tiene raíz ni se conjuga.
> Vale detrás de una cosa o de una cualidad, y no cambia con la persona.
> Es además la forma **cortés**. Se escribe で + す —で es て con dakuten— y la す
> final casi no suena: «des».
> - いえです。 → Es una casa.
> - あおいです。 → Es azul.
>
> Negación: **ではありません** (disponible desde B3, necesita り).
>
> **La plana no menciona 〜ます, y G2 no menciona です.** Cada una explicando a la
> otra llenaba la hoja y dejaba fuera lo suyo — y en móvil no cabe.

**G2 · La forma ます — B2**

> 〜ます vuelve **cortés** un verbo: con un profesor, un jefe o un desconocido.
>
> No se pega al verbo entero: se pega a su **raíz**, y hay que sacarla. あう,
> いう y すう acaban en う —la marca del verbo sin conjugar— y esa う se cambia
> por い; lo de delante se queda igual. ます afirma y ません niega, y las dos
> valen para el **presente y el futuro**: あいます es «me encuentro» y «me
> encontraré». Tampoco cambian con la persona.
>
> | Verbo | Raíz · う → い | +ます | +ません |
> |---|---|---|---|
> | あう (encontrarse) | あい | あいます | あいません |
> | いう (decir) | いい | いいます | いいません |
> | すう (fumar) | すい | すいます | すいません |
>
> Con los acabados en う no hay **ni una excepción**, y la plana lo dice: un godan
> en う siempre hace う→い. Tampoco hay verbos acabados en あ, え ni ん —todos
> terminan en la línea «u», y cada uno pasa al de su familia con «i», que es la
> tabla u→i de §2.3 entera—. Los otros dos grupos —ichidan, que PIERDE su última
> sílaba, y los irregulares— se avisan pero no se ejemplifican: たべる y する piden
> kana que B2 no ha dado.
>
> **Lo que NO entra en B2, y dónde entra:** ました y ませんでした piden し y た (G3,
> B5), ましょう pide el ょ pequeño (G7, B18) y la pregunta con か pide か (B3).
> Cada una se explica en el tomo que trae sus caracteres, no antes.
>
> Los tres verbos ya están en el temario: あう e いう son de B1 y すう es de B2.
> No hay palabra nueva.

**G3 · El pasado — B5**

> | | Afirmativo | Negativo |
> |---|---|---|
> | Presente | あいます | あいません |
> | Pasado | あいました | あいませんでした |
>
> La cópula sigue el patrón: です → でした.

**G4 · Querer hacer algo ～たい — B6**

> Se pega a la **misma raíz** que ます, y el resultado **se comporta como un
> adjetivo-い**: かいたい → かいたいです.

**G5 · El negativo llano ～ない — B13**

> Forma informal. Ichidan: quitar る + ない. Godan: última sílaba u → a + ない.

**G6 · La partícula を — B16**

> Marca el **objeto directo**. Se escribe を, se pronuncia *o*. Nunca aparece
> dentro de una palabra, solo como partícula.
> - ほんをよみます。 → Leo un libro.

**G7 · ～ましょう — B18**

> Invitación: «hagamos…». Raíz + ましょう → いきましょう.

---

## 4. Los 18 bloques

### B1 · あいうえおは

**Kana nuevos:** あ い う え お は  
**Gramática:** は como partícula de tema (se lee *wa*)  
**Vocabulario:** +20 · acumulado 20 (2.4 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
a|あ||a|ah, oh|expresion|||b1|interjeccion
aa|ああ||aa|ah, oh|expresion|||b1|interjeccion
au|あう|会う|au|encontrarse, ver|verbo-u|godan|あい|b1|imagen
ao|あお|青|ao|azul|sustantivo|||b1|imagen
aoi|あおい|青い|aoi|azul|adjetivo-i|||b1|imagen
ii-yoi|いい/よい||ii/yoi|bueno|adjetivo-i|||b1|imagen
iie|いいえ||iie|no|expresion|||b1|explicacion
iu|いう|言う|iu|decir|verbo-u|godan|いい|b1|imagen
ie|いえ||ie|no|expresion|||b1|explicacion
ie-2|いえ|家|ie|casa, hogar|sustantivo|||b1|imagen
ue|うえ|上|ue|encima, arriba|sustantivo|||b1|imagen
e|え||e|eh, oh|expresion|||b1|interjeccion
e-2|え|絵|e|dibujo, imagen|sustantivo|||b1|imagen
ee|ええ||ee|sí|expresion|||b1|interjeccion
o|お～||o|prefijo honorífico|expresion|||b1|afijo
ooi|おおい|多い|ooi|muchos, mucho|adjetivo-i|||b1|imagen
ha|は|歯|ha|diente|sustantivo|||b1|imagen
hai|はい||hai|sí|expresion|||b1|explicacion
hai-2|～はい|～杯|hai|vasos, tazas|contador|||b1|afijo
haha|はは|母|haha|madre propia|sustantivo|||b1|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
はい。|hai.|Sí.|—
いいえ。|iie.|No.|—
ええ。|ee.|Sí.|—
あおい。|aoi.|Es azul.|—
おおい。|ooi.|Hay muchos.|—
いい。|ii.|Está bien.|—
```

### B2 · ますてせん

**Kana nuevos:** ま す て せ ん  
**Dakuten que traen:** で ぜ ず ば  
**Gramática:** **G0 el dakuten** (て→で, は→ば) · **G1 です** · **G2 ます / ません**  
**Vocabulario:** +24 · acumulado 44 (5.2 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
amai|あまい|甘い|amai|dulce|adjetivo-i|||b2|imagen
isu|いす||isu|silla|sustantivo|||b2|imagen
ima|いま|今|ima|ahora|adverbio|||b2|explicacion
usui|うすい|薄い|usui|fino, tenue|adjetivo-i|||b2|imagen
en|～えん|～円|en|yen|contador|||b2|afijo
oozei|おおぜい|大勢|oozei|mucha gente|sustantivo|||b2|imagen
osu|おす|押す|osu|empujar, pulsar|verbo-u|godan|おし|b2|imagen
sui|すい|水|sui|miércoles (abreviatura)|sustantivo|||b2|imagen
suu|すう|吸う|suu|fumar, inhalar|verbo-u|godan|すい|b2|imagen
sei|せい|背|sei|altura, estatura|sustantivo|||b2|imagen
semai|せまい|狭い|semai|estrecho, pequeño|adjetivo-i|||b2|imagen
sen|せん|千|sen|mil|numero|||b2|imagen
sensei|せんせい|先生|sensei|profesor, maestro|sustantivo|||b2|imagen
te|て|手|te|mano|sustantivo|||b2|imagen
dewa|では||dewa|entonces, bien|expresion|||b2|explicacion
han|はん|半|han|mitad, media|sustantivo|||b2|imagen
ban|ばん|晩|ban|noche, tarde|sustantivo|||b2|imagen
ban-2|～ばん|～番|ban|número, turno|contador|||b2|afijo
mai|～まい|～枚|mai|objetos planos|contador|||b2|afijo
maiban|まいばん|毎晩|maiban|cada noche|adverbio|||b2|explicacion
mae|まえ|前|mae|antes, delante|sustantivo|||b2|imagen
mae-2|～まえ|～前|mae|delante de, antes de|expresion|||b2|afijo
mazui|まずい||mazui|malo de sabor, desagradable|adjetivo-i|||b2|imagen
man|まん|万|man|diez mil|numero|||b2|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
あいます。|aimasu.|Me encuentro con alguien.|—
あいません。|aimasen.|No me encuentro con nadie.|—
いいます。|iimasu.|Lo digo.|—
あおいです。|aoi desu.|Es azul.|—
おおいです。|ooi desu.|Hay muchos.|—
いえです。|ie desu.|Es una casa.|—
ははです。|haha desu.|Es mi madre.|—
うえです。|ue desu.|Está encima.|—
まずいです。|mazui desu.|Está malo.|—
あまいです。|amai desu.|Es dulce.|—
せまいです。|semai desu.|Es estrecho.|—
うすいです。|usui desu.|Es fino.|—
せんせいです。|sensei desu.|Es profesor.|—
いすです。|isu desu.|Es una silla.|—
```

### B3 · りしるか

**Kana nuevos:** り し る か  
**Dakuten que traen:** じ が  
**Gramática:** Se completa la conjugación godan en -る y -す (あります, します) · **ではありません**  
**Vocabulario:** +60 · acumulado 104 (12.3 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
aka|あか|赤|aka|rojo|sustantivo|||b3|imagen
akai|あかい|赤い|akai|rojo|adjetivo-i|||b3|imagen
akarui|あかるい|明るい|akarui|luminoso, alegre|adjetivo-i|||b3|imagen
agaru|あがる||agaru|subir|verbo-u|godan|あがり|b3|imagen
ashi|あし|足|ashi|pie, pierna|sustantivo|||b3|imagen
amari|あまり||amari|no mucho|adverbio|||b3|escala
aru|ある||aru|haber, existir|verbo-u|godan|あり|b3|imagen
aru-2|ある||aru|tener|verbo-u|godan|あり|b3|imagen
ikaga|いかが||ikaga|cómo, qué tal|interrogativo|||b3|explicacion
iru|いる|居る|iru|estar, existir|verbo-ru|ichidan|い|b3|imagen
iru-2|いる|要る|iru|necesitar|verbo-u|godan|いり|b3|imagen
uru|うる|売る|uru|vender|verbo-u|godan|うり|b3|imagen
eiga|えいが|映画|eiga|película|sustantivo|||b3|imagen
eigakan|えいがかん|映画館|eigakan|cine|sustantivo|||b3|imagen
oishii|おいしい||oishii|delicioso|adjetivo-i|||b3|imagen
okashi|おかし|お菓子|okashi|dulces|sustantivo|||b3|imagen
oshieru|おしえる|教える|oshieru|enseñar, informar|verbo-ru|ichidan|おしえ|b3|imagen
oriru|おりる|降りる|oriru|bajarse|verbo-ru|ichidan|おり|b3|imagen
ka|か|火|ka|martes (abreviatura)|sustantivo|||b3|imagen
kai|～かい|～階|kai|piso, planta|contador|||b3|afijo
kai-2|～かい|～回|kai|veces|contador|||b3|afijo
kau|かう|買う|kau|comprar|verbo-u|godan|かい|b3|imagen
kaesu|かえす|返す|kaesu|devolver|verbo-u|godan|かえし|b3|imagen
kaeru|かえる|帰る|kaeru|volver a casa|verbo-u|godan|かえり|b3|imagen
kao|かお|顔|kao|cara|sustantivo|||b3|imagen
kakaru|かかる||kakaru|costar, tardar|verbo-u|godan|かかり|b3|imagen
kakan|～かかん|～日間|kakan|durante ... días|contador|||b3|afijo
kasu|かす|貸す|kasu|prestar|verbo-u|godan|かし|b3|imagen
kaze|かぜ|風|kaze|viento|sustantivo|||b3|imagen
kaze-2|かぜ|風邪|kaze|resfriado|sustantivo|||b3|imagen
katei|かてい|家庭|katei|hogar, familia|sustantivo|||b3|imagen
kaban|かばん||kaban|bolso, cartera|sustantivo|||b3|imagen
kariru|かりる|借りる|kariru|pedir prestado|verbo-ru|ichidan|かり|b3|imagen
karui|かるい|軽い|karui|ligero|adjetivo-i|||b3|imagen
kangaeru|かんがえる||kangaeru|pensar, considerar|verbo-ru|ichidan|かんがえ|b3|imagen
kanji|かんじ|漢字|kanji|kanji|sustantivo|||b3|imagen
garu|～がる||garu|mostrar sensación|expresion|||b3|afijo
shi|し|四|shi|cuatro|numero|||b3|imagen
shio|しお|塩|shio|sal|sustantivo|||b3|imagen
shikashi|しかし||shikashi|pero, sin embargo|conjuncion|||b3|explicacion
shizuka|しずか|静か|shizuka|tranquilo, silencioso|adjetivo-na|||b3|imagen
shimaru|しまる|閉まる|shimaru|cerrarse|verbo-u|godan|しまり|b3|imagen
shiru|しる|知る|shiru|saber, conocer|verbo-u|godan|しり|b3|imagen
ji|～じ|～時|ji|hora en punto|contador|||b3|afijo
jikan|じかん|時間|jikan|tiempo, hora|sustantivo|||b3|imagen
jikan-2|～じかん|～時間|jikan|número de horas|contador|||b3|afijo
jin|～じん|～人|jin|nacionalidad, persona de...|expresion|||b3|afijo
sushi|すし||sushi|sushi|sustantivo|||b3|imagen
suzushii|すずしい|涼しい|suzushii|fresco|adjetivo-i|||b3|imagen
suru|する||suru|hacer|verbo-irregular|irregular|し|b3|imagen
deru|でる|出る|deru|salir, aparecer|verbo-ru|ichidan|で|b3|imagen
hairu|はいる|入る|hairu|entrar|verbo-u|godan|はいり|b3|imagen
hashi|はし||hashi|palillos|sustantivo|||b3|imagen
hashi-2|はし|橋|hashi|puente|sustantivo|||b3|imagen
hashiru|はしる|走る|hashiru|correr|verbo-u|godan|はしり|b3|imagen
hajimaru|はじまる|始まる|hajimaru|empezar, comenzar|verbo-u|godan|はじまり|b3|imagen
haru|はる|春|haru|primavera|sustantivo|||b3|imagen
haru-2|はる|貼る|haru|pegar, adherir|verbo-u|godan|はり|b3|imagen
magaru|まがる|曲る|magaru|girar, doblar|verbo-u|godan|まがり|b3|imagen
marui|まるい|丸い/円い|marui|redondo, circular|adjetivo-i|||b3|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
あります。|arimasu.|Hay.|—
ありません。|arimasen.|No hay.|—
います。|imasu.|Está.|—
いません。|imasen.|No está.|—
します。|shimasu.|Lo hago.|—
しません。|shimasen.|No lo hago.|—
かいます。|kaimasu.|Lo compro.|—
あかいです。|akai desu.|Es rojo.|—
おいしいです。|oishii desu.|Está delicioso.|—
えいがです。|eiga desu.|Es una película.|—
あしです。|ashi desu.|Es el pie.|—
うります。|urimasu.|Lo vendo.|—
おしえます。|oshiemasu.|Lo enseño.|—
おります。|orimasu.|Me bajo.|—
いえはしずかです。|ie wa shizuka desu.|La casa es tranquila.|は
```

### B4 · こなさわ

**Kana nuevos:** こ な さ わ  
**Dakuten que traen:** ご ざ  
**Gramática:** —  
**Vocabulario:** +67 · acumulado 171 (20.3 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
asa|あさ|朝|asa|mañana|sustantivo|||b4|imagen
asagohan|あさごはん|朝御飯|asagohan|desayuno|sustantivo|||b4|imagen
urusai|うるさい||urusai|ruidoso, molesto|adjetivo-i|||b4|imagen
eigo|えいご|英語|eigo|inglés|sustantivo|||b4|imagen
okaasan|おかあさん|お母さん|okaasan|madre|sustantivo|||b4|imagen
ojiisan|おじいさん||ojiisan|abuelo, anciano|sustantivo|||b4|imagen
ojisan|おじさん|伯父さん/叔父さん|ojisan|tío, señor|sustantivo|||b4|imagen
onaka|おなか||onaka|estómago, barriga|sustantivo|||b4|imagen
onaji|おなじ|同じ|onaji|mismo, igual|adjetivo-na|||b4|imagen
obaasan|おばあさん||obaasan|abuela, anciana|sustantivo|||b4|imagen
obasan|おばさん|伯母さん/叔母さん|obasan|tía|sustantivo|||b4|imagen
omawarisan|おまわりさん||omawarisan|policía|sustantivo|||b4|imagen
owaru|おわる|終る|owaru|terminar|verbo-u|godan|おわり|b4|imagen
onna|おんな|女|onna|mujer|sustantivo|||b4|imagen
kasa|かさ|傘|kasa|paraguas|sustantivo|||b4|imagen
kanai|かない|家内|kanai|mi esposa, esposa propia|sustantivo|||b4|imagen
kawa|かわ|川/河|kawa|río|sustantivo|||b4|imagen
kawaii|かわいい||kawaii|bonito, adorable|adjetivo-i|||b4|imagen
gawa|～がわ|側|gawa|lado|sustantivo|||b4|afijo
ko|～こ|～個|ko|contador de objetos pequeños|contador|||b4|afijo
kouen|こうえん|公園|kouen|parque|sustantivo|||b4|imagen
kousaten|こうさてん|交差点|kousaten|cruce, intersección|sustantivo|||b4|imagen
kouban|こうばん|交番|kouban|puesto de policía|sustantivo|||b4|imagen
koe|こえ|声|koe|voz|sustantivo|||b4|imagen
koko|ここ||koko|aquí|pronombre|||b4|sistema
komaru|こまる|困る|komaru|tener problemas, preocuparse|verbo-u|godan|こまり|b4|imagen
konna|こんな||konna|así, de este tipo|adjetivo-na|||b4|sistema
konban|こんばん|今晩|konban|esta noche|sustantivo|||b4|imagen
konbanwa|こんばんは||konbanwa|buenas noches (saludo)|saludo|||b4|situacion
go|ご|五|go|cinco|numero|||b4|imagen
go-2|～ご|～語|go|idioma, lengua|expresion|||b4|afijo
gogo|ごご|午後|gogo|tarde, p. m.|sustantivo|||b4|imagen
gozen|ごぜん|午前|gozen|mañana, a. m.|sustantivo|||b4|imagen
gohan|ごはん|御飯|gohan|arroz cocido, comida|sustantivo|||b4|imagen
saa|さあ||saa|bueno, venga|expresion|||b4|interjeccion
sai|～さい|～歳|sai|años de edad|contador|||b4|afijo
saigo|さいご||saigo|final, último|sustantivo|||b4|imagen
sakana|さかな|魚|sakana|pescado, pez|sustantivo|||b4|imagen
sasu|さす|差す|sasu|levantar, abrir un paraguas|verbo-u|godan|さし|b4|imagen
san|～さん||san|señor, señora|expresion|||b4|afijo
san-2|さん|三|san|tres|numero|||b4|imagen
sukoshi|すこし|少し|sukoshi|un poco|adverbio|||b4|escala
suwaru|すわる|座る|suwaru|sentarse|verbo-u|godan|すわり|b4|imagen
denwa|でんわ|電話|denwa|teléfono|sustantivo|||b4|imagen
denwa-suru|でんわする|電話する|denwa suru|llamar por teléfono|verbo-irregular|irregular|でんわし|b4|imagen
denwa-bangou|でんわばんごう|電話ばんごう|denwa bangou|número de teléfono|sustantivo|||b4|imagen
nai|ない||nai|no haber, no tener|adjetivo-i|||b4|imagen
naka|なか|中|naka|dentro, medio|sustantivo|||b4|imagen
nagai|ながい|長い|nagai|largo|adjetivo-i|||b4|imagen
naze|なぜ||naze|por qué|interrogativo|||b4|explicacion
namae|なまえ|名前|namae|nombre|sustantivo|||b4|imagen
naru|なる||naru|convertirse, llegar a ser|verbo-u|godan|なり|b4|imagen
nan-nani|なん/なに|何|nan/nani|qué|interrogativo|||b4|explicacion
nan|なん～|何～|nan|qué tipo de, qué|interrogativo|||b4|afijo
nanji|なんじ|何時|nanji|qué hora|interrogativo|||b4|explicacion
hako|はこ|箱|hako|caja|sustantivo|||b4|imagen
hana|はな|花|hana|flor|sustantivo|||b4|imagen
hana-2|はな|鼻|hana|nariz|sustantivo|||b4|imagen
hanashi|はなし|話|hanashi|conversación, historia|sustantivo|||b4|imagen
hanasu|はなす|話す|hanasu|hablar|verbo-u|godan|はなし|b4|imagen
bangou|ばんごう|番号|bangou|número|sustantivo|||b4|imagen
bangohan|ばんごはん|晩御飯|bangohan|cena|sustantivo|||b4|imagen
maiasa|まいあさ|毎朝|maiasa|cada mañana|adverbio|||b4|explicacion
ringo|りんご||ringo|manzana|sustantivo|||b4|imagen
wakai|わかい|若い|wakai|joven|adjetivo-i|||b4|imagen
wakaru|わかる|分かる|wakaru|entender, comprender|verbo-u|godan|わかり|b4|imagen
warui|わるい|悪い|warui|malo|adjetivo-i|||b4|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
おなじです。|onaji desu.|Es lo mismo.|—
かわいいです。|kawaii desu.|Es bonito.|—
うるさいです。|urusai desu.|Es ruidoso.|—
おわります。|owarimasu.|Se termina.|—
あさごはんです。|asagohan desu.|Es el desayuno.|—
かさはありません。|kasa wa arimasen.|No hay paraguas.|は
かないです。|kanai desu.|Es mi esposa.|—
こうえんです。|kouen desu.|Es un parque.|—
```

### B5 · たみそね

**Kana nuevos:** た み そ ね  
**Dakuten que traen:** だ ぞ  
**Gramática:** **G3 pasado: ました / ませんでした / でした**  
**Vocabulario:** +67 · acumulado 238 (28.2 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
ashita|あした||ashita|mañana|sustantivo|||b5|imagen
asoko|あそこ||asoko|allí|pronombre|||b5|sistema
atatakai|あたたかい|暖かい|atatakai|cálido|adjetivo-i|||b5|imagen
atama|あたま|頭|atama|cabeza|sustantivo|||b5|imagen
anata|あなた||anata|tú, usted|pronombre|||b5|explicacion
ane|あね|姉|ane|hermana mayor|sustantivo|||b5|imagen
isogashii|いそがしい|忙しい|isogashii|ocupado|adjetivo-i|||b5|imagen
itai|いたい|痛い|itai|doloroso|adjetivo-i|||b5|imagen
imi|いみ|意味|imi|significado|sustantivo|||b5|imagen
uta|うた|歌|uta|canción|sustantivo|||b5|imagen
utau|うたう|歌う|utau|cantar|verbo-u|godan|うたい|b5|imagen
umi|うみ|海|umi|mar|sustantivo|||b5|imagen
okane|おかね|お金|okane|dinero|sustantivo|||b5|imagen
osoi|おそい|遅い|osoi|tarde, lento|adjetivo-i|||b5|imagen
oneesan|おねえさん|お姉さん|oneesan|hermana mayor|sustantivo|||b5|imagen
onegaishimasu|おねがいします||onegaishimasu|por favor|expresion|||b5|explicacion
omise|おみせ|お店|omise|tienda (forma cortés)|sustantivo|||b5|imagen
kaidan|かいだん|階段|kaidan|escaleras|sustantivo|||b5|imagen
kata|かた|方|kata|persona, manera|sustantivo|||b5|imagen
katakana|かたかな|片仮名|katakana|katakana|sustantivo|||b5|imagen
kami|かみ|紙|kami|papel|sustantivo|||b5|imagen
kantan|かんたん||kantan|fácil, sencillo|adjetivo-na|||b5|imagen
kotae|こたえ||kotae|respuesta|sustantivo|||b5|imagen
kotaekata|こたえかた||kotaekata|forma de responder|sustantivo|||b5|imagen
kotaeru|こたえる|答える|kotaeru|responder|verbo-ru|ichidan|こたえ|b5|imagen
shita|した|下|shita|debajo, abajo|sustantivo|||b5|imagen
sumimasen|すみません||sumimasen|disculpe, lo siento|saludo|||b5|situacion
sou-sou-desu|そう/そうです||sou/sou desu|así, así es|expresion|||b5|explicacion
soushite-soshite|そうして/そして||soushite/soshite|y, y entonces|conjuncion|||b5|explicacion
souji-suru|そうじ（する）|掃除|souji suru|limpiar, limpieza|verbo-irregular|irregular|そうじし|b5|imagen
sou-desu-ka|そうですか||sou desu ka|ah, ya veo|expresion|||b5|explicacion
sou-desu-ne|そうですね||sou desu ne|sí, así es; veamos|expresion|||b5|explicacion
soko|そこ||soko|ahí, ese lugar|pronombre|||b5|sistema
soba|そば||soba|cerca, al lado|sustantivo|||b5|imagen
taishikan|たいしかん|大使館|taishikan|embajada|sustantivo|||b5|imagen
taitei|たいてい||taitei|normalmente, por lo general|adverbio|||b5|escala
takai|たかい|高い|takai|alto|adjetivo-i|||b5|imagen
takai-2|たかい|高い|takai|caro|adjetivo-i|||b5|imagen
tadaima|ただいま||tadaima|ya estoy en casa|saludo|||b5|situacion
tadashii|ただしい||tadashii|correcto|adjetivo-i|||b5|imagen
tate|たて||tate|longitud, altura|sustantivo|||b5|imagen
tabako|たばこ||tabako|tabaco, cigarrillos|sustantivo|||b5|imagen
tamago|たまご|卵|tamago|huevo|sustantivo|||b5|imagen
dai|～だい|～台|dai|contador de máquinas y vehículos|contador|||b5|afijo
daitai|だいたい||daitai|aproximadamente, en general|adverbio|||b5|escala
dasu|だす|出す|dasu|sacar, enviar|verbo-u|godan|だし|b5|imagen
dandan|だんだん||dandan|gradualmente, poco a poco|adverbio|||b5|explicacion
tegami|てがみ|手紙|tegami|carta|sustantivo|||b5|imagen
neko|ねこ|猫|neko|gato|sustantivo|||b5|imagen
neru|ねる|寝る|neru|dormir, acostarse|verbo-ru|ichidan|ね|b5|imagen
nen|～ねん|～年|nen|años|contador|||b5|afijo
mainen-maitoshi|まいねん/まいとし|毎年|mainen/maitoshi|cada año|adverbio|||b5|explicacion
mata|また||mata|otra vez, además|adverbio|||b5|explicacion
mada|まだ||mada|todavía, aún|adverbio|||b5|escala
mijikai|みじかい|短い|mijikai|corto|adjetivo-i|||b5|imagen
mizu|みず|水|mizu|agua|sustantivo|||b5|imagen
mise|みせ|店|mise|tienda|sustantivo|||b5|imagen
miseru|みせる|見せる|miseru|mostrar|verbo-ru|ichidan|みせ|b5|imagen
minasan|みなさん|皆さん|minasan|todos, todo el mundo|pronombre|||b5|explicacion
minami|みなみ|南|minami|sur|sustantivo|||b5|imagen
mimi|みみ|耳|mimi|oreja, oído|sustantivo|||b5|imagen
miru|みる|見る|miru|ver, mirar|verbo-ru|ichidan|み|b5|imagen
minna|みんな||minna|todos, todo el mundo|pronombre|||b5|explicacion
watashi|わたし|私|watashi|yo|pronombre|||b5|explicacion
watasu|わたす|渡す|watasu|entregar, pasar|verbo-u|godan|わたし|b5|imagen
wataru|わたる|渡る|wataru|cruzar, atravesar|verbo-u|godan|わたり|b5|imagen
dewa-mata|では、また||dewa mata|hasta luego|saludo|||b5|situacion
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
あしたです。|ashita desu.|Es mañana.|—
あたまがいたいです。|atama ga itai desu.|Me duele la cabeza.|が
うたいます。|utaimasu.|Canto.|—
うみです。|umi desu.|Es el mar.|—
おかねがあります。|okane ga arimasu.|Hay dinero.|が
おそいです。|osoi desu.|Es tarde.|—
かんたんです。|kantan desu.|Es fácil.|—
あなたです。|anata desu.|Eres tú.|—
では、また。|dewa, mata.|Hasta luego.|—
あなたはせんせいですか。|anata wa sensei desu ka.|¿Eres profesor?|は · か
```

### B6 · くきら

**Kana nuevos:** く き ら  
**Dakuten que traen:** ぐ ぎ  
**Gramática:** **G4 ～たい (querer)**  
**Vocabulario:** +72 · acumulado 310 (36.7 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
aki|あき|秋|aki|otoño|sustantivo|||b6|imagen
aku|あく|開く|aku|abrirse|verbo-u|godan|あき|b6|imagen
atarashii|あたらしい|新しい|atarashii|nuevo|adjetivo-i|||b6|imagen
arau|あらう|洗う|arau|lavar|verbo-u|godan|あらい|b6|imagen
aruku|あるく|歩く|aruku|caminar|verbo-u|godan|あるき|b6|imagen
iku-yuku|いく/ゆく|行く|iku/yuku|ir|verbo-u|godan|いき|b6|imagen
ikura|いくら||ikura|cuánto|interrogativo|||b6|explicacion
itadakimasu|いただきます||itadakimasu|expresión antes de comer|saludo|||b6|situacion
uwagi|うわぎ|上着|uwagi|chaqueta|sustantivo|||b6|imagen
eki|えき|駅|eki|estación|sustantivo|||b6|imagen
ookii|おおきい|大きい|ookii|grande|adjetivo-i|||b6|imagen
ookina|おおきな|大きな|ookina|grande|adjetivo-na|||b6|imagen
okiru|おきる|起きる|okiru|levantarse|verbo-ru|ichidan|おき|b6|imagen
oku|おく|置く|oku|poner, colocar|verbo-u|godan|おき|b6|imagen
okusan|おくさん|奥さん|okusan|esposa|sustantivo|||b6|imagen
okuru|おくる||okuru|enviar|verbo-u|godan|おくり|b6|imagen
osara|おさら|お皿|osara|plato|sustantivo|||b6|imagen
osoku|おそく||osoku|tarde|adverbio|||b6|explicacion
otearai|おてあらい|お手洗い|otearai|baño, aseo|sustantivo|||b6|imagen
ongaku|おんがく|音楽|ongaku|música|sustantivo|||b6|imagen
kagi|かぎ||kagi|llave|sustantivo|||b6|imagen
kaku|かく|書く|kaku|escribir|verbo-u|godan|かき|b6|imagen
kazoku|かぞく|家族|kazoku|familia|sustantivo|||b6|imagen
karai|からい|辛い|karai|picante|adjetivo-i|||b6|imagen
karada|からだ|体|karada|cuerpo|sustantivo|||b6|imagen
gaikoku|がいこく|外国|gaikoku|país extranjero|sustantivo|||b6|imagen
gaikokujin|がいこくじん|外国人|gaikokujin|extranjero|sustantivo|||b6|imagen
gakusei|がくせい|学生|gakusei|estudiante|sustantivo|||b6|imagen
ki|き|木|ki|árbol, madera|sustantivo|||b6|imagen
kieru|きえる|消える|kieru|apagarse, desaparecer|verbo-ru|ichidan|きえ|b6|imagen
kiku|きく|聞く|kiku|oír, escuchar, preguntar|verbo-u|godan|きき|b6|imagen
kita|きた|北|kita|norte|sustantivo|||b6|imagen
kitanai|きたない|汚い|kitanai|sucio|adjetivo-i|||b6|imagen
kirai|きらい|嫌い|kirai|desagrado, no gustar|adjetivo-na|||b6|imagen
kiru|きる|切る|kiru|cortar|verbo-u|godan|きり|b6|imagen
kiru-2|きる|着る|kiru|vestirse, ponerse ropa|verbo-ru|ichidan|き|b6|imagen
kin|きん|金|kin|viernes (abreviatura)|sustantivo|||b6|imagen
ginkou|ぎんこう|銀行|ginkou|banco|sustantivo|||b6|imagen
ku|く|九|ku|nueve|numero|||b6|imagen
kusuri|くすり|薬|kusuri|medicina|sustantivo|||b6|imagen
kudasai|ください||kudasai|por favor, deme|expresion|||b6|explicacion
kurai-gurai|～くらい/ぐらい||kurai/gurai|aproximadamente|particula|||b6|afijo
kurai|くらい|暗い|kurai|oscuro|adjetivo-i|||b6|imagen
kuru|くる|来る|kuru|venir|verbo-irregular|irregular|き|b6|imagen
kuruma|くるま|車|kuruma|coche, vehículo|sustantivo|||b6|imagen
saki|さき|先|saki|antes, delante, futuro|sustantivo|||b6|imagen
saku|さく|咲く|saku|florecer|verbo-u|godan|さき|b6|imagen
sarainen|さらいねん|さ来年|sarainen|año siguiente al próximo|sustantivo|||b6|imagen
suki|すき|好き|suki|gustar, favorito|adjetivo-na|||b6|imagen
sugi|～すぎ||sugi|demasiado, más de|expresion|||b6|afijo
sukunai|すくない|少ない|sukunai|poco, escaso|adjetivo-i|||b6|imagen
sentaku|せんたく|洗濯|sentaku|colada, lavado de ropa|sustantivo|||b6|imagen
sora|そら|空|sora|cielo|sustantivo|||b6|imagen
takusan|たくさん||takusan|mucho, muchos|adverbio|||b6|escala
daigaku|だいがく|大学|daigaku|universidad|sustantivo|||b6|imagen
daisuki|だいすき|大好き|daisuki|gustar mucho, favorito|adjetivo-na|||b6|imagen
dakara|だから||dakara|por eso, por lo tanto|conjuncion|||b6|explicacion
tenki|てんき|天気|tenki|tiempo, clima|sustantivo|||b6|imagen
dekiru|できる||dekiru|poder, ser capaz|verbo-ru|ichidan|でき|b6|imagen
denki|でんき|電気|denki|electricidad, luz eléctrica|sustantivo|||b6|imagen
nagara|～ながら||nagara|mientras|particula|||b6|afijo
naku|なく|鳴く|naku|hacer sonido, cantar un animal|verbo-u|godan|なき|b6|imagen
nakusu|なくす|無くす|nakusu|perder algo|verbo-u|godan|なくし|b6|imagen
narau|ならう|習う|narau|aprender|verbo-u|godan|ならい|b6|imagen
haizara|はいざら|灰皿|haizara|cenicero|sustantivo|||b6|imagen
hagaki|はがき|葉書|hagaki|postal|sustantivo|||b6|imagen
haku|はく||haku|ponerse pantalones o zapatos|verbo-u|godan|はき|b6|imagen
hataraku|はたらく|働く|hataraku|trabajar|verbo-u|godan|はたらき|b6|imagen
migaku|みがく|磨く|migaku|cepillar, pulir|verbo-u|godan|みがき|b6|imagen
migi|みぎ|右|migi|derecha|sustantivo|||b6|imagen
rainen|らいねん|来年|rainen|año próximo|sustantivo|||b6|imagen
watakushi|わたくし|私|watakushi|yo, formal|pronombre|||b6|explicacion
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
いきます。|ikimasu.|Voy.|—
かきます。|kakimasu.|Escribo.|—
あるきます。|arukimasu.|Camino.|—
あらいます。|araimasu.|Lavo.|—
おおきいです。|ookii desu.|Es grande.|—
おきます。|okimasu.|Me levanto.|—
おくります。|okurimasu.|Lo envío.|—
えきです。|eki desu.|Es la estación.|—
```

### B7 · とち

**Kana nuevos:** と ち  
**Dakuten que traen:** ど ぢ  
**Gramática:** —  
**Vocabulario:** +68 · acumulado 378 (44.8 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
achira|あちら||achira|allí, aquel lado|pronombre|||b7|sistema
ato|あと|後|ato|después, detrás|sustantivo|||b7|imagen
arigatou-gozaimasu|ありがとうございます||arigatou gozaimasu|muchas gracias|saludo|||b7|situacion
ichi|いち|一|ichi|uno|numero|||b7|imagen
ichido|いちど|一度|ichido|una vez|adverbio|||b7|explicacion
ichiban|いちばん|一番|ichiban|primero, el más|adverbio|||b7|explicacion
iriguchi|いりぐち|入口|iriguchi|entrada|sustantivo|||b7|imagen
uchi|うち||uchi|casa propia|sustantivo|||b7|imagen
otousan|おとうさん|お父さん|otousan|padre|sustantivo|||b7|imagen
otouto|おとうと|弟|otouto|hermano menor|sustantivo|||b7|imagen
otoutosan|おとうとさん||otoutosan|hermano menor de otra persona|sustantivo|||b7|imagen
otoko|おとこ|男|otoko|hombre|sustantivo|||b7|imagen
ototoi|おととい||ototoi|anteayer|sustantivo|||b7|imagen
ototoshi|おととし||ototoshi|año antepasado|sustantivo|||b7|imagen
otona|おとな|大人|otona|adulto|sustantivo|||b7|imagen
kado|かど|角|kado|esquina|sustantivo|||b7|imagen
kuchi|くち|口|kuchi|boca|sustantivo|||b7|imagen
kochira|こちら||kochira|aquí, este lado, esta persona|pronombre|||b7|sistema
kochira-koso|こちらこそ||kochira koso|igualmente, el gusto es mío|expresion|||b7|explicacion
kotoshi|ことし|今年|kotoshi|este año|sustantivo|||b7|imagen
kotoba|ことば|言葉|kotoba|palabra, idioma|sustantivo|||b7|imagen
gochisousama-deshita|ごちそうさまでした||gochisousama deshita|gracias por la comida|saludo|||b7|situacion
satou|さとう|砂糖|satou|azúcar|sustantivo|||b7|imagen
shigoto|しごと|仕事|shigoto|trabajo|sustantivo|||b7|imagen
shichi|しち|七|shichi|siete|numero|||b7|imagen
seito|せいと|生徒|seito|alumno|sustantivo|||b7|imagen
sochira|そちら||sochira|ahí, ese lado|pronombre|||b7|sistema
soto|そと|外|soto|fuera, exterior|sustantivo|||b7|imagen
tachi|～たち||tachi|plural de personas|expresion|||b7|afijo
chiisai|ちいさい|小さい|chiisai|pequeño|adjetivo-i|||b7|imagen
chiisana|ちいさな|小さな|chiisana|pequeño|adjetivo-na|||b7|imagen
chikai|ちかい|近い|chikai|cerca, próximo|adjetivo-i|||b7|imagen
chikaku|ちかく|近く|chikaku|cerca, en las proximidades|adverbio|||b7|explicacion
chigau|ちがう|違う|chigau|ser diferente|verbo-u|godan|ちがい|b7|imagen
chizu|ちず|地図|chizu|mapa|sustantivo|||b7|imagen
chichi|ちち|父|chichi|padre propio|sustantivo|||b7|imagen
deguchi|でぐち|出口|deguchi|salida|sustantivo|||b7|imagen
to|と|戸|to|puerta japonesa|sustantivo|||b7|imagen
too|とお|十|too|diez|numero|||b7|imagen
tooi|とおい|遠い|tooi|lejano, distante|adjetivo-i|||b7|imagen
tooka|とおか|十日|tooka|día diez, diez días|sustantivo|||b7|imagen
tooku|とおく||tooku|lejos|adverbio|||b7|explicacion
toki|～とき|～時|toki|cuando, en el momento de|sustantivo|||b7|afijo
tokidoki|ときどき|時々|tokidoki|a veces|adverbio|||b7|escala
toshi|とし|年|toshi|año, edad|sustantivo|||b7|imagen
tonari|となり|隣|tonari|al lado, vecino|sustantivo|||b7|imagen
tomaru|とまる|止まる|tomaru|pararse, detenerse|verbo-u|godan|とまり|b7|imagen
tori|とり|鳥|tori|pájaro|sustantivo|||b7|imagen
toru|とる|取る|toru|tomar, coger|verbo-u|godan|とり|b7|imagen
toru-2|とる|撮る|toru|hacer una foto|verbo-u|godan|とり|b7|imagen
do|ど||do|sábado (abreviatura)|sustantivo|||b7|imagen
do-2|～ど|～度|do|veces, ocasiones|contador|||b7|afijo
dou|どう||dou|cómo, de qué manera|interrogativo|||b7|sistema
dou-itashimashite|どういたしまして||dou itashimashite|de nada|saludo|||b7|situacion
doushite|どうして||doushite|por qué|interrogativo|||b7|explicacion
douzo|どうぞ||douzo|por favor, adelante|expresion|||b7|explicacion
doko|どこ||doko|dónde|interrogativo|||b7|sistema
dokoka|どこか||dokoka|algún lugar, en algún sitio|pronombre|||b7|sistema
dochira|どちら||dochira|cuál, qué dirección|interrogativo|||b7|sistema
donata|どなた||donata|quién|interrogativo|||b7|sistema
donna|どんな||donna|qué tipo de|interrogativo|||b7|sistema
nado|～など||nado|etcétera, entre otros|particula|||b7|afijo
hatachi|はたち|二十歳|hatachi|veinte años de edad|numero|||b7|imagen
hachi|はち|八|hachi|ocho|numero|||b7|imagen
machi|まち|町|machi|pueblo, ciudad|sustantivo|||b7|imagen
mado|まど|窓|mado|ventana|sustantivo|||b7|imagen
michi|みち|道|michi|camino, calle|sustantivo|||b7|imagen
midori|みどり|緑|midori|verde|sustantivo|||b7|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
いちです。|ichi desu.|Es uno.|—
おとこです。|otoko desu.|Es un hombre.|—
くちです。|kuchi desu.|Es la boca.|—
こちらです。|kochira desu.|Es por aquí.|—
ことばです。|kotoba desu.|Es una palabra.|—
あとでします。|ato de shimasu.|Lo hago después.|で
おとうとがいます。|otouto ga imasu.|Tengo un hermano menor.|が
うちです。|uchi desu.|Es mi casa.|—
おとうとはうちです。|otouto wa uchi desu.|Mi hermano menor está en casa.|は
```

### B8 · つけ

**Kana nuevos:** つ け  
**Dakuten que traen:** づ げ  
**Gramática:** —  
**Vocabulario:** +50 · acumulado 428 (50.7 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
akeru|あける|開ける|akeru|abrir|verbo-ru|ichidan|あけ|b8|imagen
ageru|あげる|上げる|ageru|dar, elevar|verbo-ru|ichidan|あげ|b8|imagen
atsui|あつい|熱い|atsui|caliente|adjetivo-i|||b8|imagen
atsui-2|あつい|厚い|atsui|grueso|adjetivo-i|||b8|imagen
atsui-3|あつい|暑い|atsui|caluroso|adjetivo-i|||b8|imagen
ikutsu|いくつ||ikutsu|cuántos, qué edad|interrogativo|||b8|explicacion
ike|いけ|池|ike|estanque|sustantivo|||b8|imagen
itsu|いつ||itsu|cuándo|interrogativo|||b8|explicacion
itsuka|いつか|五日|itsuka|día cinco, cinco días|sustantivo|||b8|imagen
itsutsu|いつつ|五つ|itsutsu|cinco cosas|numero|||b8|imagen
ogenki-de|おげんきで||ogenki de|cuídese, que le vaya bien|saludo|||b8|situacion
osake|おさけ|お酒|osake|alcohol, sake|sustantivo|||b8|imagen
kakeru|かける||kakeru|ponerse gafas|verbo-ru|ichidan|かけ|b8|imagen
kakeru-2|かける||kakeru|llamar por teléfono|verbo-ru|ichidan|かけ|b8|imagen
kagetsu|～かげつ|～か月|kagetsu|meses|contador|||b8|afijo
gatsu|～がつ|～月|gatsu|mes del año|contador|||b8|afijo
kutsu|くつ|靴|kutsu|zapatos|sustantivo|||b8|imagen
kutsushita|くつした|靴下|kutsushita|calcetines|sustantivo|||b8|imagen
keikan|けいかん|警官|keikan|policía|sustantivo|||b8|imagen
kesa|けさ|今朝|kesa|esta mañana|sustantivo|||b8|imagen
kesu|けす|消す|kesu|borrar, apagar|verbo-u|godan|けし|b8|imagen
getsu|げつ|月|getsu|lunes (abreviatura)|sustantivo|||b8|imagen
genkan|げんかん|玄関|genkan|entrada, recibidor|sustantivo|||b8|imagen
genki|げんき|元気|genki|sano, con energía|adjetivo-na|||b8|imagen
kongetsu|こんげつ|今月|kongetsu|este mes|sustantivo|||b8|imagen
satsu|～さつ|～冊|satsu|contador de libros|contador|||b8|afijo
zutsu|～ずつ||zutsu|cada uno, de uno en uno|particula|||b8|afijo
sengetsu|せんげつ|先月|sengetsu|mes pasado|sustantivo|||b8|imagen
taisetsu|たいせつ|大切|taisetsu|importante|adjetivo-na|||b8|imagen
tatsu|たつ|立つ|tatsu|estar de pie, levantarse|verbo-u|godan|たち|b8|imagen
dake|～だけ||dake|solo, solamente|particula|||b8|afijo
chikatetsu|ちかてつ|地下鉄|chikatetsu|metro|sustantivo|||b8|imagen
tsu|～つ||tsu|contador general de objetos|contador|||b8|afijo
tsuitachi|ついたち|一日|tsuitachi|día uno, primer día del mes|sustantivo|||b8|imagen
tsukau|つかう|使う|tsukau|usar|verbo-u|godan|つかい|b8|imagen
tsugi|つぎ|次|tsugi|siguiente|sustantivo|||b8|imagen
tsuku|つく|着く|tsuku|llegar|verbo-u|godan|つき|b8|imagen
tsukue|つくえ|机|tsukue|escritorio, mesa|sustantivo|||b8|imagen
tsukurikata|つくりかた||tsukurikata|forma de hacer, receta|sustantivo|||b8|imagen
tsukuru|つくる|作る|tsukuru|hacer, crear|verbo-u|godan|つくり|b8|imagen
tsukeru|つける||tsukeru|encender|verbo-ru|ichidan|つけ|b8|imagen
tsumaranai|つまらない||tsumaranai|aburrido, insignificante|adjetivo-i|||b8|imagen
dekakeru|でかける|出かける|dekakeru|salir|verbo-ru|ichidan|でかけ|b8|imagen
tokei|とけい|時計|tokei|reloj|sustantivo|||b8|imagen
natsu|なつ|夏|natsu|verano|sustantivo|||b8|imagen
nanatsu|ななつ|七つ|nanatsu|siete cosas|numero|||b8|imagen
hatsuka|はつか|二十日|hatsuka|día veinte, veinte días|sustantivo|||b8|imagen
maigetsu-maitsuki|まいげつ/まいつき|毎月|maigetsu/maitsuki|cada mes|adverbio|||b8|explicacion
matsu|まつ|待つ|matsu|esperar|verbo-u|godan|まち|b8|imagen
raigetsu|らいげつ|来月|raigetsu|mes próximo|sustantivo|||b8|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
あけます。|akemasu.|Lo abro.|—
あげます。|agemasu.|Lo doy.|—
あついです。|atsui desu.|Hace calor.|—
かけます。|kakemasu.|Me las pongo.|—
けします。|keshimasu.|Lo apago.|—
いつですか。|itsu desu ka.|¿Cuándo es?|か
けさです。|kesa desu.|Es esta mañana.|—
くつです。|kutsu desu.|Son zapatos.|—
```

### B9 · ふひ

**Kana nuevos:** ふ ひ  
**Dakuten que traen:** ぶ び  
**Gramática:** —  
**Vocabulario:** +46 · acumulado 474 (56.2 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
asobu|あそぶ|遊ぶ|asobu|jugar, divertirse|verbo-u|godan|あそび|b9|imagen
abiru|あびる||abiru|ducharse, bañarse|verbo-ru|ichidan|あび|b9|imagen
abunai|あぶない|危ない|abunai|peligroso|adjetivo-i|||b9|imagen
erabu|えらぶ||erabu|elegir|verbo-u|godan|えらび|b9|imagen
kabin|かびん|花瓶|kabin|florero|sustantivo|||b9|imagen
kaburu|かぶる||kaburu|ponerse en cabeza|verbo-u|godan|かぶり|b9|imagen
saifu|さいふ|財布|saifu|cartera, monedero|sustantivo|||b9|imagen
sakubun|さくぶん|作文|sakubun|redacción|sustantivo|||b9|imagen
shinbun|しんぶん|新聞|shinbun|periódico|sustantivo|||b9|imagen
jibiki|じびき|字引|jibiki|diccionario|sustantivo|||b9|imagen
jibun|じぶん|自分|jibun|uno mismo|pronombre|||b9|explicacion
zenbu|ぜんぶ|全部|zenbu|todo, completamente|adverbio|||b9|escala
tabun|たぶん||tabun|quizá, probablemente|adverbio|||b9|explicacion
toufu|とうふ||toufu|tofu|sustantivo|||b9|imagen
tobu|とぶ|飛ぶ|tobu|volar, saltar|verbo-u|godan|とび|b9|imagen
doubutsu|どうぶつ|動物|doubutsu|animal|sustantivo|||b9|imagen
narabu|ならぶ|並ぶ|narabu|ponerse en fila|verbo-u|godan|ならび|b9|imagen
hanbun|はんぶん|半分|hanbun|mitad|sustantivo|||b9|imagen
hi|ひ|日|hi|día|sustantivo|||b9|imagen
higashi|ひがし|東|higashi|este|sustantivo|||b9|imagen
hiki|～ひき|～匹|hiki|animales pequeños|contador|||b9|afijo
hiku|ひく|引く|hiku|tirar de, jalar|verbo-u|godan|ひき|b9|imagen
hiku-2|ひく|弾く|hiku|tocar un instrumento|verbo-u|godan|ひき|b9|imagen
hikui|ひくい|低い|hikui|bajo|adjetivo-i|||b9|imagen
hikouki|ひこうき|飛行機|hikouki|avión|sustantivo|||b9|imagen
hidari|ひだり|左|hidari|izquierda|sustantivo|||b9|imagen
hito|ひと|人|hito|persona|sustantivo|||b9|imagen
hitotsu|ひとつ|一つ|hitotsu|una cosa|numero|||b9|imagen
hitotsuki|ひとつき|一月|hitotsuki|un mes|sustantivo|||b9|imagen
hitori|ひとり|一人|hitori|una persona|numero|||b9|imagen
hima|ひま|暇|hima|tiempo libre|adjetivo-na|||b9|imagen
hiragana|ひらがな|平仮名|hiragana|hiragana|sustantivo|||b9|imagen
hiru|ひる|昼|hiru|mediodía|sustantivo|||b9|imagen
hirugohan|ひるごはん|昼御飯|hirugohan|almuerzo|sustantivo|||b9|imagen
fuutou|ふうとう|封筒|fuutou|sobre|sustantivo|||b9|imagen
fuku|ふく|吹く|fuku|soplar|verbo-u|godan|ふき|b9|imagen
fuku-2|ふく|服|fuku|ropa|sustantivo|||b9|imagen
futatsu|ふたつ|二つ|futatsu|dos cosas|numero|||b9|imagen
futari|ふたり|二人|futari|dos personas|numero|||b9|imagen
futsuka|ふつか|二日|futsuka|día dos, dos días|sustantivo|||b9|imagen
futoi|ふとい|太い|futoi|grueso, gordo|adjetivo-i|||b9|imagen
furu|ふる|降る|furu|llover, nevar|verbo-u|godan|ふり|b9|imagen
furui|ふるい|古い|furui|viejo, antiguo|adjetivo-i|||b9|imagen
fun|～ふん|～分|fun|minutos|contador|||b9|afijo
bun|ぶん|文|bun|oración, frase|sustantivo|||b9|imagen
mannenhitsu|まんねんひつ|万年筆|mannenhitsu|pluma estilográfica|sustantivo|||b9|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
あそびます。|asobimasu.|Juego.|—
えらびます。|erabimasu.|Lo elijo.|—
あぶないです。|abunai desu.|Es peligroso.|—
とびます。|tobimasu.|Vuela.|—
ならびます。|narabimasu.|Me pongo en fila.|—
ひがしです。|higashi desu.|Es el este.|—
とうふです。|toufu desu.|Es tofu.|—
かぶります。|kaburimasu.|Me lo pongo en la cabeza.|—
とうふはおいしいです。|toufu wa oishii desu.|El tofu está delicioso.|は
```

### B10 · れも

**Kana nuevos:** れ も  
**Gramática:** の (posesión)  
**Vocabulario:** +43 · acumulado 517 (61.3 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
are|あれ||are|eso, aquello|pronombre|||b10|sistema
itsumo|いつも||itsumo|siempre|adverbio|||b10|escala
imouto|いもうと|妹|imouto|hermana menor|sustantivo|||b10|imagen
imoutosan|いもうとさん||imoutosan|hermana menor de otra persona|sustantivo|||b10|imagen
ireru|いれる|入れる|ireru|meter, poner dentro|verbo-ru|ichidan|いれ|b10|imagen
umareru|うまれる|生まれる|umareru|nacer|verbo-ru|ichidan|うまれ|b10|imagen
ureshii|うれしい||ureshii|feliz, contento|adjetivo-i|||b10|imagen
omoi|おもい|重い|omoi|pesado|adjetivo-i|||b10|imagen
kirei|きれい||kirei|bonito, limpio|adjetivo-na|||b10|imagen
kumori|くもり|曇り|kumori|tiempo nublado|sustantivo|||b10|imagen
kumoru|くもる|曇る|kumoru|nublarse|verbo-u|godan|くもり|b10|imagen
kodomo|こども|子供|kodomo|niño, niños|sustantivo|||b10|imagen
kore|これ||kore|esto|pronombre|||b10|sistema
shitsumon|しつもん|質問|shitsumon|pregunta|sustantivo|||b10|imagen
shitsurei-shimashita|しつれいしました||shitsurei shimashita|disculpe por la descortesía|saludo|||b10|situacion
shitsurei-shimasu|しつれいします||shitsurei shimasu|con permiso, disculpe|saludo|||b10|situacion
sore|それ||sore|eso|pronombre|||b10|sistema
sorekara|それから||sorekara|y después, después de eso|conjuncion|||b10|explicacion
soredewa|それでは||soredewa|entonces, en ese caso|expresion|||b10|explicacion
dare|だれ|誰|dare|quién|interrogativo|||b10|explicacion
dareka|だれか|誰か|dareka|alguien|pronombre|||b10|explicacion
tsukareru|つかれる|疲れる|tsukareru|cansarse|verbo-ru|ichidan|つかれ|b10|imagen
demo|でも||demo|pero, sin embargo|conjuncion|||b10|explicacion
totemo|とても||totemo|muy|adverbio|||b10|escala
tomodachi|ともだち|友達|tomodachi|amigo|sustantivo|||b10|imagen
doumo|どうも||doumo|gracias, mucho|expresion|||b10|explicacion
doumo-arigatou|どうもありがとう||doumo arigatou|muchas gracias|saludo|||b10|situacion
dore|どれ||dore|cuál de varios|interrogativo|||b10|sistema
hare|はれ|晴れ|hare|tiempo despejado|sustantivo|||b10|imagen
hareru|はれる|晴れる|hareru|despejarse, hacer sol|verbo-ru|ichidan|はれ|b10|imagen
mou|もう||mou|ya|adverbio|||b10|escala
mou-2|もう||mou|otra vez, más|adverbio|||b10|explicacion
moku|もく|木|moku|jueves (abreviatura)|sustantivo|||b10|imagen
moshimoshi|もしもし||moshimoshi|hola, al teléfono|saludo|||b10|situacion
motsu|もつ|持つ|motsu|tener, llevar, sostener|verbo-u|godan|もち|b10|imagen
morau|もらう||morau|recibir|verbo-u|godan|もらい|b10|imagen
mon|もん|門|mon|puerta, portón|sustantivo|||b10|imagen
mondai|もんだい|問題|mondai|problema, pregunta|sustantivo|||b10|imagen
mondairei|もんだいれい||mondairei|pregunta de ejemplo|sustantivo|||b10|imagen
rei|れい||rei|ejemplo|sustantivo|||b10|imagen
rei-2|れい|零|rei|cero|numero|||b10|imagen
reizouko|れいぞうこ|冷蔵庫|reizouko|frigorífico|sustantivo|||b10|imagen
wasureru|わすれる|忘れる|wasureru|olvidar|verbo-ru|ichidan|わすれ|b10|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
これです。|kore desu.|Es esto.|—
それです。|sore desu.|Es eso.|—
だれですか。|dare desu ka.|¿Quién es?|か
いもうとがいます。|imouto ga imasu.|Tengo una hermana menor.|が
きれいです。|kirei desu.|Es bonito.|—
こどもがいます。|kodomo ga imasu.|Hay niños.|が
うれしいです。|ureshii desu.|Estoy contento.|—
つかれます。|tsukaremasu.|Me canso.|—
これはなんですか。|kore wa nan desu ka.|¿Qué es esto?|は · か
それはだれですか。|sore wa dare desu ka.|¿Quién es ese?|は · か
```

### B11 · によ

**Kana nuevos:** に よ  
**Gramática:** に (existencia, destino)  
**Vocabulario:** +43 · acumulado 560 (66.4 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
ani|あに|兄|ani|hermano mayor|sustantivo|||b11|imagen
ichinichi|いちにち|一日|ichinichi|un día|sustantivo|||b11|imagen
oide-ni-naru|おいでになる||oide ni naru|venir, ir o estar (honorífico)|verbo-u|godan|おいでになり|b11|imagen
okuni|おくに|お国|okuni|país (forma cortés)|sustantivo|||b11|imagen
oniisan|おにいさん|お兄さん|oniisan|hermano mayor|sustantivo|||b11|imagen
onigiri|おにぎり||onigiri|bola de arroz|sustantivo|||b11|imagen
ohayou-gozaimasu|おはようございます||ohayou gozaimasu|buenos días|saludo|||b11|situacion
oyogu|およぐ|泳ぐ|oyogu|nadar|verbo-u|godan|およぎ|b11|imagen
kaitouyoushi|かいとうようし||kaitouyoushi|hoja de respuestas|sustantivo|||b11|imagen
kayoubi|かようび|火曜日|kayoubi|martes|sustantivo|||b11|imagen
kinyoubi|きんようび|金曜日|kinyoubi|viernes|sustantivo|||b11|imagen
kuni|くに|国|kuni|país|sustantivo|||b11|imagen
getsuyoubi|げつようび|月曜日|getsuyoubi|lunes|sustantivo|||b11|imagen
konnichiwa|こんにちは||konnichiwa|hola, buenas tardes|saludo|||b11|situacion
sayounara|さようなら||sayounara|adiós|saludo|||b11|situacion
suiyoubi|すいようび|水曜日|suiyoubi|miércoles|sustantivo|||b11|imagen
tsuyoi|つよい|強い|tsuyoi|fuerte|adjetivo-i|||b11|imagen
toriniku|とりにく|とり肉|toriniku|carne de pollo|sustantivo|||b11|imagen
doyoubi|どようび|土曜日|doyoubi|sábado|sustantivo|||b11|imagen
nanika|なにか|何か|nanika|algo|pronombre|||b11|explicacion
nannichi|なんにち|何日|nannichi|qué día del mes|interrogativo|||b11|explicacion
ni|に|二|ni|dos|numero|||b11|imagen
niku|にく|肉|niku|carne|sustantivo|||b11|imagen
nishi|にし|西|nishi|oeste|sustantivo|||b11|imagen
nichi|にち|日|nichi|domingo (abreviatura)|sustantivo|||b11|imagen
nichi-2|～にち|～日|nichi|día del mes, días|contador|||b11|afijo
nichiyoubi|にちようび|日曜日|nichiyoubi|domingo|sustantivo|||b11|imagen
nimotsu|にもつ|荷物|nimotsu|equipaje|sustantivo|||b11|imagen
niwa|にわ|庭|niwa|jardín|sustantivo|||b11|imagen
nin|～にん|～人|nin|personas|contador|||b11|afijo
butaniku|ぶたにく|豚肉|butaniku|carne de cerdo|sustantivo|||b11|imagen
mainichi|まいにち|毎日|mainichi|cada día|adverbio|||b11|explicacion
mokuyoubi|もくようび|木曜日|mokuyoubi|jueves|sustantivo|||b11|imagen
mondaiyoushi|もんだいようし||mondaiyoushi|hoja de preguntas|sustantivo|||b11|imagen
youka|ようか|八日|youka|día ocho, ocho días|sustantivo|||b11|imagen
youfuku|ようふく|洋服|youfuku|ropa occidental|sustantivo|||b11|imagen
yoku|よく||yoku|a menudo|adverbio|||b11|escala
yoku-2|よく||yoku|bien, hábilmente|adverbio|||b11|explicacion
yoko|よこ|横|yoko|lado, lateral|sustantivo|||b11|imagen
yobu|よぶ|呼ぶ|yobu|llamar, invitar|verbo-u|godan|よび|b11|imagen
yoru|よる|夜|yoru|noche|sustantivo|||b11|imagen
yowai|よわい|弱い|yowai|débil|adjetivo-i|||b11|imagen
sugu-ni|すぐ・に||sugu/ni|inmediatamente|adverbio|||b11|explicacion
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
およぎます。|oyogimasu.|Nado.|—
かようびです。|kayoubi desu.|Es martes.|—
つよいです。|tsuyoi desu.|Es fuerte.|—
なにかありますか。|nanika arimasu ka.|¿Hay algo?|か
おにぎりです。|onigiri desu.|Es una bola de arroz.|—
くにです。|kuni desu.|Es mi país.|—
にちようびです。|nichiyoubi desu.|Es domingo.|—
すぐにします。|sugu ni shimasu.|Lo hago enseguida.|に
```

### B12 · ろの

**Kana nuevos:** ろ の  
**Gramática:** —  
**Vocabulario:** +41 · acumulado 601 (71.2 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
ano|あの||ano|aquel, aquella|pronombre|||b12|sistema
ano-2|あの||ano|eh..., este...|expresion|||b12|interjeccion
anou|あのう||anou|disculpe..., este...|expresion|||b12|interjeccion
iro|いろ|色|iro|color|sustantivo|||b12|imagen
iroiro|いろいろ||iroiro|varios, diversos|adjetivo-na|||b12|imagen
ushiro|うしろ|後ろ|ushiro|detrás|sustantivo|||b12|imagen
otokonoko|おとこのこ|男の子|otokonoko|niño, chico|sustantivo|||b12|imagen
ofuro|おふろ|お風呂|ofuro|baño|sustantivo|||b12|imagen
omoshiroi|おもしろい||omoshiroi|interesante, divertido|adjetivo-i|||b12|imagen
onnanoko|おんなのこ|女の子|onnanoko|niña, chica|sustantivo|||b12|imagen
kaimono|かいもの|買い物|kaimono|compras|sustantivo|||b12|imagen
kiiro|きいろ|黄色|kiiro|amarillo|sustantivo|||b12|imagen
kiiroi|きいろい|黄色い|kiiroi|amarillo|adjetivo-i|||b12|imagen
kinou|きのう|昨日|kinou|ayer|sustantivo|||b12|imagen
kudamono|くだもの|果物|kudamono|fruta|sustantivo|||b12|imagen
kuro|くろ|黒|kuro|negro|sustantivo|||b12|imagen
kuroi|くろい|黒い|kuroi|negro|adjetivo-i|||b12|imagen
kuroku|くろく||kuroku|en negro|adverbio|||b12|explicacion
kokonoka|ここのか|九日|kokonoka|día nueve, nueve días|sustantivo|||b12|imagen
kokonotsu|ここのつ|九つ|kokonotsu|nueve cosas|numero|||b12|imagen
kono|この||kono|este, esta|pronombre|||b12|sistema
koro-goro|～ころ/～ごろ||koro/goro|aproximadamente, hacia|expresion|||b12|afijo
shiro|しろ|白|shiro|blanco|sustantivo|||b12|imagen
shiroi|しろい|白い|shiroi|blanco|adjetivo-i|||b12|imagen
sebiro|せびろ|背広|sebiro|traje|sustantivo|||b12|imagen
sono|その||sono|ese, esa|pronombre|||b12|sistema
tatemono|たてもの|建物|tatemono|edificio|sustantivo|||b12|imagen
tanoshii|たのしい|楽しい|tanoshii|divertido, agradable|adjetivo-i|||b12|imagen
daidokoro|だいどころ|台所|daidokoro|cocina|sustantivo|||b12|imagen
tokoro|ところ|所|tokoro|lugar|sustantivo|||b12|imagen
dono|どの||dono|qué, cuál|interrogativo|||b12|sistema
nanoka|なのか|七日|nanoka|día siete, siete días|sustantivo|||b12|imagen
nomimono|のみもの|飲み物|nomimono|bebida|sustantivo|||b12|imagen
noru|のる|乗る|noru|subir, montar en|verbo-u|godan|のり|b12|imagen
hiroi|ひろい|広い|hiroi|amplio, espacioso|adjetivo-i|||b12|imagen
furo|ふろ||furo|baño|sustantivo|||b12|imagen
mochiron|もちろん||mochiron|por supuesto|adverbio|||b12|explicacion
mono|もの|物|mono|cosa, objeto|sustantivo|||b12|imagen
yoroshiku|よろしく||yoroshiku|encantado; cuento contigo|saludo|||b12|situacion
rouka|ろうか|廊下|rouka|pasillo|sustantivo|||b12|imagen
roku|ろく|六|roku|seis|numero|||b12|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
いろがいいです。|iro ga ii desu.|El color está bien.|が
おもしろいです。|omoshiroi desu.|Es interesante.|—
きのうです。|kinou desu.|Fue ayer.|—
くろいです。|kuroi desu.|Es negro.|—
うしろにあります。|ushiro ni arimasu.|Está detrás.|に
おふろにはいります。|ofuro ni hairimasu.|Me meto en el baño.|に
くだものです。|kudamono desu.|Es fruta.|—
くだものはおいしいです。|kudamono wa oishii desu.|La fruta está deliciosa.|は
```

### B13 · やほ

**Kana nuevos:** や ほ  
**Dakuten que traen:** ぼ  
**Gramática:** **G5 ～ない (negativo llano)**  
**Vocabulario:** +31 · acumulado 632 (74.9 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
iya|いや|嫌|iya|desagradable, no|adjetivo-na|||b13|imagen
oboeru|おぼえる|覚える|oboeru|recordar, memorizar|verbo-ru|ichidan|おぼえ|b13|imagen
oyasuminasai|おやすみなさい||oyasuminasai|buenas noches|saludo|||b13|situacion
sushiya|すしや||sushiya|restaurante de sushi|sustantivo|||b13|imagen
natsuyasumi|なつやすみ|夏休み|natsuyasumi|vacaciones de verano|sustantivo|||b13|imagen
nigiyaka|にぎやか||nigiyaka|animado, concurrido|adjetivo-na|||b13|imagen
nihon|にほん|日本|nihon|Japón|sustantivo|||b13|imagen
nihongo|にほんご|日本語|nihongo|japonés (idioma)|sustantivo|||b13|imagen
noboru|のぼる|登る|noboru|subir, escalar|verbo-u|godan|のぼり|b13|imagen
hayai|はやい|速い|hayai|rápido|adjetivo-i|||b13|imagen
hayai-2|はやい|早い|hayai|temprano|adjetivo-i|||b13|imagen
hou|ほう||hou|manera, dirección|sustantivo|||b13|imagen
hoka|ほか|外|hoka|otro, demás|sustantivo|||b13|imagen
hoshii|ほしい|欲しい|hoshii|querer, desear|adjetivo-i|||b13|imagen
hosoi|ほそい|細い|hosoi|fino, delgado|adjetivo-i|||b13|imagen
hon|ほん|本|hon|libro|sustantivo|||b13|imagen
hon-2|～ほん|～本|hon|objetos largos y cilíndricos|contador|||b13|afijo
hondana|ほんだな|本棚|hondana|estantería para libros|sustantivo|||b13|imagen
hontou|ほんとう||hontou|realmente, de verdad|adverbio|||b13|explicacion
honya|ほんや||honya|librería|sustantivo|||b13|imagen
boushi|ぼうし|帽子|boushi|sombrero, gorra|sustantivo|||b13|imagen
boku|ぼく||boku|yo (masculino informal)|pronombre|||b13|explicacion
ya|～や|屋|ya|tienda de, comerciante de|sustantivo|||b13|afijo
yaoya|やおや|八百屋|yaoya|verdulería, frutería|sustantivo|||b13|imagen
yasai|やさい|野菜|yasai|verdura|sustantivo|||b13|imagen
yasashii|やさしい|易しい|yasashii|fácil, sencillo|adjetivo-i|||b13|imagen
yajirushi|やじるし||yajirushi|flecha|sustantivo|||b13|imagen
yasui|やすい|安い|yasui|barato|adjetivo-i|||b13|imagen
yasumi|やすみ|休み|yasumi|descanso, vacaciones|sustantivo|||b13|imagen
yama|やま|山|yama|montaña|sustantivo|||b13|imagen
yaru|やる||yaru|hacer|verbo-u|godan|やり|b13|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
ほしいです。|hoshii desu.|Lo quiero.|—
はやいです。|hayai desu.|Es rápido.|—
のぼります。|noborimasu.|Subo.|—
なつやすみです。|natsuyasumi desu.|Son las vacaciones de verano.|—
おぼえます。|oboemasu.|Lo memorizo.|—
ほんです。|hon desu.|Es un libro.|—
ほんやにいきます。|honya ni ikimasu.|Voy a la librería.|に
```

### B14 · めむ

**Kana nuevos:** め む  
**Gramática:** —  
**Vocabulario:** +24 · acumulado 656 (77.7 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
ame|あめ|雨|ame|lluvia|sustantivo|||b14|imagen
ame-2|あめ|飴|ame|caramelo|sustantivo|||b14|imagen
gomen-kudasai|ごめんください||gomen kudasai|hola, se puede|saludo|||b14|situacion
gomennasai|ごめんなさい||gomennasai|lo siento, perdón|saludo|||b14|situacion
samui|さむい|寒い|samui|frío|adjetivo-i|||b14|imagen
shimeru|しめる|閉める|shimeru|cerrar|verbo-ru|ichidan|しめ|b14|imagen
shimeru-2|しめる|締める|shimeru|atar, apretar|verbo-ru|ichidan|しめ|b14|imagen
sumu|すむ|住む|sumu|vivir, residir|verbo-u|godan|すみ|b14|imagen
tanomu|たのむ|頼む|tanomu|pedir, solicitar|verbo-u|godan|たのみ|b14|imagen
tsutomeru|つとめる|勤める|tsutomeru|trabajar para, servir|verbo-ru|ichidan|つとめ|b14|imagen
tsumetai|つめたい|冷たい|tsumetai|frío al tacto|adjetivo-i|||b14|imagen
nomu|のむ|飲む|nomu|beber|verbo-u|godan|のみ|b14|imagen
hajime|はじめ|初め/始め|hajime|principio, comienzo|sustantivo|||b14|imagen
hajimete|はじめて|初めて|hajimete|por primera vez|adverbio|||b14|explicacion
hajime-ni|はじめに||hajime ni|al principio, primero|adverbio|||b14|explicacion
hajimemashite|はじめまして||hajimemashite|encantado de conocerle|saludo|||b14|situacion
muika|むいか|六日|muika|día seis, seis días|sustantivo|||b14|imagen
mukou|むこう|向こう|mukou|allí enfrente, al otro lado|sustantivo|||b14|imagen
muzukashii|むずかしい|難しい|muzukashii|difícil|adjetivo-i|||b14|imagen
mura|むら|村|mura|pueblo, aldea|sustantivo|||b14|imagen
me|め|目|me|ojo|sustantivo|||b14|imagen
megane|めがね|眼鏡|megane|gafas|sustantivo|||b14|imagen
yasumu|やすむ|休む|yasumu|descansar, faltar|verbo-u|godan|やすみ|b14|imagen
yomu|よむ|読む|yomu|leer|verbo-u|godan|よみ|b14|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
のみます。|nomimasu.|Bebo.|—
さむいです。|samui desu.|Hace frío.|—
つめたいです。|tsumetai desu.|Está frío al tacto.|—
むずかしいです。|muzukashii desu.|Es difícil.|—
たのみます。|tanomimasu.|Lo pido.|—
はじめまして。|hajimemashite.|Encantado de conocerte.|—
めがねです。|megane desu.|Son unas gafas.|—
```

### B15 · へゆ

**Kana nuevos:** へ ゆ  
**Dakuten que traen:** べ  
**Gramática:** へ (dirección)  
**Vocabulario:** +16 · acumulado 672 (79.6 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
obentou|おべんとう|お弁当|obentou|comida preparada|sustantivo|||b15|imagen
taihen|たいへん||taihen|muy, mucho|adverbio|||b15|escala
taihen-2|たいへん||taihen|difícil, duro|adjetivo-na|||b15|explicacion
tabemono|たべもの|食べ物|tabemono|comida, alimento|sustantivo|||b15|imagen
taberu|たべる|食べる|taberu|comer|verbo-ru|ichidan|たべ|b15|imagen
naraberu|ならべる|並べる|naraberu|poner en fila, ordenar|verbo-ru|ichidan|ならべ|b15|imagen
fuyu|ふゆ|冬|fuyu|invierno|sustantivo|||b15|imagen
heta|へた|下手|heta|poco hábil, malo en|adjetivo-na|||b15|imagen
heya|へや|部屋|heya|habitación|sustantivo|||b15|imagen
hen|へん|辺|hen|zona, alrededores|sustantivo|||b15|imagen
benri|べんり|便利|benri|conveniente, práctico|adjetivo-na|||b15|imagen
yuugata|ゆうがた|夕方|yuugata|atardecer, tarde|sustantivo|||b15|imagen
yuuhan|ゆうはん|夕飯|yuuhan|cena|sustantivo|||b15|imagen
yuube|ゆうべ|昨夜|yuube|anoche|sustantivo|||b15|imagen
yuumei|ゆうめい|有名|yuumei|famoso|adjetivo-na|||b15|imagen
yuki|ゆき|雪|yuki|nieve|sustantivo|||b15|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
たべます。|tabemasu.|Como.|—
へやにいます。|heya ni imasu.|Estoy en la habitación.|に
べんりです。|benri desu.|Es práctico.|—
ゆきがふります。|yuki ga furimasu.|Nieva.|が
ゆうめいです。|yuumei desu.|Es famoso.|—
たいへんです。|taihen desu.|Es difícil.|—
へやへいきます。|heya e ikimasu.|Voy a la habitación.|へ
うちへかえります。|uchi e kaerimasu.|Vuelvo a casa.|へ
みせへいきます。|mise e ikimasu.|Voy a la tienda.|へ
にほんへいきます。|nihon e ikimasu.|Voy a Japón.|へ
```

### B16 · ぬを

**Kana nuevos:** ぬ を  
**Gramática:** **G6 を (objeto directo)**  
**Vocabulario:** +5 · acumulado 677 (80.2 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
inu|いぬ|犬|inu|perro|sustantivo|||b16|imagen
shinu|しぬ|死ぬ|shinu|morir|verbo-u|godan|しに|b16|imagen
nugu|ぬぐ|脱ぐ|nugu|quitarse ropa|verbo-u|godan|ぬぎ|b16|imagen
nuru|ぬる||nuru|pintar, untar|verbo-u|godan|ぬり|b16|imagen
nurui|ぬるい|温い|nurui|tibio, templado|adjetivo-i|||b16|imagen
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
いぬがいます。|inu ga imasu.|Hay un perro.|が
ぬぎます。|nugimasu.|Me lo quito.|—
ぬります。|nurimasu.|Lo pinto.|—
ほんをよみます。|hon o yomimasu.|Leo un libro.|を
みずをのみます。|mizu o nomimasu.|Bebo agua.|を
```

### B17 · っぱぴぷぺぽ

**Kana nuevos:** っ ぱ ぴ ぷ ぺ ぽ  
**Gramática:** El handakuten ° (っ + ぱぴぷぺぽ)  
**Vocabulario:** +28 · acumulado 705 (83.5 % del N5)

> **ぺ no tiene ninguna palabra en las 766, y es correcto.** No hay ninguna en el
> N5 escrita en hiragana que lo lleve, así que no se puede enseñar con vocabulario
> sin inventar una palabra fuera del examen. Se aprende por completitud del
> silabario, y su ejemplo real llega en la Fase 2 con ページ y ペン, que sí son N5
> en katakana.
>
> **ぱ, ぴ y ぷ tienen una sola palabra cada uno** —りっぱ, えんぴつ, きっぷ—, así que
> su ejercicio final se apoya en las frases del bloque en vez de en una segunda
> palabra.

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
asatte|あさって||asatte|pasado mañana|sustantivo|||b17|imagen
acchi|あっち||acchi|allí, aquel lado|pronombre|||b17|sistema
ittekimasu|いってきます||ittekimasu|me voy, hasta luego|saludo|||b17|situacion
e-3|えっ||e|eh, qué|expresion|||b17|interjeccion
enpitsu|えんぴつ|鉛筆|enpitsu|lápiz|sustantivo|||b17|imagen
gakkou|がっこう|学校|gakkou|escuela|sustantivo|||b17|imagen
kissaten|きっさてん|喫茶店|kissaten|cafetería|sustantivo|||b17|imagen
kitte|きって|切手|kitte|sello postal|sustantivo|||b17|imagen
kippu|きっぷ|切符|kippu|billete, entrada|sustantivo|||b17|imagen
kekkou|けっこう|結構|kekkou|bien, suficiente|adjetivo-na|||b17|imagen
kekkon-suru|けっこん（する）|結婚|kekkon suru|casarse, matrimonio|verbo-irregular|irregular|けっこんし|b17|imagen
kocchi|こっち||kocchi|aquí, este lado|pronombre|||b17|sistema
sanpo-suru|さんぽ（する）|散歩|sanpo suru|pasear, paseo|verbo-irregular|irregular|さんぽし|b17|imagen
zasshi|ざっし|雑誌|zasshi|revista|sustantivo|||b17|imagen
sekken|せっけん|石鹸|sekken|jabón|sustantivo|||b17|imagen
socchi|そっち||socchi|ahí, ese lado|pronombre|||b17|sistema
docchi|どっち||docchi|cuál, qué dirección|interrogativo|||b17|sistema
massugu|まっすぐ||massugu|recto, directamente|adverbio|||b17|explicacion
mikka|みっか|三日|mikka|día tres, tres días|sustantivo|||b17|imagen
mittsu|みっつ|三つ|mittsu|tres cosas|numero|||b17|imagen
muttsu|むっつ|六つ|muttsu|seis cosas|numero|||b17|imagen
motte-iku|もっていく||motte iku|llevar algo|verbo-u|godan|もっていき|b17|imagen
motto|もっと||motto|más|adverbio|||b17|escala
yattsu|やっつ|八つ|yattsu|ocho cosas|numero|||b17|imagen
yokka|よっか|四日|yokka|día cuatro, cuatro días|sustantivo|||b17|imagen
yottsu|よっつ|四つ|yottsu|cuatro cosas|numero|||b17|imagen
rippa|りっぱ||rippa|espléndido, excelente|adjetivo-na|||b17|imagen
yukkuri-to|ゆっくり・と||yukkuri to|despacio, tranquilamente|adverbio|||b17|explicacion
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
きっぷをかいます。|kippu o kaimasu.|Compro un billete.|を
えんぴつです。|enpitsu desu.|Es un lápiz.|—
さんぽします。|sanpo shimasu.|Doy un paseo.|—
りっぱです。|rippa desu.|Es espléndido.|—
ゆっくりとあるきます。|yukkuri to arukimasu.|Camino despacio.|と
```

### B18 · ーゃゅょ

**Kana nuevos:** ー ゃ ゅ ょ  
**Gramática:** **G7 ～ましょう** · yōon · ー  
**Vocabulario:** +61 · acumulado 766 (90.8 % del N5)

```csv
id|kana|kanji|romaji|espanol|tipo|grupo_verbal|raiz_masu|bloque|modo
isha|いしゃ|医者|isha|médico|sustantivo|||b18|imagen
issho|いっしょ|一緒|issho|juntos|adverbio|||b18|explicacion
irasshaimase|いらっしゃいませ||irasshaimase|bienvenido, qué desea|saludo|||b18|situacion
ocha|おちゃ|お茶|ocha|té|sustantivo|||b18|imagen
kaisha|かいしゃ|会社|kaisha|empresa|sustantivo|||b18|imagen
kyuu|きゅう|九|kyuu|nueve|numero|||b18|imagen
kyou|きょう|今日|kyou|hoy|sustantivo|||b18|imagen
kyoushitsu|きょうしつ|教室|kyoushitsu|aula|sustantivo|||b18|imagen
kyoudai|きょうだい|兄弟|kyoudai|hermanos, hermanos y hermanas|sustantivo|||b18|imagen
kyouto|きょうと||kyouto|Kioto|sustantivo|||b18|imagen
kyonen|きょねん|去年|kyonen|año pasado|sustantivo|||b18|imagen
gyuuniku|ぎゅうにく|牛肉|gyuuniku|carne de vacuno|sustantivo|||b18|imagen
gyuunyuu|ぎゅうにゅう|牛乳|gyuunyuu|leche|sustantivo|||b18|imagen
koucha|こうちゃ|紅茶|koucha|té negro|sustantivo|||b18|imagen
konshuu|こんしゅう|今週|konshuu|esta semana|sustantivo|||b18|imagen
goshujin|ごしゅじん||goshujin|marido de otra persona|sustantivo|||b18|imagen
shashin|しゃしん|写真|shashin|fotografía|sustantivo|||b18|imagen
shuu|しゅう|週|shuu|semana|sustantivo|||b18|imagen
shuukan|～しゅうかん|～週間|shuukan|semanas|contador|||b18|afijo
shukudai|しゅくだい|宿題|shukudai|deberes|sustantivo|||b18|imagen
shouyu|しょうゆ||shouyu|salsa de soja|sustantivo|||b18|imagen
shokudou|しょくどう|食堂|shokudou|comedor, cafetería|sustantivo|||b18|imagen
jisho|じしょ|辞書|jisho|diccionario|sustantivo|||b18|imagen
jitensha|じてんしゃ|自転車|jitensha|bicicleta|sustantivo|||b18|imagen
jidousha|じどうしゃ|自動車|jidousha|automóvil|sustantivo|||b18|imagen
ja-jaa|じゃ/じゃあ||ja/jaa|bueno, entonces|conjuncion|||b18|explicacion
juu|じゅう|十|juu|diez|numero|||b18|imagen
juu-2|～じゅう|～中|juu|durante, a lo largo de|expresion|||b18|afijo
jugyou|じゅぎょう|授業|jugyou|clase, lección|sustantivo|||b18|imagen
jouzu|じょうず|上手|jouzu|hábil, bueno en|adjetivo-na|||b18|imagen
jouzu-ni|じょうずに|上手に|jouzu ni|bien, hábilmente|adverbio|||b18|explicacion
joubu|じょうぶ|丈夫|joubu|fuerte, resistente|adjetivo-na|||b18|imagen
senshuu|せんしゅう|先週|senshuu|semana pasada|sustantivo|||b18|imagen
sou-shimashou|そうしましょう||sou shimashou|hagámoslo así|expresion|||b18|explicacion
tanjoubi|たんじょうび|誕生日|tanjoubi|cumpleaños|sustantivo|||b18|imagen
daijoubu|だいじょうぶ|大丈夫|daijoubu|bien, seguro, sin problema|adjetivo-na|||b18|imagen
chairo|ちゃいろ|茶色|chairo|marrón|sustantivo|||b18|imagen
chawan|ちゃわん||chawan|cuenco para arroz|sustantivo|||b18|imagen
chuu|～ちゅう|～中|chuu|durante, en medio de|expresion|||b18|afijo
choudo|ちょうど||choudo|exactamente, justo|adverbio|||b18|explicacion
chotto|ちょっと||chotto|un poco|adverbio|||b18|escala
densha|でんしゃ|電車|densha|tren eléctrico|sustantivo|||b18|imagen
toukyou|とうきょう||toukyou|Tokio|sustantivo|||b18|imagen
toshokan|としょかん|図書館|toshokan|biblioteca|sustantivo|||b18|imagen
hyaku|ひゃく|百|hyaku|cien|numero|||b18|imagen
byouin|びょういん|病院|byouin|hospital|sustantivo|||b18|imagen
byouki|びょうき|病気|byouki|enfermedad|sustantivo|||b18|imagen
bunshou|ぶんしょう|文章|bunshou|frase, texto|sustantivo|||b18|imagen
benkyou-suru|べんきょう（する）|勉強|benkyou suru|estudiar, estudio|verbo-irregular|irregular|べんきょうし|b18|imagen
maishuu|まいしゅう|毎週|maishuu|cada semana|adverbio|||b18|explicacion
yuubinkyoku|ゆうびんきょく|郵便局|yuubinkyoku|oficina de correos|sustantivo|||b18|imagen
raishuu|らいしゅう|来週|raishuu|semana próxima|sustantivo|||b18|imagen
ryuugakusei|りゅうがくせい|留学生|ryuugakusei|estudiante extranjero|sustantivo|||b18|imagen
ryoushin|りょうしん|両親|ryoushin|padres|sustantivo|||b18|imagen
ryouri|りょうり|料理|ryouri|cocina, comida preparada|sustantivo|||b18|imagen
ryokou|りょこう|旅行|ryokou|viaje|sustantivo|||b18|imagen
ryokougaisha|りょこうがいしゃ||ryokougaisha|agencia de viajes|sustantivo|||b18|imagen
ryokou-suru|りょこうする||ryokou suru|viajar|verbo-irregular|irregular|りょこうし|b18|imagen
renshuu-suru|れんしゅう（する）|練習|renshuu suru|practicar, práctica|verbo-irregular|irregular|れんしゅうし|b18|imagen
uun|うーん||uun|mmm, veamos|expresion|||b18|interjeccion
ee-2|えー||ee|mmm, veamos|expresion|||b18|interjeccion
```

**Frases objetivo**

```csv
frase|romaji|espanol|particula
きょうです。|kyou desu.|Es hoy.|—
でんしゃにのります。|densha ni norimasu.|Subo al tren.|に
びょういんにいきます。|byouin ni ikimasu.|Voy al hospital.|に
がっこうにいきます。|gakkou ni ikimasu.|Voy a la escuela.|に
しゃしんをとります。|shashin o torimasu.|Hago una foto.|を
じょうずです。|jouzu desu.|Se le da bien.|—
うーん、どうしましょう。|uun, dou shimashou.|Mmm, ¿qué hacemos?|—
えー、ほんとうですか。|ee, hontou desu ka.|Eh, ¿de verdad?|か
```
---

## 5. Tabla de control

| # | Kana | Dakuten | Nuevas | Acum. | % N5 |
|---|---|---|---|---|---|
| B1 | あ い う え お は | — | 20 | 20 | 2.4 % |
| B2 | ま す て せ ん | で ぜ ず ば | 24 | 44 | 5.2 % |
| B3 | り し る か | じ が | 60 | 104 | 12.3 % |
| B4 | こ な さ わ | ご ざ | 67 | 171 | 20.3 % |
| B5 | た み そ ね | だ ぞ | 67 | 238 | 28.2 % |
| B6 | く き ら | ぐ ぎ | 72 | 310 | 36.7 % |
| B7 | と ち | ど ぢ | 68 | 378 | 44.8 % |
| B8 | つ け | づ げ | 50 | 428 | 50.7 % |
| B9 | ふ ひ | ぶ び | 46 | 474 | 56.2 % |
| B10 | れ も | — | 43 | 517 | 61.3 % |
| B11 | に よ | — | 43 | 560 | 66.4 % |
| B12 | ろ の | — | 41 | 601 | 71.2 % |
| B13 | や ほ | ぼ | 31 | 632 | 74.9 % |
| B14 | め む | — | 24 | 656 | 77.7 % |
| B15 | へ ゆ | べ | 16 | 672 | 79.6 % |
| B16 | ぬ を | — | 5 | 677 | 80.2 % |
| B17 | っ ぱ ぴ ぷ ぺ ぽ | — | 28 | 705 | 83.5 % |
| B18 | ー ゃ ゅ ょ | — | 61 | 766 | 90.8 % |
Esta tabla se genera desde el CSV: **las cifras cuadran fila a fila**.
La curva es **deliberadamente irregular**: el pico de B3–B7 es estructural —
con 25 kana conocidos, cada carácter nuevo abre muchísimas combinaciones.

**B16 solo trae 5 palabras** y es correcto: を no aparece nunca dentro de una
palabra, solo como partícula. Su bloque existe para enseñarla.

---

## 6. Checklist de implementación

**Antes del volcado — bloqueante:**

- [ ] **Media cruzada.** Renombrar rutas junto con los ids: `e`→`e-2`,
      `ie`→`ie-2`, `ii`→`ii-yoi`. Intercambiar `hashi` ↔ `hashi-2`.
      Corregir `rei` ↔ `rei-2` y `do` ↔ `do-2` como dato.
      Si el volcado corre antes, queda「no」ilustrado con una casa y los
      palillos con un puente.
- [ ] **Sellos e insignias de b2 en adelante** (solo pasillo hiragana): borrar
      desde el SQL Editor. `seals` no tiene política de delete y `badges` las
      escribe un trigger. B1 no se toca.

**Esquema:**

- [ ] `words`: añadir `tipo`, `grupo_verbal`, `raiz_masu`, `kanji`
- [ ] **No sustituir `units`**
- [ ] Crear `conjugations` (11 filas), `aplica_a` como `text[]`
- [ ] Crear tabla de lecturas **independiente de `kana`** (9 pares + 11 sufijos)
- [ ] `lessons`: columna `tipo`, `kana_id` nullable
- [ ] `bloque_min` contra la posición en BLOCK_CHAIN, nunca texto ni
      `blocks.position` del pasillo
- [ ] Ampliar `volume()` y `contract.ts` con los campos nuevos
- [ ] Tabla nueva con RLS activada y sin políticas, como el resto del temario

**Interfaz — el salto de 13 a 18 tomos:**

- [ ] `shelfGrid.ts`: `volumesPerBay` 2 → **3** (24 huecos), remedir el aire
- [ ] `volumeArt.ts`: faltan 6 juegos de tapas. Hasta que existan, los tomos
      13–18 usan **variantes de color** de los 12, no el 12 repetido
- [ ] `CheatSheetList.scss`: rejilla 4×3 = 12 celdas, se desborda con 18
- [ ] `deskArt.ts`: tamaño de hoja calculado para doce
- [ ] `VolumeIntro.tsx`: el texto dice «doce tomos»
- [ ] `ShelfVolume.scss`: apilado en z razonado con doce
- [ ] `plan.ts`: `HIRAGANA_BASE_COUNT` 46 → **56** · `N5_WORD_COUNT` 800 → **846**
- [ ] `BLOCK_PLAN_KANA`: reescribir; decidir cómo muestra los 20 dakuten inline

**Contenido:**

- [ ] Separar `iru` (居る, ichidan) de `iru-2` (要る, godan)
- [ ] Lecciones `gramatica` G0–G7. **G0 es recurrente**: reaparece en cada
      bloque con dakuten nuevos, con el ejemplo de ese bloque
- [ ] **Bloquear el render de `kanji` en toda la Fase 1**
- [ ] B1 intacto: conserva sus 13 palabras y su media, suma hasta 20
- [ ] Marcar あう, いう, おす como «diccionario hasta B2/B3»