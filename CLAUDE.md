# Bibliojapo — aprende japonés tomo a tomo
## Instrucciones para Claude Code

---

## Descripción del proyecto

Bibliojapo es una app de aprendizaje de japonés con estética de biblioteca / manga.
El usuario entra por unas puertas de madera tallada, recorre pasillos,
elige en qué pasillo va a entrar — puede ser Hiragana, Katakana, Kanji
o Vocabulario. Una vez dentro hay una estantería donde puede elegir tomos
de manga. Al elegir un tomo entra en una temática manga donde aprenderá
el contenido correspondiente al pasillo: lee, hace ejercicios y pruebas,
y al terminar guarda el tomo en su estantería personal.

**Fase actual:** la fase 3, y lo que queda de ella es enchufar Supabase. El
recorrido está entero —intro en video, entrada, vestíbulo, pasillo y estantería—,
el tomo del bloque 1 se lee de principio a fin, y Mi escritorio ya está en pie:
la mesa con sus objetos encima, la chuleta, el álbum y el carné. La cuenta
también —el formulario con sus dos vías, el panel, el carné y la pantalla de
ajustes—, pero todo eso habla con el servidor SIMULADO: falta el Supabase de
verdad —esquema, políticas de RLS, login con Google— y reescribir por dentro
`account.ts`, `progress.ts` y `volumes.ts`. Ver «La capa `api/`» y la fase 3.

El responsive (fase 4) se ha adelantado sobre la marcha y está casi entero: el
aviso de rotar, las flechas táctiles del lector, el nav estrecho, los objetos del
escritorio en horizontal, y el paneo de la escena —`shared/useScenePan.ts`, con
sus números en `scenePanConfig.ts`—, que llevan el pasillo y el vestíbulo y NO
lleva el escritorio, como manda su regla. Lo que le falta es lo que no se puede
escribir: probarlo en anchos de verdad, y con ello cerrar el encuadre de la
fase 2.
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
3. **Mi escritorio, y con él la cuenta de verdad.** Van juntas porque son la
   misma cosa por sus dos caras: Mi escritorio es lo que se ENSEÑA de una cuenta
   —los tomos cerrados, su chuleta y los juegos que abren—, y sin nada que enseñar
   una cuenta es un formulario que no lleva a ningún sitio.

   **El escritorio ya está hecho** (22-09-2026), contra el servidor simulado: la
   mesa, sus objetos, la chuleta, el álbum y el carné. Lo que sigue de esta fase
   es Supabase. Las reglas de abajo se quedan porque mandan sobre lo que se le
   añada: cada objeto nuevo sobre la madera las cumple igual.

   **Dentro de la fase, el escritorio va PRIMERO**, contra el servidor simulado. No
   espera a Supabase por el criterio de siempre —lo que se puede ver y probar sin
   servidor de verdad va antes—: la cuenta simulada ya existe y ya da insignias,
   así que la pantalla se diseña mirándola. Y al revés sería peor, porque es ella
   la que decide QUÉ hay que guardar —cuándo se cerró cada tomo, las marcas de los
   juegos—, y montar el esquema antes obligaría a reabrir la base de datos en
   cuanto pidiera un dato más. Es el mismo error que ya se evitó una vez
   adelantando el front de las cuentas al backend.

   **La mesa se va poblando, y eso ES el progreso.** No hay estantería personal:
   repetir el mueble del pasillo enseñaría dos veces lo mismo. En su lugar, una
   mesa vista desde el asiento con OBJETOS encima, y cada objeto es una puerta —la
   hoja de estudio abre las chuletas, la caja abre los juegos, el carné abre la
   cuenta—. Un objeto aparece cuando se gana lo que representa, así que la mesa
   empieza casi desnuda y se llena sola: ni barras, ni «3 de 12», y lo siguiente
   que se invente es un objeto más sobre la madera.

   Vive en `src/desk/`, con su escena en `public/images/desk/`. Reglas:

   - **La mesa se pinta VACÍA y los objetos van encima desde el DOM**, igual que
     los tomos sobre la balda del pasillo. Pintados no se pueden pulsar, ni
     animar, ni hacer aparecer cuando toca. Solo se pinta el adorno que nunca es
     puerta ni cambia nunca.
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
   medio. Y se monta con el deep link contemplado desde el primer día — ver
   «Capacitor».
