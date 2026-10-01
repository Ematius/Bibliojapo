-- El temario en tablas. Se ejecuta entero en el editor SQL del panel, después de
-- `schema.sql`, y es idempotente: volver a lanzarlo no rompe nada.
--
-- Aquí NO se escribe a mano. Todo sale del script de volcado, que lee `content/` —la
-- fuente de autoría, donde TypeScript comprueba que ninguna frase apunte a una
-- palabra inexistente— y reescribe estas tablas.
--
-- Ninguna de estas tablas tiene política de lectura, y es a propósito: con RLS
-- activada y sin políticas, la clave publicable no ve NADA. El temario se pide por la
-- función que comprueba el derecho al tomo, nunca tabla a tabla. Añadir aquí un
-- `select` para `anon` regalaría el catálogo entero.

-- ---------------------------------------------------------------------------
-- Pasillos
-- ---------------------------------------------------------------------------

-- Los mismos cuatro de `AisleId` en `content/aisleContent.ts` y de `TrackId` en
-- `api/contract.ts`. Un pasillo nuevo se añade en los tres sitios.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'aisle_id') then
    create type public.aisle_id as enum ('hiragana', 'katakana', 'kanji', 'vocabulary');
  end if;
end
$$;

-- Los denominadores del N5 en cada pasillo: cuántos kana tiene y cuánto vocabulario.
-- Son los de `content/aisleContent.ts` y llegan con el volcado — escribirlos aquí a
-- mano dejaría dos copias, y la de SQL envejecería sin que nadie lo notase.
create table if not exists public.aisles (
  id public.aisle_id primary key,
  kana_total int not null default 0,
  word_total int not null default 0
);

-- ---------------------------------------------------------------------------
-- Bloques
-- ---------------------------------------------------------------------------

-- Están los TRECE de cada pasillo, escritos o no: de aquí sale cuántos tomos tiene la
-- estantería. `published` es lo que distingue un tomo que se puede leer de uno que
-- todavía se está escribiendo, que se ve en la balda igual y dice «todavía no».
--
-- `id` es el id GLOBAL —`b1` en hiragana, `katakana:b1` en los demás—, el mismo que ya
-- guardan `seals` y `badges`. Cambiar esa forma dejaría ilegible el progreso guardado.
create table if not exists public.blocks (
  id text primary key,
  aisle_id public.aisle_id not null,
  local_id text not null,
  position int not null,
  title text not null default '',
  summary text not null default '',
  published boolean not null default false,
  word_ids text[] not null default '{}',
  sentence_ids text[] not null default '{}',
  unique (aisle_id, local_id),
  unique (aisle_id, position)
);

-- Lo que sigue son columnas añadidas después de que la base estuviera desplegada. Van
-- en `alter` y no dentro del `create` de arriba para no tener la lista escrita dos
-- veces: en una base nueva se crea la tabla y estos `alter` la completan a
-- continuación, con el mismo resultado.

-- Los dakuten que estrena el bloque. No son lección —se enseñan inline, sobre el kana
-- base que ya se sabe—, así que no caben en `lessons`, pero la plana recurrente del
-- dakuten necesita saber cuáles tocan en ESTE tomo.
alter table public.blocks add column if not exists dakuten text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Contenido
-- ---------------------------------------------------------------------------

-- El pasillo entra en la clave porque los ids se repiten entre pasillos: el kana `a`
-- es あ en hiragana y ア en katakana.
create table if not exists public.kana (
  aisle_id public.aisle_id not null,
  id text not null,
  character text not null,
  romaji text not null,
  audio text not null,
  mnemonic text not null default '',
  stroke_order text[] not null default '{}',
  image text not null,
  image_alt text not null default '',
  outline text not null,
  strokes text[] not null default '{}',
  stroke_view_box text not null,
  primary key (aisle_id, id)
);

-- `swatch` para las palabras que SON un color, `image` para las demás: es cómo se
-- enseña la palabra sin escribirla ni traducirla.
create table if not exists public.words (
  aisle_id public.aisle_id not null,
  id text not null,
  units jsonb not null,
  meaning text not null,
  swatch text,
  image text,
  image_alt text,
  audio text,
  primary key (aisle_id, id)
);

