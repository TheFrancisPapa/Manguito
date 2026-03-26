// ============================================================
//  Manguito 🥭 — schema.js
//  Definición central de todas las tablas de Supabase.
//
//  USO:
//    1. Abrí el SQL Editor en tu proyecto de Supabase.
//    2. Ejecutá las secciones en orden: EXTENSIONS → TABLES →
//       INDEXES → RLS → FUNCTIONS → TRIGGERS → SEED.
//    3. Cada vez que modifiques algo, creá un nuevo archivo
//       en database/version/ (ej: 002_add_recurrencia.sql).
// ============================================================


// ─────────────────────────────────────────────
//  EXPORTACIÓN JS — importá esto en tu código
//  para tener los nombres de tablas y campos
//  en un solo lugar (evita typos).
// ─────────────────────────────────────────────

export const TABLES = {
    USUARIOS: 'usuarios',
    CATEGORIAS: 'categorias',
    MOVIMIENTOS: 'movimientos',
    PRESUPUESTOS: 'presupuestos',
    METAS: 'metas',
}

export const TIPO_MOVIMIENTO = {
    INGRESO: 'ingreso',
    GASTO: 'gasto',
}

export const PERIODO_PRESUPUESTO = {
    MENSUAL: 'mensual',
    ANUAL: 'anual',
}

export const ESTADO_META = {
    ACTIVA: 'activa',
    COMPLETADA: 'completada',
    PAUSADA: 'pausada',
    CANCELADA: 'cancelada',
}

export const RECURRENCIA = {
    DIARIA: 'diaria',
    SEMANAL: 'semanal',
    MENSUAL: 'mensual',
    ANUAL: 'anual',
}


// ─────────────────────────────────────────────
//  SQL COMPLETO — pegá esto en Supabase
//  SQL Editor y ejecutalo todo junto.
// ─────────────────────────────────────────────

