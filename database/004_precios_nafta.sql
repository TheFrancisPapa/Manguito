-- Crear tabla para precios de combustible actualizados por la comunidad
create table if not exists public.precios_nafta (
  provincia text not null,
  tipo      text not null, -- super, premium, gasoil, gasoil_premium, gnc
  compania  text not null, -- ypf, shell, axion, puma, estaciones_gnc
  precio    numeric not null,
  updated_at timestamptz default now(),
  primary key (provincia, tipo, compania)
);

-- Habilitar RLS
alter table public.precios_nafta enable row level security;

-- Políticas de acceso
-- 1. Lectura pública (cualquiera puede ver los precios)
create policy "Lectura pública de precios de nafta"
  on public.precios_nafta for select
  using (true);

-- 2. Usuarios autenticados pueden insertar o actualizar
create policy "Usuarios autenticados pueden actualizar precios de nafta"
  on public.precios_nafta for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden modificar sus aportes"
  on public.precios_nafta for update
  to authenticated
  using (true)
  with check (true);
