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

create table if not exists public.grammar (
  aisle_id public.aisle_id not null,
  id text not null,
  character text not null,
  romaji text not null,
  explanation text not null default '',
  primary key (aisle_id, id)
);

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
  public.lessons
  to service_role;

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
  select count(distinct l.kana_id) into learned_kana
  from public.blocks b
  join public.lessons l on l.block_id = b.id
  where b.aisle_id = target.aisle_id and b.position <= target.position;

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
      'lessons', coalesce((
        select jsonb_agg(
          jsonb_build_object('kanaId', l.kana_id, 'wordIds', to_jsonb(l.word_ids))
          order by l.position
        )
        from public.lessons l where l.block_id = target.id
      ), '[]'::jsonb),
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
        'meaning', w.meaning,
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

    select count(distinct l.kana_id) into learned_kana
    from public.blocks b
    join public.lessons l on l.block_id = b.id
    where b.aisle_id = aisle.id and b.position <= furthest;

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