export const SQL_SCHEMA = /* sql */ `

-- ══════════════════════════════════════════════
--  0. EXTENSIONES
-- ══════════════════════════════════════════════

-- UUID v4 para todas las PKs
create extension if not exists "uuid-ossp";


-- ══════════════════════════════════════════════
--  1. TABLA: usuarios
--  Supabase maneja auth (email/password/OAuth).
--  Acá solo guardamos los datos extra del perfil.
-- ══════════════════════════════════════════════

create table if not exists usuarios (
  -- PK vinculada 1:1 con auth.users de Supabase
  id              uuid primary key references auth.users(id) on delete cascade,

  nombre          text        not null,
  fecha_nacimiento date,                          -- nullable: el registro no se rompe si falta
  email           text        not null unique,
  moneda          text        not null default 'ARS',   -- ARS, USD, EUR…
  plan            text        not null default 'basico' check (plan in ('basico', 'pro')),
  avatar_url      text,
  onboarding_ok   boolean     not null default false,   -- ¿completó el tour inicial?
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  usuarios                is 'Perfil extendido de cada usuario de Manguito.';
comment on column usuarios.onboarding_ok  is 'true cuando el usuario completó el onboarding inicial.';
comment on column usuarios.moneda         is 'Código ISO 4217 de la moneda preferida del usuario.';


-- ══════════════════════════════════════════════
--  2. TABLA: categorias
--  Cada usuario tiene sus propias categorías.
--  Las categorías default se cargan vía seed.
-- ══════════════════════════════════════════════

create table if not exists categorias (
  id          uuid        primary key default uuid_generate_v4(),
  usuario_id  uuid        not null references usuarios(id) on delete cascade,

  nombre      text        not null,
  tipo        text        not null check (tipo in ('ingreso', 'gasto')),
  icono       text        not null default '📦',   -- emoji o nombre de ícono
  color       text        not null default '#F59E0B', -- hex para la UI
  es_default  boolean     not null default false,  -- categoría de arranque

  created_at  timestamptz not null default now(),

  -- Un usuario no puede tener dos categorías con el mismo nombre y tipo
  unique (usuario_id, nombre, tipo)
);

comment on table  categorias            is 'Categorías de ingresos y gastos por usuario.';
comment on column categorias.es_default is 'true en las categorías que se crean automáticamente al registrarse.';


-- ══════════════════════════════════════════════
--  3. TABLA: movimientos
--  El corazón de Manguito: cada peso que entra
--  o sale queda registrado acá.
-- ══════════════════════════════════════════════

create table if not exists movimientos (
  id            uuid        primary key default uuid_generate_v4(),
  usuario_id    uuid        not null references usuarios(id)   on delete cascade,
  categoria_id  uuid        not null references categorias(id) on delete restrict,

  tipo          text        not null check (tipo in ('ingreso', 'gasto')),
  monto         numeric(14,2) not null check (monto > 0),
  descripcion   text,
  fecha         date        not null default current_date,

  -- Movimientos recurrentes (alquiler, sueldo, etc.)
  es_recurrente boolean     not null default false,
  recurrencia   text        check (
                  recurrencia is null or
                  recurrencia in ('diaria', 'semanal', 'mensual', 'anual')
                ),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Si es recurrente debe tener definida la frecuencia
  constraint recurrencia_consistente check (
    (es_recurrente = false) or
    (es_recurrente = true and recurrencia is not null)
  )
);

comment on table  movimientos               is 'Registro de todos los ingresos y gastos del usuario.';
comment on column movimientos.monto         is 'Siempre positivo. El campo tipo (ingreso/gasto) determina el signo.';
comment on column movimientos.es_recurrente is 'true si el movimiento se repite periódicamente.';


-- ══════════════════════════════════════════════
--  4. TABLA: presupuestos
--  Límite de gasto por categoría y período.
--  La app avisa cuando el usuario se acerca al límite.
-- ══════════════════════════════════════════════

create table if not exists presupuestos (
  id            uuid        primary key default uuid_generate_v4(),
  usuario_id    uuid        not null references usuarios(id)   on delete cascade,
  categoria_id  uuid        not null references categorias(id) on delete cascade,

  limite_monto  numeric(14,2) not null check (limite_monto > 0),
  periodo       text        not null check (periodo in ('mensual', 'anual')),
  mes           smallint    check (mes between 1 and 12),   -- null si es anual
  anio          smallint    not null,

  -- % del límite a partir del cual se muestra alerta (ej: 80 → avisa al 80%)
  alerta_pct    smallint    not null default 80
                            check (alerta_pct between 1 and 100),
  activo        boolean     not null default true,

  created_at    timestamptz not null default now(),

  -- Un presupuesto por categoría/período/mes/año
  unique (usuario_id, categoria_id, periodo, mes, anio)
);

comment on table  presupuestos            is 'Límites de gasto por categoría y período.';
comment on column presupuestos.alerta_pct is 'Porcentaje del límite que dispara la notificación de alerta.';
comment on column presupuestos.mes        is 'Solo aplica cuando periodo = mensual. null para presupuestos anuales.';


-- ══════════════════════════════════════════════
--  5. TABLA: metas
--  Objetivos de ahorro con seguimiento de progreso.
-- ══════════════════════════════════════════════

create table if not exists metas (
  id              uuid        primary key default uuid_generate_v4(),
  usuario_id      uuid        not null references usuarios(id) on delete cascade,

  nombre          text        not null,
  descripcion     text,
  monto_objetivo  numeric(14,2) not null check (monto_objetivo > 0),
  monto_actual    numeric(14,2) not null default 0
                              check (monto_actual >= 0),
  fecha_limite    date,       -- null = sin plazo
  icono           text        not null default '🎯',
  color           text        not null default '#10B981',
  estado          text        not null default 'activa'
                              check (estado in ('activa', 'completada', 'pausada', 'cancelada')),
  prioridad       smallint    not null default 1
                              check (prioridad between 1 and 5),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- El progreso no puede superar el objetivo
  constraint progreso_valido check (monto_actual <= monto_objetivo)
);

comment on table  metas               is 'Metas de ahorro del usuario con seguimiento de progreso.';
comment on column metas.monto_actual  is 'Monto acumulado hacia la meta. Se actualiza manualmente o via depósitos.';
comment on column metas.prioridad     is '1 = más importante, 5 = menos importante.';


-- ══════════════════════════════════════════════
--  6. ÍNDICES — aceleran las consultas más comunes
-- ══════════════════════════════════════════════

-- Movimientos: filtrar por usuario + fecha (el más frecuente)
create index if not exists idx_movimientos_usuario_fecha
  on movimientos (usuario_id, fecha desc);

-- Movimientos: filtrar por categoría
create index if not exists idx_movimientos_categoria
  on movimientos (categoria_id);

-- Presupuestos activos del usuario
create index if not exists idx_presupuestos_usuario_activo
  on presupuestos (usuario_id, activo);

-- Metas activas del usuario
create index if not exists idx_metas_usuario_estado
  on metas (usuario_id, estado);


-- ══════════════════════════════════════════════
--  7. ROW LEVEL SECURITY (RLS)
--  Cada usuario solo puede ver y modificar SUS datos.
--  Esto se enforcea a nivel de base de datos —
--  aunque alguien robe una API key, no puede ver
--  datos de otro usuario.
-- ══════════════════════════════════════════════

alter table usuarios     enable row level security;
alter table categorias   enable row level security;
alter table movimientos  enable row level security;
alter table presupuestos enable row level security;
alter table metas        enable row level security;

-- Usuarios: solo puede ver/editar su propio perfil
create policy "usuario_own" on usuarios
  for all using (auth.uid() = id);

-- Categorías: solo las propias
create policy "categorias_own" on categorias
  for all using (auth.uid() = usuario_id);

-- Movimientos: solo los propios
create policy "movimientos_own" on movimientos
  for all using (auth.uid() = usuario_id);

-- Presupuestos: solo los propios
create policy "presupuestos_own" on presupuestos
  for all using (auth.uid() = usuario_id);

-- Metas: solo las propias
create policy "metas_own" on metas
  for all using (auth.uid() = usuario_id);


-- ══════════════════════════════════════════════
--  8. FUNCIONES Y TRIGGERS
-- ══════════════════════════════════════════════

-- Actualiza updated_at automáticamente en cada UPDATE
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_usuarios_updated_at
  before update on usuarios
  for each row execute function set_updated_at();

create trigger trg_movimientos_updated_at
  before update on movimientos
  for each row execute function set_updated_at();

create trigger trg_metas_updated_at
  before update on metas
  for each row execute function set_updated_at();


-- ─────────────────────────────────────────────
--  FUNCIÓN ÚTIL: balance del usuario
--  Calcula ingresos, gastos y saldo neto de un
--  rango de fechas. Llamala desde tu app así:
--
--  const { data } = await supabase.rpc('balance_usuario', {
--    p_desde: '2025-01-01',
--    p_hasta: '2025-01-31'
--  })
-- ─────────────────────────────────────────────

create or replace function balance_usuario(
  p_desde date default date_trunc('month', current_date),
  p_hasta date default current_date
)
returns table (
  total_ingresos numeric,
  total_gastos   numeric,
  saldo_neto     numeric
)
language sql security definer as $$
  select
    coalesce(sum(case when tipo = 'ingreso' then monto end), 0) as total_ingresos,
    coalesce(sum(case when tipo = 'gasto'   then monto end), 0) as total_gastos,
    coalesce(sum(case when tipo = 'ingreso' then monto
                      when tipo = 'gasto'   then -monto end), 0) as saldo_neto
  from movimientos
  where usuario_id = auth.uid()
    and fecha between p_desde and p_hasta;
$$;


-- ─────────────────────────────────────────────
--  RPC: evolucion_mensual
--  Devuelve ingresos y gastos agrupados por mes.
-- ─────────────────────────────────────────────
create or replace function evolucion_mensual(p_meses integer default 6)
returns table (
  mes      text,
  ingresos numeric,
  gastos   numeric
)
language sql security definer set search_path = public as $$
  with meses as (
    select to_char(date_trunc('month', current_date - (i || ' months')::interval), 'YYYY-MM') as mes
    from generate_series(0, p_meses - 1) as i
  )
  select
    m.mes,
    coalesce(sum(case when mov.tipo = 'ingreso' then mov.monto end), 0) as ingresos,
    coalesce(sum(case when mov.tipo = 'gasto'   then mov.monto end), 0) as gastos
  from meses m
  left join movimientos mov
    on to_char(date_trunc('month', mov.fecha), 'YYYY-MM') = m.mes
   and mov.usuario_id = auth.uid()
  group by m.mes
  order by m.mes asc;
$$;


-- ─────────────────────────────────────────────
--  RPC: presupuestos_mes_actual
--  Devuelve el límite y cuánto se gastó en el mes
--  en curso para las categorías con presupuesto activo.
-- ─────────────────────────────────────────────
create or replace function presupuestos_mes_actual()
returns table (
  id           uuid,
  categoria_id uuid,
  nombre       text,
  icono        text,
  color        text,
  limite_monto numeric,
  alerta_pct   smallint,
  gastado      numeric
)
language sql security definer set search_path = public as $$
  select
    p.id,
    c.id as categoria_id,
    c.nombre,
    c.icono,
    c.color,
    p.limite_monto,
    p.alerta_pct,
    coalesce(sum(m.monto), 0) as gastado
  from presupuestos p
  join categorias c on c.id = p.categoria_id
  left join movimientos m
    on m.categoria_id = p.categoria_id
   and m.usuario_id = p.usuario_id
   and m.tipo = 'gasto'
   and m.fecha >= date_trunc('month', current_date)
   and m.fecha <  date_trunc('month', current_date) + interval '1 month'
  where p.usuario_id = auth.uid()
    and p.activo = true
    -- Mensual del mes activo, o anual del año activo.
    and (
      (p.periodo = 'mensual' and p.mes = extract(month from current_date) and p.anio = extract(year from current_date))
      or
      (p.periodo = 'anual' and p.anio = extract(year from current_date))
    )
  group by p.id, c.id, c.nombre, c.icono, c.color, p.limite_monto, p.alerta_pct
  order by (coalesce(sum(m.monto), 0) / p.limite_monto) desc;
$$;


-- ══════════════════════════════════════════════
--  9. SEED — categorías default
--  Se llama desde database/seed/run_seed.js
--  después de que el usuario se registra.
--  (No ejecutes esto en el SQL Editor,
--   es para tu código JS.)
-- ══════════════════════════════════════════════

-- Ver: database/seed/categorias.js

`;


