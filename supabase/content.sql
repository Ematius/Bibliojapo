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
