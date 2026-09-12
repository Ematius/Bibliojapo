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

**Fase actual:** cerrando el primer tomo. El recorrido está entero —landing,
zaguán, vestíbulo, pasillo y estantería— y el tomo del bloque 1 se lee de principio
a fin: sus seis lecciones completas, cada una con sus ejercicios, su repaso y su
examen, y el examen final que pone el sello. Solo queda revisar a ojo que cada kana
caiga sobre su ilustración. Lo siguiente es el encuadre de la estantería. Ver
«Cómo se arma un tomo».
En paralelo, el **front** de la progresión y las cuentas está hecho contra un
servidor simulado: los doce tomos en la balda, el sello que da la insignia, la
cuenta que la guarda. Ver «La capa `api/`».
**Stack:** React + Vite + SCSS + GSAP (sin CSS-in-JS, sin Tailwind).
**Despliegue:** Vercel (equipo: ematius' projects).
**Backend:** Supabase, decidido el 12-09-2026. El front se termina entero contra
`src/api/mockServer.ts` y después se sustituye por Supabase sin tocar un
componente. Ver «Supabase — las reglas que no se negocian» y la fase 3.

---

## Hacia dónde va el proyecto

El orden importa y **no se adelantan fases**: cada una depende de decisiones que
todavía no están tomadas en la anterior.

1. **Terminar el tomo 1.** Hecho el contenido (11-09-2026): los seis kana tienen
   su ficha entera y todas sus palabras, su audio y su dibujo. Queda una revisión:
   comprobar que cada kana cae sobre su ilustración con la regla única —centrado,
   al 60 % del dibujo—; si alguno no cuadra, se corrige la ilustración, no el
   código.
2. **El encuadre de la estantería.** La colocación ya está resuelta: los tomos se
   posan solos sobre la rejilla de `shelfGrid.ts` — ver «Cómo se arma un tomo».
   Lo que queda es el encuadre: el stage encuadra hoy la ILUSTRACIÓN, y en
   pantallas estrechas el recorte se come el mueble entero. Hay que encuadrar por
   la estantería, de modo que siempre quepa y la ilustración haga de relleno. Va
   ANTES que el responsive porque es la pieza que lo vuelve abordable: ningún
   ajuste de tomos arregla un mueble que se sale de la pantalla. El encuadre se
   escribe aquí, pero **no se da por cerrado hasta la fase 4**: hasta que no se
   prueba en anchos de verdad, no se sabe si el mueble cabe.
3. **Mi biblioteca, y con ella la cuenta de verdad.** Van juntas porque son la
   misma cosa por sus dos caras: Mi biblioteca es lo que se ENSEÑA de una cuenta
   —los tomos cerrados, su chuleta y los juegos que abren—, y sin nada que enseñar
   una cuenta es un formulario que no lleva a ningún sitio.

   **Dentro de la fase, la sala va PRIMERO**, contra el servidor simulado. No
   espera a Supabase por el criterio de siempre —lo que se puede ver y probar sin
   servidor de verdad va antes—: la cuenta simulada ya existe y ya da insignias,
   así que la sala se diseña mirándola. Y al revés sería peor, porque es esta
   pantalla la que decide QUÉ hay que guardar —cuándo se cerró cada tomo, las
   marcas de los juegos—, y montar el esquema antes obligaría a reabrir la base de
   datos en cuanto la sala pidiera un dato más. Es el mismo error que ya se evitó
   una vez adelantando el front de las cuentas al backend.

   **La sala son tres piezas, en este orden:** el mueble —la estantería personal,
   con hueco marcado para lo que falta, que se lee como «todavía no» y nunca como
   vacío—, la chuleta de cada tomo cerrado, y el primer minijuego. Vive en
   `src/collection/`, y hoy existe ya la pantalla con sus datos: lo que falta es
   el sitio. El diseño de la sala —qué se ve y en qué orden— se decide al empezar
   la fase; aquí solo están las reglas que no dependen de esa decisión:

   - **La chuleta se genera del bloque, nunca se escribe a mano.** Es hermana de
     `buildVolumePages`: un tomo nuevo trae su chuleta sin que nadie la redacte.
   - **La chuleta sale del paquete de `fetchVolume`, no de `content/`.** Si leyera
     el temario por su cuenta, el tomo 2 —que es de pago— tendría que viajar en el
     bundle. Ver «El contenido de pago no puede vivir en `content/`».
   - **Un minijuego no enseña nada nuevo:** juega solo con kana ya estudiados, la
     misma regla que los distractores de `parts/pickCards.ts`. Descartar tiene que
     ser reconocer, nunca adivinar.
   - **Un minijuego no da acceso.** Ni sellos ni insignias: deja marcas personales
     y nada más. Si un juego abriera el tomo siguiente, el catálogo se regala.
   - **Repasar no vuelve a sellar.** Lo ganado está ganado: reabrir un tomo cerrado
     no quita ni añade insignias.

   **Y con ella, Supabase de verdad, en el plan gratuito.** El FRONT de la
   progresión y las cuentas se adelantó a propósito (11-09-2026) y ya está, contra
   el servidor simulado —ver «La capa `api/`»—: hacer el backend antes que las
   cuentas habría obligado a reabrir la base de datos al llegar a ellas. Los
   ejercicios ya avisan al acertar (`parts/solved.ts`), y de ese aviso sale el
   sello que da la insignia.
   Queda enchufarlo: el esquema, las políticas de RLS, el login con Google, y
   reescribir por dentro `account.ts`, `progress.ts` y `volumes.ts`. **Cuesta 0 €**
   —el plan gratuito cubre esto de sobra— y por eso no espera al final.

   **La cuenta ya está hecha y aquí no se rehace.** El formulario con sus dos vías,
   el panel, el carné y los errores con nombre están escritos contra el simulado, en
   `src/account/`. El criterio de qué se adelantó y qué no es siempre el mismo: **lo
   que se puede ver y probar sin servidor de verdad va antes** —así la pantalla se
   diseña mirándola, no imaginándola—, y lo que llega desde FUERA de la app nace en
   esta fase, porque no hay nada que simular. Nacen aquí cuatro cosas, y las cuatro
   son rutas a las que se entra desde fuera: la ida y vuelta real a Google, el correo
   de confirmación, «he olvidado mi contraseña» y borrar la cuenta.

   **Las dos vías de entrada se quedan** —correo y Google—, y traen una decisión que
   hay que tomar a conciencia, no por omisión: quien creó su cuenta con un correo y
   una contraseña y meses después pulsa «Continuar con Google» con ESE MISMO correo,
   o acaba con dos cuentas separadas o con una sola con dos formas de entrar. Si son
   dos, entra y ve sus insignias desaparecidas: para esa persona, la app le ha
   perdido el progreso. Es un ajuste de Supabase, no código nuestro. Y dentro de la
   fase, **Google primero**: valida el flujo entero sin plantillas de correo de por
   medio.
4. **Responsive.** Va DESPUÉS de Mi biblioteca, no antes: es la última pantalla
   grande que falta, y ajustar anchos mientras aún no existe obliga a hacer el
   trabajo dos veces —una ahora y otra el día que la sala no quepa—. Aquí se cierra
   también el encuadre de la fase 2, que no se puede dar por bueno sin probarlo.
5. **El contenido de pago servido, y con él el tomo 2.** Bucket privado y URLs
   firmadas de vida corta. Va pegado a la fase 3 —la de Supabase— porque el tomo 2
   es el primero que hay que proteger: escrito «como el tomo 1» habría que
   escribirlo dos veces. Ver «El contenido de pago no puede vivir en `content/`».
6. **Salir a la red** con el temario a medias, primero para amigos y conocidos, y
   completar el contenido mientras ya se usa. **Todavía gratis y sin pasarela**:
   Supabase Free y Vercel Hobby valen mientras no se cobre, y aquí es donde se
   rompen las cosas de verdad — mejor romperlas antes de que haya dinero de por
   medio.
7. **Pagos, y con ellos el gasto.** Stripe, el webhook verificado por firma, y el
   estado de la suscripción como dato del servidor que alimenta `VolumeGate`. Es lo
   ÚNICO que obliga a pagar Vercel Pro —Hobby prohíbe el uso comercial— y Supabase
   Pro, y lo único que arrastra papeleo fiscal: vender a particulares de la UE
   obliga a declarar el IVA del país del comprador. Por eso va al final, solo.

**La frontera está entre la 6 y la 7.** Todo lo anterior cuesta 0 €; el día que se
activa Stripe empiezan unos 41 €/mes fijos, que a 3,50 €/mes cubren unos 15
suscriptores. Aplazar el GASTO es correcto; aplazar la INTEGRACIÓN no, porque las
políticas de RLS y las URLs firmadas cambian cómo se piden los datos, y descubrirlo
al final obliga a reabrir pantallas ya cerradas.

### El modelo

- El **tomo 1 es gratis y se hace sin cuenta**, entero.
- Al terminarlo se da una **recompensa** —sin diseñar todavía— y con ella se
  consiguen los tomos siguientes. **Ahí se exige cuenta**, y del tomo 2 en
  adelante el contenido es de pago.
- El **progreso va por cuenta**, no por dispositivo.

De ahí salen tres reglas que afectan al código desde ya:

**El contenido de pago no puede vivir en `content/`.** Todo lo que está ahí viaja
dentro del bundle y se lee desde las herramientas del navegador. El bloque 1 puede
quedarse donde está —es el gratuito y da igual que se lea—, pero del 2 en adelante
habrá que servirlo. Al escribir el bloque 2, tenerlo presente en vez de meterlo sin
pensar junto al 1. Juega a favor que el temario solo lo lee el servidor simulado
(`api/mockServer.ts`): el lector recibe el tomo ya empaquetado por `fetchVolume`,
así que del bloque 2 en adelante basta con que ese paquete llegue del servidor de
verdad. Los demás importan únicamente tipos —y la estantería, la lista de ids de
`BLOCK_PLAN`, que no es contenido—.

**El progreso del tomo 1 se hará SIN cuenta y tiene que sobrevivir al registro.**
Guardarlo en local no es un apaño provisional: es la pieza que la cuenta absorbe al
crearse. Y si alguien abandona el registro, no puede perder lo que ya hizo — la
cuenta desbloquea lo siguiente, nunca da acceso a lo ya hecho.

**Se lanza con el contenido a medias, a propósito.** Un tomo incompleto no es un
estado de desarrollo que no vaya a ver nadie: lo va a ver gente de verdad. Por eso
una lección solo entra en el libro cuando está entera —ver «Cómo se arma un tomo»—
y por eso lo que falta tiene que leerse siempre como «todavía no», nunca como roto.

### La capa `api/` — el servidor, simulado

Todo lo que un día hablará con el backend vive en `src/api/`, y **es lo único que
cambia el día que llegue**. Las pantallas no saben si detrás hay un servidor
simulado o Supabase.

```text
api/
  contract.ts      la forma de lo que va y viene: Account, VolumeContent, FINAL_SEAL…
  apiError.ts      los fallos con nombre: sin conexión, sin cuenta, correo cogido…
  apiChanges.ts    el aviso de que algo del usuario ha cambiado
  account.ts       la sesión, entrar, salir y crearla
  progress.ts      los sellos y las insignias
  volumes.ts       qué tomos se abren y qué hay dentro de cada uno
  mockServer.ts    EL SERVIDOR SIMULADO: lo único que se tira
```

- **Ningún componente importa `mockServer.ts`.** Se llama a `account`, `progress`
  y `volumes`. El día del backend se reescriben esas tres por dentro, se borra el
  simulado y no se toca ni un componente.
- **El simulado tarda y puede fallar.** Cada llamada espera un rato al azar, y
  `MOCK_SERVER.failureRate` hace que falle como sin conexión. Si respondiera al
  instante y siempre bien, el front no tendría esperas ni errores que enseñar, y
  habría que añadirlos pantalla a pantalla el día del servidor de verdad.
- **Quién abre qué tomo lo decide el servidor**, nunca el navegador: si lo
  decidiera la app, bastaría con tocar sus datos para llevarse el tomo siguiente.
- **Un sello se guarda primero en el navegador** y después en la cuenta, si la
  hay. Lo local es el progreso sin cuenta que la cuenta absorbe al crearse; si la
  subida falla, se reintenta al volver a entrar.
- **La cuenta de prueba vive en este navegador**, y el panel lo dice. Es
  «todavía no», y tiene que leerse así.

La regla del tomo: el 1 se abre siempre y sin cuenta; cada uno de los demás pide
la **insignia** del anterior, que da el servidor al recibir el sello del examen
final. Sin cuenta, el sello se queda en el navegador y el tomo siguiente pide
crearla en vez de abrirse. El diseño de la insignia está sin pulir: de momento es
el sello en el carné.

### Supabase — las reglas que no se negocian

**Por qué Supabase y no Firebase ni Nest.** El temario es todo referencias
cruzadas —un bloque guarda ids de kana, de palabras y de frases, nunca copias—, y
eso es una base relacional: `types.ts` pasa a ser el esquema de las tablas casi tal
cual. Firestore obligaría a duplicar los datos dentro de cada bloque, que es justo
lo que prohíbe «Un bloque guarda referencias, no copias». Nest saldría más barato
en factura y mucho más caro en tiempo: habría que escribir y mantener el login, el
restablecimiento de contraseña y los permisos que Supabase ya trae. Y como es
Postgres estándar, el día que Nest compense, la base se lleva entera.

En Supabase la seguridad **no está en esconder la clave**: está en las políticas de
la base de datos. De ahí estas reglas, que valen desde la primera línea:

- **En el front, solo la clave `anon`.** Viaja en el bundle y es pública por
  diseño. La `service_role` **jamás** llega al navegador: salta todas las políticas.
- **RLS activada en todas las tablas, sin excepción.** Sin ella, cualquiera con la
  clave `anon` se lee la tabla entera. Es *el* fallo clásico de Supabase.
- **Cada usuario solo ve sus filas** (`auth.uid() = user_id`).
- **Lo que da acceso no lo escribe el cliente.** Insignias y estado de suscripción
  se escriben desde el servidor —función de Postgres o Edge Function—. Si el
  navegador pudiera escribir `unlocked`, el catálogo se regala desde la consola.
  Es la misma regla que ya lleva escrita `VolumeGate`.
- **El contenido de pago, en bucket privado**, servido con URL firmada de vida
  corta y solo si el servidor ve el derecho.
- **El webhook de Stripe se verifica por firma.** Si no, cualquiera manda un
  «pagado» falso.
- **Borrar la cuenta es obligatorio**, no una cortesía: lo exige el RGPD en cuanto
  se cobre en Europa. Va en el panel, junto a cerrar sesión.

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
4. Si se notifica que es una pregunta se responde y no se empieza la tarea, hasta confirmación.

### Después de cada tarea

- Resumir qué se hizo y qué quedó pendiente para el siguiente paso.
- No continuar con el siguiente paso sin que el usuario lo pida.
- **Proponer commit y push, siempre.** Cada vez que se termina un trabajo, se
  añade algo o se mejora algo de la app, preguntar si se commitea y se sube.

  No es una formalidad: el usuario tiende a olvidarlo, y lo que se deja sin
  commitear se acumula. Un árbol de mil líneas y treinta archivos ya no se puede
  repartir en commits con sentido — los cambios de dos trabajos distintos acaban
  en el mismo hunk y solo se separan con cirugía.

  Proponerlo NO es hacerlo: la autorización sigue siendo suya, con las palabras
  de «Reglas inamovibles».

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
React 19          — UI
Vite 8            — build tool
react-router-dom  — las rutas del recorrido
SCSS (Sass)       — estilos, sin CSS-in-JS
GSAP 3            — todas las animaciones de entrada/salida/transición (obligatorio)
page-flip         — física de paso de páginas estilo manga
```

Del día del backend en adelante se le suma `@supabase/supabase-js`, y **es la única
dependencia que hace falta**: el login con Google lo resuelve Supabase por
redirección, sin SDK de Google. Ver la fase 3.

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

Estructura real a día de hoy. Si se mueve algo de sitio, se actualiza aquí: este
documento se carga entero en cada sesión, y un árbol que no coincide con el
proyecto engaña más que no tenerlo.

```text
src/
  landing/          ← la entrada: fachada, puertas, animación de acceso
  entrance/         ← el zaguán
  hall/             ← el vestíbulo, desde donde se eligen los pasillos
  aisle/            ← el pasillo y todo lo que pasa dentro
    shelf/          ← la rejilla del mueble, el tomo en la balda, cómo se saca
                      y el velo que lo aísla
    book/           ← el tomo, una carpeta por lo que hace cada pieza
      opening/      ← el libro abriéndose
      reader/       ← las hojas que se pasan y de dónde salen
      parts/        ← lo que comparten varias hojas: botón, texto, sonido, sorteos
      intro/        ← la portada: qué bloque es y a dónde lleva
      mnemonic/     ← la ilustración con el kana trazándose encima
      presentation/ ← la tarjeta: forma, lectura y sonido
      writing/      ← la pauta, la pizarra y la corrección de trazos
      recognition/  ← la palabra y el hueco de rōmaji
      matching/     ← emparejar arrastrando, y el enunciado sin palabras
      drill/        ← dos preguntas en una hoja
      exam/         ← el examen de cada lección, el examen final y su sello
  account/          ← la cuenta: el panel para crearla o entrar, y el carné
  collection/       ← Mi biblioteca: lo ganado. Hoy solo la pantalla con sus datos;
                      el mueble, las chuletas y los juegos son la fase 3
  api/              ← excepción justificada: todo lo que habla con el servidor, y
                      el servidor simulado. Es la única carpeta que cambia el día
                      del backend — ver «La capa `api/`»
  content/          ← el temario: kana, vocabulario, frases. Dato, no código
  shared/           ← lo único que va fuera: usado en más de un dominio
  styles/           ← excepción justificada: tokens globales, reset, tipografía base
```

Las carpetas de `book/` llevan el nombre de **lo que hacen**, no el número del
ejercicio que las usa: el ejercicio 4 —reconocimiento inverso— entrará en
`recognition/`, no en una carpeta nueva. Ver «Reutilización — la regla de tres».

**Pendiente:** los ejercicios viven hoy dentro de `aisle/book/`, no en
`src/exercises/` como pide la sección «Contenido del curso». El movimiento se hará
cuando exista un segundo pasillo, que es cuando se puede comprobar de verdad si
son independientes del contenido.

### Cuándo crear una carpeta nueva
Solo cuando empieza una funcionalidad nueva. No antes.
Nunca crear carpetas vacías "por si acaso".

### Cuándo mover algo a `shared/`
Solo cuando el mismo componente o hook se necesita en dos dominios distintos.
Hasta ese momento, vive en el dominio donde nació.

### Cuándo subdividir un dominio

Una carpeta de dominio con más de ~8 archivos se subdivide por sub-dominio, con
nombres que digan **qué hace** cada parte, nunca `exercise1`, `paso2` ni tipos de
archivo. Si dos sub-dominios necesitan lo mismo, sale a `parts/` dentro del
dominio — no se importan entre hermanos.

**Por qué el nombre nunca lleva número:** el orden es del temario, no del código.
Numerando las carpetas, insertar un ejercicio entre el 2 y el 3 obliga a renombrar
carpetas y todos sus imports, y `exercise7/` no dice qué hay dentro. Además las
piezas se comparten: el ejercicio 4 reutiliza casi todo lo del 3, y con carpetas
numeradas acabarían importándose entre ellas — que es peor que tenerlo todo junto,
porque parece que están separadas y no lo están.

### Lo que nunca se hace
- Carpetas por tipo (`components/`, `hooks/`, `utils/`) a nivel global.
- Archivos de estilos en una carpeta separada del componente al que pertenecen.
- Mover un archivo a `shared/` "por si acaso lo reutilizo luego".

---

## Reutilización — la regla de tres

**A la tercera repetición, se unifica.** No a la segunda, y no antes.

Esto tiene nombre. El principio general es **DRY** (*Don't Repeat Yourself*). La
regla concreta del umbral es la **regla de tres** (*Rule of Three*), de Martin
Fowler: «la primera vez lo escribes; la segunda te aguantas y duplicas; la
tercera, refactorizas». El refactor se llama **extraer componente** (*Extract
Component*), y la pieza que sale —un botón, un campo, una etiqueta— es lo que el
*Atomic Design* llama un **átomo**.

### Por qué a la tercera y no a la segunda

Dos cosas parecidas a menudo dejan de parecerse. Unificarlas demasiado pronto
obliga a llenar la pieza común de excepciones, y acaba costando más leerla que
las dos copias. A la tercera ya no es casualidad: es un patrón.

### Cómo se hace

1. Sale **el aspecto o el comportamiento común, nunca la colocación.**
   Una pieza compartida dice cómo se ve; dónde va lo dice quien la usa, con su
   propia clase. Metiendo el margen dentro, todos heredan el del primero.
2. La pieza nueva **vive en el dominio donde nació**, igual que todo lo demás.
   A `shared/` solo se mueve cuando la pide un segundo dominio.
3. Se hace **en su propio paso**, nunca a la vez que se añade funcionalidad.
   Primero se unifica lo que ya hay, sin que cambie nada de lo que se ve; después
   se usa la pieza nueva para lo siguiente.
4. Al terminar **no puede quedar ninguna copia.** Si se unifica la tercera y las
   otras dos se quedan como estaban, el problema ha empeorado: ahora hay dos
   sitios donde mirar y ninguno manda.

### Aplica a todo, no solo a componentes

Un bloque de SCSS repetido, una función de utilidad copiada, un tipo escrito dos
veces, el mismo `useEffect` en tres pantallas. La regla es la misma.

### Ejemplo en el proyecto

`BookButton` (`src/aisle/book/parts/`). El mismo botón de latón estaba escrito cuatro
veces —animar el trazo, escuchar el kana, borrar la pizarra, escuchar la palabra—
y cambiar su aspecto obligaba a tocar cuatro archivos y acordarse de los cuatro.
Ahora el aspecto vive en `BookButton.scss` y cada hoja solo dice dónde va el suyo.

---

## Contenido del curso

Qué se enseña, en qué orden, con qué vocabulario y qué frases vive en su propio
documento, que se carga entero en cada sesión:

@docs/estructura-aprendizaje.md

Ese archivo es la referencia del contenido y va a cambiar a menudo. CLAUDE.md no:
aquí solo están las reglas que se derivan de él.

### Reglas

- **El contenido es dato, nunca código.** Kana, vocabulario, frases y gramática
  viven en archivos de datos, no incrustados en componentes ni escritos a mano
  dentro del JSX. Debe poder cambiarse el temario sin tocar un componente.
- **Las cuatro capas no se mezclan:** contenido → currículo (bloques) →
  ejercicios → progreso del usuario. Un ejercicio no define contenido, y un
  bloque no define ejercicios.
- **Un bloque guarda referencias, no copias.** Si una palabra aparece en dos
  bloques es la misma entrada referenciada dos veces, nunca duplicada.
- **Nada se marca como nuevo dos veces.** Lo ya aprendido cuenta como conocido
  al calcular qué desbloquea el bloque siguiente.
- **Nunca inventar contenido japonés.** Kana, lecturas, significados y frases
  salen del documento. Si falta algo, se pregunta — no se rellena a ojo.
- **Idioma del contenido:** el japonés en japonés, las traducciones en español.
  No es una excepción a la regla de idioma de la UI: es dato, no interfaz.

### Contenido y ejercicios van separados

El contenido cambia con cada pasillo. Los ejercicios NO: «reconocer el carácter»,
«escribir la lectura» o «completar la frase» son el mismo ejercicio tanto en
hiragana como en katakana o kanji. Por eso viven en sitios distintos.

```text
src/
  content/            ← el temario, un subdirectorio por pasillo
    types.ts          ← Kana, Word, Lesson, Sentence, Grammar, Block
    hiragana/
      kana.ts         ← la ficha de cada kana: trazos, mnemotecnia, audio
      vocabulary.ts   ← las palabras, con su audio y su color o su dibujo
      sentences.ts
      grammar.ts
      blocks.ts       ← qué va junto en cada tomo, y en qué orden
    katakana/         ← más adelante, los mismos archivos
    kanji/            ← más adelante
  exercises/          ← cada tipo de ejercicio, escrito UNA sola vez
```

- **Un ejercicio nunca sabe de qué pasillo es.** Recibe el contenido por
  parámetro y funciona igual con cualquiera. Si un ejercicio menciona «hiragana»
  en su código, está mal escrito: hay que sacarlo al contenido.
- **Añadir katakana debe ser añadir datos, no ejercicios.** El día que exista
  `content/katakana/`, no debería hacer falta escribir ni un ejercicio nuevo.
- **`types.ts` es común a todos los pasillos.** Un kana es un kana lo escriba
  quien lo escriba. El kanji necesitará campos de más (lecturas on/kun); se
  añaden extendiendo el tipo, no duplicándolo.
- **Los datos van en `.ts`, no en `.json`.** TypeScript comprueba las referencias
  cruzadas —que ninguna frase apunte a una palabra inexistente, que ningún bloque
  referencie un kana que no está— y con un temario que es todo referencias eso es
  lo que impide que se desincronice. El día que haya base de datos, `types.ts`
  pasa a ser el esquema de las tablas y el volcado sale de un script; el JSON se
  genera con un `JSON.stringify` si hace falta.

**Dónde está cada cosa hoy:** `content/` ya existe, con el B1 entero dentro.
`exercises/` todavía no — los ejercicios siguen en `aisle/book/`, y se moverán
cuando haya un segundo pasillo con el que comprobar de verdad que son
independientes del contenido.

---

## Cómo se arma un tomo

**Un tomo ES un bloque del temario.** Lo único que distingue un libro de otro son
sus datos: no hay ni una línea de código por libro.

```text
BLOCK_PLAN         el temario entero en orden: doce bloques, escritos o no
      ↓
VOLUME_ORDER       un tomo por bloque, con las caras de su puesto (volumeArt.ts)
      ↓
SHELF_GRID         el mueble medido: sus baldas y sus vanos
      ↓
placeVolumes       posa cada tomo en el primer hueco libre → SHELF_VOLUMES
      ↓
fetchVolume        el servidor empaqueta el bloque con todo lo que nombra
      ↓
VolumeReader       recibe ese paquete, sin mirar content/ por su cuenta
      ↓
buildVolumePages   genera las páginas a partir de sus lecciones
```

**Cuántos tomos hay no se escribe:** son tantos como bloques tenga `BLOCK_PLAN`.
Un bloque sin escribir sigue siendo un tomo —se ve en la balda y se desbloquea a
su hora—, pero al pulsarlo dice que todavía se está escribiendo.

Un tomo en la balda puede estar abierto, cerrado (falta sellar el anterior),
esperando cuenta (sellado sin cuenta) o sin escribir. Los cerrados se ven
apagados, y al pulsarlos dan un tirón y dicen qué les falta. Ver `VolumeAccess` en
`api/volumes.ts`.

### Dónde se posa un tomo tampoco se escribe a mano

`shelfGrid.ts` tiene la estantería pintada medida una sola vez —cuatro baldas, dos
vanos limpios en cada una— y `placeVolumes` reparte la colección por orden: llena
un vano, pasa al siguiente, y al agotar los dos de una balda baja a la de abajo.

De ahí salen el centro del lomo, la balda y el alto de cada tomo. **Ninguno de los
tres se escribe**, igual que no se escribe una página suelta: si hiciera falta
recolocar la estantería entera se tocan los números del mueble, no los tomos.

### Las páginas se generan, nunca se escriben a mano

`kanaSpreads(kanaId, wordId, wordId2)` devuelve las nueve planas de una lección:
siete de estudio, un repaso sorteado entre ellas y el examen. `buildVolumePages`
las encadena para todas las lecciones del bloque, pone la portada delante y el
examen final detrás, y numera de corrido. Cada lección son 18 páginas; seis son
108, más la portada y el examen final.

**Nunca escribir una página suelta con su `kanaId` y su `wordId` puestos a mano.**
Un ejercicio nuevo se añade a `kanaSpreads` y aparece en todos los tomos a la vez.

### Una lección entra solo si está COMPLETA

`VolumeReader` deja fuera la lección cuyo contenido no esté listo —mirando el
paquete que le llega, no el temario—, y hacen falta
las tres cosas:

- la ficha del kana en `kana.ts` —mnemotecnia, trazos, ilustración, audio—;
- el audio de su palabra;
- la representación de esa palabra: `swatch` si es un color, `image` si no.

Media lección son planas en blanco, y quien lee no distingue una página vacía de
una rota. Así el tomo crece según se va cerrando el contenido, en vez de exigir el
bloque entero para poder abrirse.

### Qué hay que rellenar para un tomo nuevo

1. `content/hiragana/blocks.ts` → una entrada de `Block`: `title`, `summary`,
   `lessons` (cada kana con la palabra con la que se enseña), `wordIds`,
   `sentenceIds`.
2. `content/hiragana/kana.ts` → la ficha de cada kana nuevo. Los trazos y la
   silueta salen de `tools/kana-tracer.html`, que se actualiza a un kana cada vez.
3. `content/hiragana/vocabulary.ts` → sus palabras, con `audio` y con `swatch` o
   `image`.
4. Nada en la estantería: el tomo ya está, porque su bloque ya figura en
   `BLOCK_PLAN`. Un bloque nuevo fuera de los doce se añade ahí, y la rejilla lo
   posa en el primer hueco libre.

Nada más: ningún componente, ninguna página, ningún ejercicio.

**Del bloque 2 en adelante, ojo:** es contenido de pago, y no puede quedarse en
`content/` para siempre — ver «El contenido de pago no puede vivir en
`content/`».

### Las tapas y los lomos son de cada tomo

Cada tomo tiene su lomo, su tapa y su tapa girada, en `aisle/shelf/volumeArt.ts`,
por orden: la primera entrada es la del tomo 1. Salen de `books/moreBoks/` —tres
imágenes por tomo: lomo (impar), tapa (par) y tapa girada (N.N o N.1)— recortadas
a su silueta en `books/volumes/`. Hay trece juegos para doce bloques. Los de
`moreBoks/` son los originales sin recortar, ya en WebP: nada del proyecto los
carga, pero están dentro de `public/` y se despliegan.

El canto —el filo de las hojas— es el único que comparten todos (`FORE_EDGE`).

Cada tomo apunta las medidas de sus recortes, y la proporción de la tapa sale de
la **girada**, no de la plana: la plana es un 12 % más ancha, y con cada una a su
proporción el relevo del final del giro daba un salto. La plana se estira a la
girada. Si se cambia un render, hay que recortarlo y medirlo otra vez.

### La portada

La primera plana sale entera del bloque: a la derecha su `title`, sus kana y sus
cuentas; a la izquierda las frases que se leerán al terminarlo. De todo eso solo se
escriben a mano `title` y `summary` — **las cuentas se derivan** de `wordIds` y
`sentenceIds`, así que no pueden quedarse desfasadas cuando cambie el temario.

### Los distractores

Las tarjetas falsas de los ejercicios de elegir salen de los kana **ya estudiados**
del bloque, hasta seis (`parts/pickCards.ts`). En la primera lección no hay nada
anterior y salen solo los de la palabra; en la última se elige entre seis. La
dificultad sube sola conforme avanza el tomo, sin configurar nada.

Nunca meter como distractor un kana que todavía no se haya dado: descartar una
tarjeta tiene que ser reconocerla, no adivinar.

---

## Ejercicios

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
- Claude Code hace commit solo cuando el usuario lo pide explícitamente, pero
  **tiene que proponerlo** al terminar cada trabajo — ver «Después de cada tarea».
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


## Ejercicios de aprendizaje

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


## Estructura del aprendizaje — los bloques

### Bloques completos de la fase hiragana

#### Fase hiragana base (B1–B9)

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

#### Fase derivada (B10–B12)

| Bloque | Formas nuevas | Acum. | % silabario (110) | Palabras | Acum. |  % N5 |
| ------ | ------------- | ----: | ----------------: | -------: | ----: | ----: |
| B10    | 25 (dakuten)  |    71 |             64,5% |       61 |   289 | 36,1% |
| B11    | 6 (ぱ行 + っ) |    77 |             70,0% |        8 |   297 | 37,1% |
| B12    | 33 (yōon)     |   110 |              100% |        7 |   304 | 38,0% |

#### Orden de aprendizaje del hiragana

| # | Caracteres | Nuevas | Acum. |
|---|---|---:|---:|
| B1 | あ い う え お は (6) | 13 | 13 |
| B2 | け か し と き こ (6) | 25 | 38 |
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

#### Frases desbloqueadas al final del bloque B1

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

#### Nmemotecnica de cada hiragana

A - Nos imaginamos a nuestro amigo Arturo de la mesa redonda, pero en version japonesa, obviamente no podria este levantar la espada con facilidad, debera pedir el poder de sus Amigos, asi que mientras Arturo pide el poder de la Amistad y desgasnita gritando AAAAAAAAAAAAAAAA