4. **Responsive.** Va DESPUÉS de Mi escritorio, no antes: es la última pantalla
   grande que falta, y ajustar anchos mientras aún no existe obliga a hacer el
   trabajo dos veces —una ahora y otra el día que el escritorio no quepa—. Aquí
   se cierra también el encuadre de la fase 2, que no se puede dar por bueno sin
   probarlo.

   **La escena se RECORRE, no se rehace.** En un móvil en vertical la escena cubre
   por altura y sobra ancho. Encogerla hasta que quepa entera deja los tomos en
   22 px —ilegibles—; dejándola grande miden 84 px. Así que en pantallas estrechas
   la escena se panea de izquierda a derecha en vez de recomponer cada pantalla o
   repintar las ilustraciones en vertical. Solo en horizontal: en vertical el alto
   encaja justo, y moverse en los dos ejes solo haría falta si además se ampliara
   la escena, que es otra decisión.

   Cuatro condiciones, y la última no es un detalle:

   - **El dedo manda; la flecha solo avisa.** En un móvil se arrastra, no se buscan
     flechas. Van a los lados, semitransparentes, como pista de que hay más escena
     — y se pulsan también, pero el control principal es el arrastre.
   - **Se aterriza SIEMPRE sobre lo importante**: la estantería en el pasillo, la
     mesa en el escritorio. Contenido esencial detrás de un gesto que hay que
     descubrir es contenido perdido.
   - **Con un libro abierto no hay paneo.** Ahí manda `StPageFlip`, y los gestos y
     los cambios de tamaño le interrumpen el pase de página — ver «Errores
     conocidos».
   - **El escritorio NO lo lleva.** Sobre la mesa hay tres objetos: en vertical
     caben en columna, y recolocarlos es más barato y se entiende mejor que
     obligar a recorrer la mesa para descubrir que existe la caja de juegos. El
     paneo es para escenas que de verdad hay que recorrer.

   Esto cambia la fase 2: con paneo, el mueble ya no tiene que CABER, basta con
   poder alcanzarlo. `framed-stage` deja de ser «encoge la escena hasta que la zona
   entre» y pasa a decir solo dónde se aterriza.
5. **Salir a la red** con el temario a medias, primero para amigos y conocidos, y
   completar el contenido mientras ya se usa. **Todavía gratis y sin pasarela**:
   Supabase Free y Vercel Hobby valen mientras no se cobre, y aquí es donde se
   rompen las cosas de verdad — mejor romperlas antes de que haya dinero de por
   medio.

   El resto de los tomos se escriben AQUÍ, uno a uno y ya en la red, contra
   Supabase. No esperan a nada: un tomo escrito y probado a solas es un tomo con
   los errores por descubrir, y once a la vez no se revisan, se sufren.
6. **Pagos, y con ellos el contenido protegido y el gasto.** Las tres llegan el
   mismo día: Stripe con su webhook verificado por firma y el estado de la
   suscripción como dato del servidor que alimenta `VolumeGate`; el temario en
   bucket privado con URLs firmadas de vida corta; y la factura.

   **El bucket privado va AQUÍ, no antes.** Mientras el temario está a medias todo
   es gratis con cuenta, y para eso basta la RLS: quien no se ha registrado no lo
   ve. Firmar URLs antes del muro es proteger algo que se está regalando a
   propósito. Ver «El contenido de pago no puede vivir en `content/`».

   Es lo ÚNICO que obliga a pagar Vercel Pro —Hobby prohíbe el uso comercial— y
   Supabase Pro, y lo único que arrastra papeleo fiscal: vender a particulares de
   la UE obliga a declarar el IVA del país del comprador. Por eso va al final, solo.
   Si para entonces hay app en las tiendas, la comisión y sus tres pasarelas entran
   aquí — ver «Capacitor».