-- `units` NO se sustituye por kana/romaji planos: los ejercicios parten la palabra en
-- tarjetas de un kana, y con los yōon los tamaños ni coinciden.
--
-- `kanji` se guarda pero NO se pinta en la Fase 1: a nivel N5 estas palabras se leen y
-- escriben en kana, y el kanji se reencuentra en el pasillo de kanji. La columna existe
-- para que ese pasillo no tenga que volver a recogerlo.
-- Cómo se ESCRIBE la palabra, solo cuando no es la suma de sus `units`: la coma de
-- では、また se escribe y no se lee, así que no es un unit y sin esta columna la palabra
-- llegaría al lector como «ではまた».
alter table public.words add column if not exists text text;

alter table public.words add column if not exists tipo text;
alter table public.words add column if not exists grupo_verbal text;
alter table public.words add column if not exists raiz_masu text;
alter table public.words add column if not exists kanji text;

-- La raíz de ～ない NO siempre sale de `raiz_masu` ni de la tabla de las «u». Se deja
-- vacía en los verbos que sí se derivan —godan por su fila «a», ichidan quitando る— y
-- se escribe a mano en los tres que no:
--   ある → ない       el único godan que pierde la raíz entera; あらない no existe
--   する → しない
--   くる → こない     こ, no き: la raíz de ～ない no es la de ～ます
alter table public.words add column if not exists raiz_nai text;

-- Nullables a propósito: la tabla ya tiene filas de antes del volcado nuevo, y un `not
-- null` sin valor por defecto no podría añadirse sobre ellas. El espejo las rellena.

-- Los checks no son decoración: `conjugations.aplica_a` empareja contra `tipo` sin
-- traducir nada, así que un tipo mal escrito no daría error, simplemente dejaría a esa
-- palabra sin sus formas. Así el volcado se cae y se ve.
alter table public.words drop constraint if exists words_tipo_check;
alter table public.words add constraint words_tipo_check check (
  tipo is null or tipo in (
    'sustantivo', 'verbo-u', 'verbo-ru', 'verbo-irregular', 'adjetivo-i',
    'adjetivo-na', 'adverbio', 'particula', 'conjuncion', 'expresion',
    'contador', 'saludo', 'interrogativo', 'pronombre', 'numero'
  )
);

alter table public.words drop constraint if exists words_grupo_verbal_check;
alter table public.words add constraint words_grupo_verbal_check check (
  grupo_verbal is null or grupo_verbal in ('godan', 'ichidan', 'irregular')
);

-- Un verbo sin raíz no se puede conjugar, y el fallo saldría tarde y en silencio: la
-- palabra aparecería sin sus formas y nadie sabría por qué.
alter table public.words drop constraint if exists words_verbo_check;
alter table public.words add constraint words_verbo_check check (
  (grupo_verbal is null and raiz_masu is null)
  or (grupo_verbal is not null and raiz_masu is not null)
);

create table if not exists public.grammar (
  aisle_id public.aisle_id not null,
  id text not null,
  character text not null,
  romaji text not null,
  explanation text not null default '',
  primary key (aisle_id, id)
);

-- `character` y `romaji` valen para una regla de ORTOGRAFÍA —は que suena «wa», を que
-- suena «o»—, pero no para una de gramática: です no es un carácter, y ます tampoco. Por
-- eso dejan de ser obligatorios y la regla gana título, cuerpo y ejemplos.
--
-- `examples` lleva las tablas de conjugación de G2 y G3, que no caben en un párrafo.
-- Entrecomillado porque `character` es palabra clave de SQL: en el `create` de arriba el
-- parser la admite por su sitio, pero en un `alter column` no.
alter table public.grammar alter column "character" drop not null;
alter table public.grammar alter column romaji drop not null;
alter table public.grammar add column if not exists title text not null default '';
alter table public.grammar add column if not exists body text not null default '';
alter table public.grammar add column if not exists examples jsonb not null default '[]'::jsonb;

create table if not exists public.sentences (
  aisle_id public.aisle_id not null,
  id text not null,
  text text not null,
  meaning text not null,
  units jsonb not null,
  word_ids text[] not null default '{}',
  grammar_id text,
  audio text,
  primary key (aisle_id, id)
);

-- Qué kana se aprende y con qué palabra, en el orden del temario. Es la única parte
-- del bloque que no cabe en una columna, porque empareja dos cosas.
create table if not exists public.lessons (
  block_id text not null references public.blocks (id) on delete cascade,
  position int not null,
  kana_id text not null,
  word_ids text[] not null default '{}',
  primary key (block_id, position)
);