// ─────────────────────────────────────────────
//  CATEGORÍAS DEFAULT
//  Se insertan automáticamente cuando un usuario
//  nuevo completa el registro.
//  Importá esta constante en run_seed.js
// ─────────────────────────────────────────────

export const CATEGORIAS_DEFAULT = [
    // ── GASTOS ──────────────────────────────────
    { nombre: 'Alimentación', tipo: 'gasto', icono: '🛒', color: '#F59E0B', es_default: true },
    { nombre: 'Transporte', tipo: 'gasto', icono: '🚗', color: '#3B82F6', es_default: true },
    { nombre: 'Vivienda', tipo: 'gasto', icono: '🏠', color: '#8B5CF6', es_default: true },
    { nombre: 'Salud', tipo: 'gasto', icono: '💊', color: '#EF4444', es_default: true },
    { nombre: 'Educación', tipo: 'gasto', icono: '📚', color: '#06B6D4', es_default: true },
    { nombre: 'Entretenimiento', tipo: 'gasto', icono: '🎬', color: '#EC4899', es_default: true },
    { nombre: 'Ropa', tipo: 'gasto', icono: '👕', color: '#F97316', es_default: true },
    { nombre: 'Servicios', tipo: 'gasto', icono: '💡', color: '#84CC16', es_default: true },
    { nombre: 'Otros gastos', tipo: 'gasto', icono: '📦', color: '#6B7280', es_default: true },

    // ── INGRESOS ────────────────────────────────
    { nombre: 'Sueldo', tipo: 'ingreso', icono: '💰', color: '#10B981', es_default: true },
    { nombre: 'Freelance', tipo: 'ingreso', icono: '💻', color: '#059669', es_default: true },
    { nombre: 'Inversiones', tipo: 'ingreso', icono: '📈', color: '#047857', es_default: true },
    { nombre: 'Otros ingresos', tipo: 'ingreso', icono: '✨', color: '#6EE7B7', es_default: true },
]