**La frontera está entre la 5 y la 6.** Todo lo anterior cuesta 0 €; el día que se
activa Stripe empiezan unos 41 €/mes fijos, que a 3,50 €/mes cubren unos 15
suscriptores. Aplazar el GASTO es correcto; aplazar la INTEGRACIÓN no, porque las
políticas de RLS y las URLs firmadas cambian cómo se piden los datos, y descubrirlo
al final obliga a reabrir pantallas ya cerradas.

### Capacitor — la app en las tiendas

**No es una fase, es otra salida**, como Vercel: Capacitor sirve la misma `dist/`
dentro de un WebView y la publica en las tiendas. Por eso no entra en la lista
numerada. **Va después de la fase 4**: envolver una pantalla que todavía no cabe
en un móvil es depurar el responsive dos veces.

Pero **la decisión de si va a haberla se toma antes**, porque cambia dos piezas de
fases anteriores:

- **El login con Google, en la fase 3.** Google BLOQUEA su OAuth dentro de un
  WebView embebido: devuelve `disallowed_useragent`. Hay que abrirlo en el
  navegador del sistema —Custom Tabs en Android, SFSafariViewController en iOS— y
  volver por un deep link. Así que el deep link se registra en Supabase junto a la
  URL de Vercel, y `account.ts` decide a dónde vuelve según dónde se ejecute.
  Montado así desde el principio es una rama en un archivo; añadido después, es
  rehacer el login.
- **Los pagos, en la fase 6.** Apple y Google exigen su propia compra para
  contenido digital y se quedan un 15–30 %: a 3,50 €/mes, quedan 2,45 €. Y obliga
  a llevar las suscripciones en tres sitios —Stripe en web, App Store, Play—, con
  el lío de quien paga en el móvil y entra por el navegador. Esto está EN
  MOVIMIENTO por las sentencias sobre enlaces externos: cuando toque, se mira lo
  que valga ese día, no lo que diga este documento.

Es un argumento para **salir en web primero y a las tiendas después**, cuando ya
se sepa si alguien paga. Estar en la tienda no trae usuarios por sí solo.

Lo demás no cambia: React, Vite, SCSS, GSAP, Supabase y el temario van igual. Dos
regalos —el problema de `--vh` y la barra de URL desaparece, porque no hay barra, y
el temario empaquetado en la app deja de ser una URL pública, aunque un APK se
abra— y una cosa que hay que PROBAR pronto: **StPageFlip sobre el WebView de
Android**, que es el motor del sistema y no el Chrome del escritorio. El paso de
página con sombras es lo más pesado que tiene la app.

### El modelo

- El **tomo 1 es gratis y se hace sin cuenta**, entero.
- Al terminarlo se da una **recompensa** —sin diseñar todavía— y con ella se
  consiguen los tomos siguientes. **Ahí se exige cuenta.**
- **Mientras el temario esté a medias, todo es gratis CON cuenta.** Del tomo 2 en
  adelante hay que registrarse, pero no pagar. Se cobra el día que el temario esté
  entero, no antes: nadie paga por un curso a medio escribir.
- El **progreso va por cuenta**, no por dispositivo.

De ahí salen cuatro reglas que afectan al código desde ya:

**El contenido del bloque 2 en adelante no puede vivir en `content/`.** Todo lo que
está ahí viaja dentro del bundle y se lee desde las herramientas del navegador, así
que exigir cuenta para el tomo 2 no sirve de nada si su temario va en el
despliegue: el muro se salta abriendo el inspector, y eso vale igual cuando el muro
es una cuenta que cuando sea un pago. El bloque 1 puede quedarse donde está —es el
gratuito sin cuenta y da igual que se lea—, pero del 2 en adelante hay que
servirlo. Al escribir el bloque 2, tenerlo presente en vez de meterlo sin
pensar junto al 1. Juega a favor que el temario solo lo lee el servidor simulado
(`api/mockServer.ts`): el lector recibe el tomo ya empaquetado por `fetchVolume`,
así que del bloque 2 en adelante basta con que ese paquete llegue del servidor de
verdad. Los demás importan únicamente tipos —y la estantería, la lista de ids de
`BLOCK_PLAN`, que no es contenido—.