-- Una lección de gramática no enseña un kana, así que `kana_id` deja de ser
-- obligatorio y `tipo` dice cuál de las dos es. La regla se ancla AQUÍ —al bloque y a
-- su puesto en él— y no a una frase: así el tomo decide dónde va la plana, y una regla
-- puede reaparecer en varios bloques, que es lo que hace falta para la del dakuten.
alter table public.lessons alter column kana_id drop not null;
alter table public.lessons add column if not exists tipo text not null default 'kana';
alter table public.lessons add column if not exists grammar_id text;

alter table public.lessons drop constraint if exists lessons_tipo_check;
--
-- Los valores son los de `Lesson.type` en `content/types.ts` SIN traducir, al revés que
-- los de `words.tipo`: aquellos son español porque la palabra es contenido —«sustantivo»,
-- «adjetivo-i»—, y estos son del contrato y cruzan la frontera en los dos sentidos. Con
-- 'gramatica' aquí y 'grammar' allí habría que traducir al subir y al leer, y es ahí
-- donde nacen los desajustes.
alter table public.lessons add constraint lessons_tipo_check check (
  (tipo = 'kana' and kana_id is not null)
  or (tipo = 'grammar' and grammar_id is not null)
);

-- ---------------------------------------------------------------------------
-- Conjugación
-- ---------------------------------------------------------------------------

-- Un verbo es UNA fila en `words`. します y しました no son vocabulario: son formas que
-- se generan pegando un sufijo de aquí a la raíz de la palabra. Crearlas como palabras
-- llenaría el temario de entradas que nadie escribió y que habría que mantener a mano.
--
-- La tabla no lleva `aisle_id`: un verbo conjuga igual se escriba en hiragana, en
-- katakana o en kanji. Sus filas las vuelca `npm run seed:content` desde
-- `content/conjugations.ts`, que es la única lista de sufijos del proyecto.
create table if not exists public.conjugations (
  id text primary key,
  position int not null,
  nombre text not null,
  -- Con `{raiz}`, `{raiz_nai}`, `{raiz_i}` o `{palabra}` dentro: lo que se sustituye al
  -- generar. `{raiz_i}` es la palabra sin su い final, de donde cuelga かったです.
  patron text not null,
  registro text not null,
  -- El id GLOBAL del primer bloque en que la forma se puede enseñar. Se compara contra
  -- la posición del bloque en la CADENA entera —`(aisle_id, position)`, que el enum
  -- ordena en el orden del recorrido—, nunca como texto: 'b10' < 'b3' alfabéticamente.
  -- Y nunca contra la posición dentro del pasillo, o en katakana volverían a bloquearse
  -- formas ya dominadas.
  bloque_min text not null,
  -- Los `tipo` de palabra a los que se aplica. Multivalor, y sus valores son los mismos
  -- que `words.tipo`, así que el filtro es `w.tipo = any(c.aplica_a)` sin traducir.
  aplica_a text[] not null,
  -- El desglose kana a kana del sufijo, con la misma forma que `words.units`. Se escribe
  -- una vez aquí para que generar los `units` de una forma sea concatenar, sin tener que
  -- romanizar texto por tabla.
  suffix_units jsonb not null default '[]'::jsonb
);

