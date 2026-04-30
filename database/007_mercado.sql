-- ══════════════════════════════════════════════
--  Migración: Mercado — Buscador de precios
--  Tablas: comercios, productos, precios_productos
--  Modelo híbrido: seed + comunidad actualiza
-- ══════════════════════════════════════════════


-- ══════════════════════════════════════════════
--  1. TABLA: comercios
--  Supermercados, mayoristas, kioscos, verdulerías,
--  tiendas de ropa, etc. registrados por usuarios.
-- ══════════════════════════════════════════════

create table if not exists public.comercios (
  id            uuid primary key default uuid_generate_v4(),
  nombre        text not null,                      -- "Carrefour Express Centro"
  tipo          text not null check (tipo in (
    'supermercado', 'mayorista', 'kiosco', 'almacen',
    'verduleria', 'farmacia', 'tienda_ropa', 'libreria',
    'ferreteria', 'electronica', 'otro'
  )),
  direccion     text,                               -- "Av. Ferré 1234"
  ciudad        text not null,                      -- "Corrientes"
  provincia     text not null,                      -- "Corrientes"
  cadena        text,                               -- "Carrefour", "Impulso", null si es independiente
  verificado    boolean not null default false,      -- Moderación futura
  creado_por    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.comercios is 'Comercios registrados por la comunidad para el buscador de precios Mercado.';

-- Índices
create index if not exists idx_comercios_ciudad
  on public.comercios (ciudad, provincia);
create index if not exists idx_comercios_cadena
  on public.comercios (cadena) where cadena is not null;
create index if not exists idx_comercios_tipo
  on public.comercios (tipo);


-- ══════════════════════════════════════════════
--  2. TABLA: productos
--  Catálogo de productos buscables.
--  Full-text search con tsvector de PostgreSQL.
-- ══════════════════════════════════════════════

create table if not exists public.productos (
  id            uuid primary key default uuid_generate_v4(),
  nombre        text not null,                      -- "Nesquik Cacao en Polvo 400g"
  marca         text not null,                      -- "Nesquik"
  categoria     text not null check (categoria in (
    'almacen', 'bebidas', 'lacteos', 'carnes', 'verduras_frutas',
    'limpieza', 'higiene', 'panaderia', 'congelados',
    'ropa', 'calzado', 'electronica', 'hogar',
    'farmacia', 'libreria', 'otro'
  )),
  subcategoria  text,                               -- "Cacao", "Gaseosas", etc.
  presentacion  text,                               -- "400g", "1.5L", "Talle M"
  codigo_barras text unique,                        -- EAN/UPC si se tiene
  imagen_url    text,                               -- Foto del producto
  created_at    timestamptz not null default now()
);

comment on table public.productos is 'Catálogo de productos para el buscador de precios Mercado.';

-- Índice para búsqueda por marca
create index if not exists idx_productos_marca
  on public.productos (marca);
-- Índice para categoría
create index if not exists idx_productos_categoria
  on public.productos (categoria);
-- Índice full-text search usando nombre + marca
create index if not exists idx_productos_search
  on public.productos using gin (to_tsvector('spanish', nombre || ' ' || marca));


-- ══════════════════════════════════════════════
--  3. TABLA: precios_productos
--  El corazón: precio de un producto en un comercio.
--  Actualizado por la comunidad con sistema de votos.
-- ══════════════════════════════════════════════

create table if not exists public.precios_productos (
  id              uuid primary key default uuid_generate_v4(),
  producto_id     uuid not null references public.productos(id) on delete cascade,
  comercio_id     uuid not null references public.comercios(id) on delete cascade,
  precio          numeric(12,2) not null check (precio > 0),
  en_oferta       boolean not null default false,
  precio_oferta   numeric(12,2) check (precio_oferta is null or precio_oferta > 0),
  votos_ok        integer not null default 1,       -- Usuarios confirmaron que es correcto
  votos_desactual integer not null default 0,       -- Usuarios reportaron que está desactualizado
  reportado_por   uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Un precio por producto por comercio (el más reciente)
  unique (producto_id, comercio_id)
);

comment on table public.precios_productos is 'Precios actualizados por la comunidad para el buscador Mercado.';

-- Índices para consultas frecuentes
create index if not exists idx_precios_producto
  on public.precios_productos (producto_id);
create index if not exists idx_precios_comercio
  on public.precios_productos (comercio_id);
create index if not exists idx_precios_actualizado
  on public.precios_productos (updated_at desc);


-- ══════════════════════════════════════════════
--  4. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════

alter table public.comercios enable row level security;
alter table public.productos enable row level security;
alter table public.precios_productos enable row level security;

-- COMERCIOS: lectura pública, escritura autenticada
create policy "Lectura pública de comercios"
  on public.comercios for select using (true);

create policy "Usuarios autenticados pueden crear comercios"
  on public.comercios for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden actualizar comercios"
  on public.comercios for update
  to authenticated
  using (true)
  with check (true);

-- PRODUCTOS: lectura pública, escritura autenticada
create policy "Lectura pública de productos"
  on public.productos for select using (true);

create policy "Usuarios autenticados pueden crear productos"
  on public.productos for insert
  to authenticated
  with check (true);

-- PRECIOS: lectura pública, escritura autenticada
create policy "Lectura pública de precios"
  on public.precios_productos for select using (true);

create policy "Usuarios autenticados pueden reportar precios"
  on public.precios_productos for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden actualizar precios"
  on public.precios_productos for update
  to authenticated
  using (true)
  with check (true);


-- ══════════════════════════════════════════════
--  5. FUNCIONES RPC
-- ══════════════════════════════════════════════

-- Búsqueda full-text de productos con precios
create or replace function buscar_productos(
  p_query text,
  p_ciudad text default null,
  p_provincia text default null,
  p_limite integer default 20
)
returns table (
  producto_id     uuid,
  nombre          text,
  marca           text,
  categoria       text,
  presentacion    text,
  imagen_url      text,
  precio_min      numeric,
  precio_max      numeric,
  cant_comercios  bigint,
  relevancia      real
)
language sql security definer set search_path = public as $$
  select
    p.id as producto_id,
    p.nombre,
    p.marca,
    p.categoria,
    p.presentacion,
    p.imagen_url,
    min(pp.precio) as precio_min,
    max(pp.precio) as precio_max,
    count(distinct pp.comercio_id) as cant_comercios,
    ts_rank(
      to_tsvector('spanish', p.nombre || ' ' || p.marca),
      plainto_tsquery('spanish', p_query)
    ) as relevancia
  from productos p
  left join precios_productos pp on pp.producto_id = p.id
  left join comercios c on c.id = pp.comercio_id
  where
    to_tsvector('spanish', p.nombre || ' ' || p.marca)
    @@ plainto_tsquery('spanish', p_query)
    and (p_ciudad is null or c.ciudad = p_ciudad or pp.id is null)
    and (p_provincia is null or c.provincia = p_provincia or pp.id is null)
  group by p.id, p.nombre, p.marca, p.categoria, p.presentacion, p.imagen_url
  order by relevancia desc
  limit p_limite;
$$;

-- Obtener precios de un producto en comercios de una ciudad
create or replace function precios_producto_en_ciudad(
  p_producto_id uuid,
  p_ciudad text default null,
  p_provincia text default null
)
returns table (
  precio_id       uuid,
  comercio_id     uuid,
  comercio_nombre text,
  comercio_tipo   text,
  comercio_dir    text,
  comercio_cadena text,
  precio          numeric,
  en_oferta       boolean,
  precio_oferta   numeric,
  votos_ok        integer,
  votos_desactual integer,
  updated_at      timestamptz
)
language sql security definer set search_path = public as $$
  select
    pp.id as precio_id,
    c.id as comercio_id,
    c.nombre as comercio_nombre,
    c.tipo as comercio_tipo,
    c.direccion as comercio_dir,
    c.cadena as comercio_cadena,
    pp.precio,
    pp.en_oferta,
    pp.precio_oferta,
    pp.votos_ok,
    pp.votos_desactual,
    pp.updated_at
  from precios_productos pp
  join comercios c on c.id = pp.comercio_id
  where pp.producto_id = p_producto_id
    and (p_ciudad is null or c.ciudad = p_ciudad)
    and (p_provincia is null or c.provincia = p_provincia)
  order by pp.precio asc;
$$;

-- Productos populares (los que tienen más precios cargados)
create or replace function productos_populares(
  p_ciudad text default null,
  p_provincia text default null,
  p_limite integer default 10
)
returns table (
  producto_id     uuid,
  nombre          text,
  marca           text,
  categoria       text,
  presentacion    text,
  imagen_url      text,
  precio_min      numeric,
  precio_max      numeric,
  cant_comercios  bigint
)
language sql security definer set search_path = public as $$
  select
    p.id as producto_id,
    p.nombre,
    p.marca,
    p.categoria,
    p.presentacion,
    p.imagen_url,
    min(pp.precio) as precio_min,
    max(pp.precio) as precio_max,
    count(distinct pp.comercio_id) as cant_comercios
  from productos p
  join precios_productos pp on pp.producto_id = p.id
  join comercios c on c.id = pp.comercio_id
  where
    (p_ciudad is null or c.ciudad = p_ciudad)
    and (p_provincia is null or c.provincia = p_provincia)
  group by p.id, p.nombre, p.marca, p.categoria, p.presentacion, p.imagen_url
  order by cant_comercios desc, max(pp.updated_at) desc
  limit p_limite;
$$;


-- ══════════════════════════════════════════════
--  6. TRIGGERS
-- ══════════════════════════════════════════════

create trigger trg_comercios_updated_at
  before update on public.comercios
  for each row execute function set_updated_at();

create trigger trg_precios_updated_at
  before update on public.precios_productos
  for each row execute function set_updated_at();