**Las imágenes y audios del bloque 2 en adelante van en `content-media/`, no en
`public/`.** A una imagen no se la protege empaquetándola —Vite la mete en
`dist/` con otro nombre, pero sigue siendo una URL pública—, así que mientras se
producen se guardan en `content-media/<pasillo>/<bloque>/` en la raíz del repo:
ni se importa desde `src/`, ni vive en `public/`, así que no viaja en ningún
despliegue y solo queda versionada en el repo privado. El bloque 1 se queda en
`public/`, porque es gratis y da igual. Cuando se monte Supabase, el mismo script
que vuelca `content/` a las tablas sube estos archivos al bucket —público mientras
sea gratis, privado el día del muro— y la carpeta se vacía.

**Todo el media pasa por UNA función que devuelve su URL.** Hoy devuelve la ruta
pública; el día del bucket privado devuelve la URL firmada de vida corta. Con la
ruta escrita a pelo en cada componente, ese día se tocan veinte archivos; con la
función, uno. Es barata de escribir ahora y cara después, y es lo que permite
aplazar el bucket privado hasta la fase 6 sin que aplazarlo cueste nada. Vive en
`api/`, que es la carpeta que cambia el día del backend.

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
  feedback.ts      los avisos de quien la usa: qué se ha roto, qué se le ocurre
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
- **`mockServer.ts` no sabe de hiragana**: lee `content/aisleContent.ts`, el
  registro de qué pasillo tiene qué temario —ver «Cómo se arma un tomo»—, así que
  darle temario a un pasillo nuevo no toca ni `mockServer.ts` ni `volumes.ts`.

La regla del tomo, encadenada de un tirón por los cuatro pasillos —hiragana,
katakana, kanji, vocabulario, en ese orden—: dentro de un pasillo, cada tomo pide
la **insignia** del anterior, que da el servidor al recibir el sello del examen
final; el primer tomo de un pasillo pide además el ÚLTIMO tomo del pasillo de
antes sellado del todo —katakana pide hiragana terminado, kanji pide katakana,
vocabulario pide kanji—. Solo el tomo 1 de hiragana, que no tiene pasillo
anterior, se abre siempre y sin cuenta. Sin cuenta, el sello se queda en el
navegador y el tomo siguiente pide crearla en vez de abrirse. El diseño de la
insignia está sin pulir: de momento es el sello en el carné.

`journey()` —el carné, los cuatro arcos del N5— sigue la misma regla: cuenta
hasta el tomo más lejano sellado EN CADA pasillo, así que katakana y kanji dan su
progreso real en cuanto tengan temario, sin tocar código. «Vocabulario» es la
excepción: no es el avance de ESE pasillo, es la palabra aprendida sumada de los
cuatro —la misma cuenta acumulada de siempre, ahora generalizada—.

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

## Comentarios — los justos

**Un comentario se escribe solo cuando avisa de algo que muerde.** Una trampa que
el código no puede enseñar por sí solo: una librería que se comporta al revés de
lo que parece, una restricción externa, una decisión que alguien desharía por
error creyendo que mejora algo.

Todo lo demás lo dice el código, y mejor que la prosa: un nombre claro vale más
que tres líneas explicándolo.

### Lo que NO se comenta

- **El qué.** Si el comentario repite lo que hace la línea de abajo, sobra.
- **La historia.** «Antes esto estaba escrito cuatro veces», «hasta ahora lo hacía
  el otro archivo». Eso es el `git log`, no el código: envejece mal y nadie lo
  actualiza cuando cambia.
- **La justificación larga de una decisión.** El porqué que ocupa un párrafo va a
  este documento, no al archivo.