-- Las nueve filas de la tabla de las «u», que es lo único que hace falta para derivar
-- la raíz de un godan: se sustituye el ÚLTIMO unit de la palabra por el de la columna
-- que toque. Un ichidan no la usa —se le quita el último unit y ya—, y un irregular
-- trae su raíz escrita.
--
-- Va aparte de `kana` a propósito: `kana` solo guarda los que son lección, y los
-- dakuten no lo son, así que ぎ no estaría ahí — y およぐ → およぎます lo necesita.
--
-- っ y ー no caben aquí porque no son lecturas sino reglas: っ duplica la consonante
-- siguiente y ー alarga la vocal anterior.
create table if not exists public.kana_rows (
  kana_u text primary key,
  romaji_u text not null,
  kana_i text not null,
  romaji_i text not null,
  -- La fila «a», que pide el negativo llano ～ない. Ojo con う → わ, que no es あ.
  --
  -- Derivar por aquí NO basta para ～ない: hay tres verbos que no salen de ninguna
  -- tabla, y por eso existe `words.raiz_nai`.
  kana_a text not null,
  romaji_a text not null
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

-- Activada y sin una sola política: nadie lee estas tablas con la clave publicable.
-- El volcado entra con la `service_role`, que se las salta, y la lectura pasa por la
-- función que comprueba el derecho al tomo.
alter table public.aisles enable row level security;
alter table public.blocks enable row level security;
alter table public.kana enable row level security;
alter table public.words enable row level security;
alter table public.grammar enable row level security;
alter table public.sentences enable row level security;
alter table public.lessons enable row level security;
alter table public.conjugations enable row level security;
alter table public.kana_rows enable row level security;

-- ---------------------------------------------------------------------------
-- Permisos del volcado
-- ---------------------------------------------------------------------------

-- El volcado entra como `service_role`, que se salta la RLS pero necesita privilegios
-- de tabla igual: son dos cosas distintas, y en este proyecto no los trae de serie.
-- Solo sobre el temario, a propósito: los datos de usuario —perfiles, sellos,
-- insignias— no los toca ningún script, así que ahí no hace falta abrir nada.
grant select, insert, update, delete on table
  public.aisles,
  public.blocks,
  public.kana,
  public.words,
  public.grammar,
  public.sentences,
  public.lessons,
  public.conjugations,
  public.kana_rows
  to service_role;

-- ---------------------------------------------------------------------------
-- Las formas conjugadas
-- ---------------------------------------------------------------------------

-- Ni las once formas ni las nueve filas de kana se escriben aquí: llegan con el volcado,
-- desde `content/conjugations.ts`. Escritas además en este archivo, relanzarlo pisaría
-- con la versión vieja cualquier forma que se hubiera corregido allí — que es la única
-- razón por la que este archivo solo crea las dos tablas y las deja vacías.

-- Con una errata en `bloque_min` la forma no fallaría: quedaría inalcanzable en
-- silencio, que es peor. La clave ajena lo caza.
--
-- `not valid` es lo que la hace compatible con el orden de arranque: este archivo corre
-- ANTES del volcado, y relanzarlo sobre una base a medio poblar —`conjugations` con sus
-- filas y `blocks` todavía sin las suyas— haría fallar a una clave normal al recrearse.
-- `not valid` no mira las filas que ya están, pero sí valida toda escritura posterior,
-- que es donde aparecen las erratas. Con los 18 bloques ya volcados se cierra del todo:
--   alter table public.conjugations validate constraint conjugations_bloque_min_fkey;
alter table public.conjugations drop constraint if exists conjugations_bloque_min_fkey;
alter table public.conjugations add constraint conjugations_bloque_min_fkey
  foreign key (bloque_min) references public.blocks (id) not valid;

-- ---------------------------------------------------------------------------
-- El tomo
-- ---------------------------------------------------------------------------

-- La ÚNICA puerta al temario: las tablas no tienen política de lectura, así que sin
-- esta función no se ve nada con la clave publicable.
--
-- Quién abre qué lo decide aquí el servidor, nunca el navegador: hace falta la
-- insignia del tomo anterior de la cadena, y esa solo la escribe el trigger de
-- `badges`. Si lo decidiera el cliente, bastaría con tocar sus datos para llevarse el
-- tomo siguiente.
--
-- Las listas de kana, palabras, frases y reglas van sin orden a propósito: el lector
-- las indexa por id en cuanto las recibe. El orden que importa —el de las lecciones—
-- sí se respeta.
create or replace function public.volume(requested_block text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.blocks;
  previous public.blocks;
  totals public.aisles;
  viewer uuid := auth.uid();
  learned_kana int;
  learned_words int;
begin
  select * into target from public.blocks b where b.id = requested_block;

  -- Un tomo sin escribir no se abre en blanco: para quien pregunta, todavía no existe.
  if not found or not target.published then
    raise exception 'not-found' using errcode = 'P0002';
  end if;

  -- El anterior de la cadena, que cruza de pasillo: el primer tomo de katakana pide el
  -- último de hiragana. El enum `aisle_id` ordena por su orden de declaración, que es
  -- justo el del recorrido.
  select * into previous
  from public.blocks b
  where (b.aisle_id, b.position) < (target.aisle_id, target.position)
  order by b.aisle_id desc, b.position desc
  limit 1;

  -- Sin anterior es el primer tomo de todos: gratis y sin cuenta.
  if found then
    if viewer is null then
      raise exception 'unauthorized' using errcode = '28000';
    end if;
    if not exists (
      select 1 from public.badges g where g.user_id = viewer and g.block_id = previous.id
    ) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  select * into totals from public.aisles a where a.id = target.aisle_id;

  -- Lo aprendido hasta ESTE tomo, sin contar dos veces lo que reaparece más adelante.
  --
  -- Solo las lecciones de KANA: una de gramática no enseña ninguno, y contarla inflaría
  -- el arco con caracteres que nadie ha visto. を es el caso que lo destapó —se enseña
  -- con su regla porque no aparece dentro de ninguna palabra—, y con G0–G7 el error
  -- habría sido de ocho.
  select count(distinct l.kana_id) into learned_kana
  from public.blocks b
  join public.lessons l on l.block_id = b.id
  where b.aisle_id = target.aisle_id and b.position <= target.position
    and l.tipo = 'kana';

  select count(distinct word_id) into learned_words
  from public.blocks b
  cross join unnest(b.word_ids) as word_id
  where b.aisle_id = target.aisle_id and b.position <= target.position;

  -- Sin los nulos, para que un campo vacío llegue ausente y no como `null`: así el
  -- paquete tiene la forma de los campos opcionales de `content/types.ts`.
  return jsonb_strip_nulls(jsonb_build_object(
    'block', jsonb_build_object(
      'id', target.local_id,
      'title', target.title,
      'summary', target.summary,
      -- `type` no es decorativo: el lector descarta la lección que no sea de kana, así
      -- que sin él NINGUNA genera planas y el tomo sale con la gramática y el examen a
      -- secas. `grammarId` es el ancla de la plana de una regla, y llega null —y por
      -- tanto ausente— en las de kana, igual que `kanaId` en las de gramática.
      'lessons', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'type', l.tipo,
            'kanaId', l.kana_id,
            'grammarId', l.grammar_id,
            'wordIds', to_jsonb(l.word_ids)
          )
          order by l.position
        )
        from public.lessons l where l.block_id = target.id
      ), '[]'::jsonb),
      -- Los dakuten que estrena el tomo. `Block` los declara obligatorios, así que sin
      -- esta línea llegan `undefined` y la plana que los explica no sabe cuáles tocan.
      'dakuten', to_jsonb(target.dakuten),
      'wordIds', to_jsonb(target.word_ids),
      'sentenceIds', to_jsonb(target.sentence_ids)
    ),
    'kana', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', k.id,
        'character', k.character,
        'romaji', k.romaji,
        'audio', k.audio,
        'mnemonic', k.mnemonic,
        'strokeOrder', to_jsonb(k.stroke_order),
        'image', k.image,
        'imageAlt', k.image_alt,
        'outline', k.outline,
        'strokes', to_jsonb(k.strokes),
        'strokeViewBox', k.stroke_view_box
      ))
      from public.lessons l
      join public.kana k on k.aisle_id = target.aisle_id and k.id = l.kana_id
      where l.block_id = target.id
    ), '[]'::jsonb),
    'words', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', w.id,
        'units', w.units,
        'text', w.text,
        'meaning', w.meaning,
        'type', w.tipo,
        'kanji', w.kanji,
        'verbGroup', w.grupo_verbal,
        'masuStem', w.raiz_masu,
        'naiStem', w.raiz_nai,
        'swatch', w.swatch,
        'image', w.image,
        'imageAlt', w.image_alt,
        'audio', w.audio
      ))
      from public.words w
      where w.aisle_id = target.aisle_id
        and w.id in (
          select unnest(target.word_ids)
          union
          select unnest(l.word_ids) from public.lessons l where l.block_id = target.id
          union
          select unnest(s.word_ids) from public.sentences s
            where s.aisle_id = target.aisle_id and s.id = any(target.sentence_ids)
        )
    ), '[]'::jsonb),
    'sentences', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id,
        'text', s.text,
        'meaning', s.meaning,
        'units', s.units,
        'wordIds', to_jsonb(s.word_ids),
        'grammarId', s.grammar_id,
        'audio', s.audio
      ))
      from public.sentences s
      where s.aisle_id = target.aisle_id and s.id = any(target.sentence_ids)
    ), '[]'::jsonb),
    'grammar', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id,
        'character', g.character,
        'romaji', g.romaji,
        -- Solo las de gramática los llevan: una de ortografía se titula con su propio
        -- carácter y no tiene tabla que pintar. Sin ellos, la plana de を saldría sin
        -- encabezado y sin sus cuatro frases.
        'title', nullif(g.title, ''),
        'examples', g.examples,
        'explanation', g.explanation
      ))
      from public.grammar g
      where g.aisle_id = target.aisle_id
        and g.id in (
          select s.grammar_id from public.sentences s
          where s.aisle_id = target.aisle_id
            and s.id = any(target.sentence_ids)
            and s.grammar_id is not null
        )
    ), '[]'::jsonb),
    -- Las formas conjugadas que a esta altura del recorrido ya se saben LEER. El filtro
    -- compara el puesto del bloque en la CADENA entera —`(aisle_id, position)`, que el
    -- enum ordena en el orden del recorrido—, nunca el id como texto: 'b10' va detrás de
    -- 'b3' en el recorrido y delante alfabéticamente.
    --
    -- Van con el tomo y no con la palabra porque una forma no es vocabulario: そうじします
    -- no es una entrada del temario, es そうじし más un sufijo. La plana las compone.
    'conjugations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'patron', c.patron,
        'registro', c.registro,
        'aplicaA', to_jsonb(c.aplica_a),
        'suffixUnits', c.suffix_units
      ) order by c.position)
      from public.conjugations c
      join public.blocks origin on origin.id = c.bloque_min
      where (origin.aisle_id, origin.position) <= (target.aisle_id, target.position)
    ), '[]'::jsonb),
    'progress', jsonb_build_object(
      'kana', learned_kana,
      'kanaPercent',
        case when totals.kana_total > 0
          then learned_kana::numeric * 100 / totals.kana_total else 0 end,
      'words', learned_words,
      'wordsPercent',
        case when totals.word_total > 0
          then learned_words::numeric * 100 / totals.word_total else 0 end
    )
  ));
