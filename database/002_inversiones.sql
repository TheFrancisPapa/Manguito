-- ══════════════════════════════════════════════
--  10. TABLA: inversiones
--  Registro de activos (Acciones, CEDEARs, Cripto).
-- ══════════════════════════════════════════════

create table if not exists inversiones (
  id              uuid primary key default uuid_generate_v4(),
  usuario_id      uuid not null references usuarios(id) on delete cascade,

  tipo            text not null check (tipo in ('accion', 'cedear', 'crypto', 'fci', 'otro')),
  nombre          text not null,
  simbolo         text,                         -- Ticker (ej: AAPL, BTC)
  icono           text not null default '📈',    -- Emoji o ícono
  
  cantidad        numeric(18,8) not null check (cantidad > 0),
  precio_compra   numeric(18,4) not null check (precio_compra > 0),
  moneda_compra   text not null default 'USD' check (moneda_compra in ('ARS', 'USD', 'EUR')),
  fecha_compra    date not null default current_date,

  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS
alter table inversiones enable row level security;

create policy "inversiones_own" on inversiones
  for all using (auth.uid() = usuario_id);

-- Trigger updated_at
create trigger trg_inversiones_updated_at
  before update on inversiones
  for each row execute function set_updated_at();

-- Índices
create index if not exists idx_inversiones_usuario
  on inversiones (usuario_id);

comment on table inversiones is 'Cartera de inversiones (acciones, cripto, etc.) del usuario.';
