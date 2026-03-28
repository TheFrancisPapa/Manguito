-- ══════════════════════════════════════════════
--  Migración: catalogo_precios_billetera
--  Permite a la comunidad actualizar precios por
--  método de pago para cada suscripción del catálogo.
-- ══════════════════════════════════════════════

create table if not exists public.catalogo_precios_billetera (
  id              uuid default uuid_generate_v4(),
  servicio_id     text not null,    -- ID del catálogo ej: 'netflix-estandar'
  metodo_pago     text not null,    -- ej: 'ars_mp', 'usd_astropay'
  precio          numeric not null check (precio >= 0),
  moneda          text not null check (moneda in ('ARS', 'USD', 'EUR')),
  votos_ok        integer not null default 1,   -- usuarios confirmaron que es correcto
  votos_desactual integer not null default 0,   -- usuarios reportaron que está desactualizado
  updated_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default now(),
  primary key (servicio_id, metodo_pago)
);

-- Índices
create index if not exists idx_catalogo_servicio
  on public.catalogo_precios_billetera (servicio_id);

-- RLS
alter table public.catalogo_precios_billetera enable row level security;

-- Lectura pública
create policy "Lectura pública de precios de catálogo"
  on public.catalogo_precios_billetera for select
  using (true);

-- Usuarios autenticados pueden insertar/actualizar
create policy "Usuarios autenticados pueden actualizar precios de catálogo"
  on public.catalogo_precios_billetera for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden modificar precios de catálogo"
  on public.catalogo_precios_billetera for update
  to authenticated
  using (true)
  with check (true);

-- Comentarios
comment on table public.catalogo_precios_billetera is
  'Precios actualizados por la comunidad para el catálogo de suscripciones, por método de pago.';