- **Cabeceras decorativas** (`── Título ────`) y comentarios que ordenan el archivo
  en secciones. Si un archivo necesita índice, es que hace demasiado.
- **Lo obvio para quien sabe React, GSAP o CSS.** El proyecto no es un tutorial.

### Cómo se escribe el que sí

Corto —una o dos líneas—, pegado a lo que explica, y diciendo la consecuencia:
qué pasa si alguien lo cambia. En español, como dice la tabla de arriba.

```ts
// page-flip solo deja pasar la pulsación sobre <button> y <a>; un <div>
// con este aspecto pasaría página en vez de responder al clic.
```

El sitio de lo que no cabe en dos líneas es CLAUDE.md: ahí se lee entero y una
sola vez, en vez de repetido por encima de cada archivo que lo toca.

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

Todos los valores visuales viven en `src/styles/root.scss` como custom properties
de CSS. **Nunca usar valores hardcodeados** — siempre `var(--nombre-del-token)`.
Los valores no se copian aquí: el archivo manda, y una copia se queda vieja sin
que nadie lo note.

- **Color:** `--color-stone|wood|brass|amber|cream|parchment|ivy|ink|bg`, con sus
  variantes `-dark`, `-deep`, `-soft` y `-glow`; uno por pasillo —`--color-hiragana`,
  `--color-katakana`, `--color-kanji`, `--color-vocab`, cada uno con su `-deep`—; y
  los de pieza suelta: página, cristal, cielo, error.
- **Tipografía:** `--font-display` (japonés y cabeceras), `--font-roman` (el
  logotipo de Bibliojapo), `--font-body`.
- **Movimiento:** `--ease-book` y `--duration-flip|door|fast|slow|pulse|sign-sway`.
- **Layout:** `--panel-width`, y `--vh` — lo mantiene el hook `useVh`; nunca `100vh`.

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
  intro/            ← la raíz `/`: el video de apertura, su preferencia y el botón que la
                      cambia. Solo se ve la primera vez, o siempre si se pide, y se
                      funde sobre la entrada
  entrance/         ← la entrada (`/`, con `/entrada` redirigiendo): fachada, puertas,
                      animación de acceso
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
  account/          ← la cuenta: el panel para crearla o entrar, el carné, y la
                      pantalla de lo que se gestiona —datos, contraseña, preferencias—
  contact/          ← Contacta: el aviso de que algo se ha roto. Sin cuenta también,
                      que un fallo se cuenta igual
  desk/             ← Mi escritorio: la mesa vista desde el asiento, con sus
                      objetos encima —la chuleta, el álbum y el carné—, cada uno
                      una puerta
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
documento: `docs/estructura-aprendizaje.md`. No se carga solo — se pide cuando
haga falta consultarlo, para no gastar tokens de sesión con él si no toca.

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

`content/aisleContent.ts` registra, pasillo a pasillo, su `BLOCK_PLAN` y cómo pedir
el resto de su temario. Un pasillo sin `content/<pasillo>/blocks.ts` se registra con
la lista vacía: la balda se ve, pero sin tomos que sacar, hasta que tenga su
carpeta. La capa `api/` —el servidor simulado, `fetchVolume`, los sellos, el
carné— ya sabe servir cualquier pasillo que tenga temario, encadenado al anterior
—ver «La capa `api/`»—: **de momento solo hiragana lo tiene**, así que es el único
que se ve con tomos; darle temario a otro no exige tocar `mockServer.ts` ni
`volumes.ts`, solo `content/aisleContent.ts` y su propia rejilla —ver «Qué hay que
rellenar para un pasillo nuevo»—.

```text
AISLE_CONTENT      el BLOCK_PLAN de CADA pasillo, escrito o no (aisleContent.ts)
      ↓
VOLUME_ORDER       un tomo por bloque del pasillo, con las caras de su puesto (volumeArt.ts)
      ↓
SHELF_GRID         el mueble medido: sus baldas y sus vanos
      ↓
placeVolumes       posa cada tomo en el primer hueco libre → buildShelfVolumes(aisleId)
      ↓
fetchVolume        el servidor empaqueta el bloque con todo lo que nombra
      ↓
VolumeReader       recibe ese paquete, sin mirar content/ por su cuenta
      ↓
buildVolumePages   genera las páginas a partir de sus lecciones
```