end;
$$;

grant execute on function public.volume(text) to anon, authenticated;

-- Qué tomos están escritos. Es lo único del catálogo que el navegador necesita saber
-- sin abrir nada: la balda los pinta apagados y al pulsarlos dicen «todavía no».
--
-- Devuelve ids y nada más. Títulos y resúmenes son contenido, y del bloque 2 en
-- adelante ese contenido pide cuenta: si viajaran aquí, la portada del tomo siguiente
-- se leería sin tenerla.
create or replace function public.published_volumes()
returns text[]
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(array_agg(b.id order by b.aisle_id, b.position), '{}')
  from public.blocks b
  where b.published;
$$;

grant execute on function public.published_volumes() to anon, authenticated;

-- Los cuatro arcos del carné. La cuenta se hace aquí y no en el navegador porque
-- traerse el temario entero solo para contarlo sería regalarlo.
--
-- Cuenta hasta el tomo más lejano CON INSIGNIA de cada pasillo, sin repetir lo que
-- reaparece más adelante. Sin sesión da cuatro ceros, que es lo que corresponde: el
-- progreso es de la cuenta, no del dispositivo.
create or replace function public.journey()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  tracks jsonb := '[]'::jsonb;
  aisle public.aisles;
  furthest int;
  learned_kana int;
  learned_words int;
  all_words int := 0;
