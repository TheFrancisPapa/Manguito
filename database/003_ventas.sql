-- ══════════════════════════════════════════════
--  11. TABLA: ventas
--  Registro de salidas de la cartera (venta de activos).
-- ══════════════════════════════════════════════

create table if not exists ventas (
  id              uuid primary key default uuid_generate_v4(),
  usuario_id      uuid not null references usuarios(id) on delete cascade,
  inversion_id    uuid references inversiones(id) on delete set null,

  cantidad        numeric(18,8) not null check (cantidad > 0),
  precio_venta    numeric(18,4) not null check (precio_venta > 0),
  moneda_venta    text not null default 'USD' check (moneda_venta in ('ARS', 'USD', 'EUR')),
  
  -- Para el cálculo de rentabilidad al momento de la venta
  precio_compra_ref numeric(18,4) not null check (precio_compra_ref > 0),
  moneda_compra_ref text not null default 'USD' check (moneda_compra_ref in ('ARS', 'USD', 'EUR')),
  
  fecha_venta     date not null default current_date,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS
alter table ventas enable row level security;

create policy "ventas_own" on ventas
  for all using (auth.uid() = usuario_id);

-- Trigger updated_at
create or replace trigger trg_ventas_updated_at
  before update on ventas
  for each row execute function set_updated_at();

-- Índices
create index if not exists idx_ventas_usuario
  on ventas (usuario_id);

create index if not exists idx_ventas_inversion
  on ventas (inversion_id);

comment on table ventas is 'Registro de ventas de activos del portafolio del usuario.';