**Cuántos tomos hay no se escribe:** son tantos como bloques tenga el `BLOCK_PLAN`
de ESE pasillo, dentro de `AISLE_CONTENT`. Un bloque sin escribir sigue siendo un
tomo —se ve en la balda y se desbloquea a su hora—, pero al pulsarlo dice que
todavía se está escribiendo.

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

### Qué hay que rellenar para un PASILLO nuevo

Katakana, kanji y vocabulario ya tienen estantería, servidor simulado y carné
listos para servirlos —ver «La capa `api/`»—: no hace falta tocar componentes,
solo darles temario. Faltan tres cosas, en este orden:

1. `content/<pasillo>/{blocks,kana,vocabulary,sentences}.ts` → el mismo patrón que
   `content/hiragana/`, con los tipos comunes de `content/types.ts`. Las
   imágenes de apoyo —la ilustración mnemotécnica de cada kana, en el campo
   `image` de `Kana`— y el audio se cuelgan a mano en `public/images/<pasillo>/`
   y `public/audio/<pasillo>/`, con la misma regla de encaje que hiragana:
   centrado, al 60 % del dibujo. Eso no se genera solo, es arte.
2. `content/aisleContent.ts` → sustituir el `EMPTY_AISLE` del pasillo por una
   entrada real: su `blockPlan`, sus `blocksById` y su `loadLessonContent` —el
   mismo import perezoso que ya tiene la entrada de hiragana—. Sin este paso el
   temario existe pero la app sigue sin saber que está ahí: la balda se ve vacía
   y el servidor no tiene qué empaquetar.
3. Medir `shelfGrid.ts` sobre la ilustración del pasillo —hoy solo está medida
   sobre `pasillo-hiragana.webp`—. Sin este paso los tomos del pasillo nuevo se
   colocarían con las coordenadas de la balda de hiragana, que no tiene por qué
   coincidir con la suya: se verían en cualquier sitio menos donde toca.

Con los tres hechos, la estantería del pasillo saca sus tomos sola, el servidor
los sirve y los desbloquea encadenados al pasillo anterior, y el carné cuenta su
progreso — nada de eso se escribe a mano.

Nada más: ningún componente, ninguna página, ningún ejercicio.

**Del bloque 2 en adelante, ojo:** es contenido de pago, y no puede quedarse en
`content/` para siempre — ver «El contenido de pago no puede vivir en
`content/`».

### Las tapas y los lomos son de cada tomo

Cada tomo tiene su lomo, su tapa y su tapa girada, en `aisle/shelf/volumeArt.ts`,
por orden: la primera entrada es la del tomo 1. Son tres imágenes por tomo —lomo,
tapa y tapa girada— recortadas a su silueta en `books/volumes/`: doce juegos para
doce bloques. Los renders originales sin recortar se quitaron de `public/` para no
desplegarlos; si hay que recortar uno otra vez, se recupera del historial de git
(`public/images/hallways/books/moreBoks/`).

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

Los diez tipos —qué aparece, qué hace el usuario y para qué sirve cada uno— están
en el anexo de `docs/estructura-aprendizaje.md`. Cada uno se escribe UNA sola vez
y vale para cualquier pasillo; hoy viven en `aisle/book/`, y se moverán a
`src/exercises/` cuando haya un segundo pasillo.

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
- **Una pantalla clara sin `color` propio sale con el texto BLANCO** para quien
  tiene el sistema en modo oscuro: `base.scss` declara `color-scheme: light dark`,
  así que sin color heredado manda el del navegador. Toda pantalla de papel
  declara su `color` en la raíz de su bloque, y los estilos se miran en los dos
  modos — en claro el fallo no existe.