begin
  for aisle in select * from public.aisles a order by a.id loop
    select max(b.position) into furthest
    from public.blocks b
    join public.badges g on g.block_id = b.id and g.user_id = viewer
    where b.aisle_id = aisle.id;

    -- Sin insignia no se ha terminado ningún tomo: `-1` no alcanza ni al primero.
    furthest := coalesce(furthest, -1);

    -- Solo las de KANA, por lo mismo que en `volume()`: una lección de gramática no
    -- enseña ninguno y sumaría al arco caracteres que nadie ha visto.
    select count(distinct l.kana_id) into learned_kana
    from public.blocks b
    join public.lessons l on l.block_id = b.id
    where b.aisle_id = aisle.id and b.position <= furthest
      and l.tipo = 'kana';

    select count(distinct word_id) into learned_words
    from public.blocks b
    cross join unnest(b.word_ids) as word_id
    where b.aisle_id = aisle.id and b.position <= furthest;

    all_words := all_words + learned_words;

    if aisle.id <> 'vocabulary'::public.aisle_id then
      tracks := tracks || jsonb_build_object(
        'id', aisle.id, 'learned', learned_kana, 'total', aisle.kana_total
      );
    end if;
  end loop;

  -- Vocabulario no es el avance de ESE pasillo: es la palabra aprendida sumada de los
  -- cuatro. Va el último para que el orden sea el del recorrido.
  return tracks || jsonb_build_object(
    'id', 'vocabulary',
    'learned', all_words,
    'total', (select a.word_total from public.aisles a where a.id = 'vocabulary'::public.aisle_id)
  );
end;
$$;

grant execute on function public.journey() to anon, authenticated;
