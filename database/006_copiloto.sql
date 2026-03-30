create table if not exists copiloto_mensajes (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  rol         text not null check (rol in ('copiloto', 'usuario')),
  contenido   text not null,
  leido       boolean not null default false,
  trigger_tipo text,  -- 'presupuesto_excedido', 'meta_estancada', etc.
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

alter table copiloto_mensajes enable row level security;
create policy "copiloto_own" on copiloto_mensajes
  for all using (auth.uid() = usuario_id);

create index idx_copiloto_usuario_leido 
  on copiloto_mensajes (usuario_id, leido, created_at desc);
```

**Por qué Supabase y no localStorage:** los mensajes persisten entre dispositivos, y podés acceder a ellos desde el servidor para futuras notificaciones push.

---

### Paso 2: Servicio de detección de triggers

Crear `src/services/copilotoDetector.js`:
```
Función: analizarPresupuestos(presupuestos, movimientos, metas)
  - Retorna array de triggers detectados
  
Triggers a implementar (ordenados por impacto):
  1. PRESUPUESTO_CRÍTICO: porcentaje >= 85% antes del día 20
  2. PRESUPUESTO_EXCEDIDO: porcentaje >= 100%
  3. META_SIN_APORTE: meta activa sin aportes en 30 días
  4. RACHA_GASTOS: 3+ gastos de la misma categoría en 48hs
  5. SALDO_NEGATIVO: gastos > ingresos del mes
```

Cada trigger tiene:
- **Prioridad** (urgente / informativo / celebración)
- **Cooldown** (no molestar por el mismo trigger por X días)
- **Contexto** (datos específicos para personalizar el mensaje IA)

---

### Paso 3: Generador de mensajes IA con tono SDT

Crear `src/services/copilotoMensajes.js`:
```
Para cada trigger, armar un prompt específico para /api/chat con:

SISTEMA: "Sos el Copiloto de Manguito. Tu rol es acompañar, no juzgar.
  Usá un tono cálido, argentino, directo. NUNCA uses las palabras 
  'deberías', 'mal', 'error'. Ofrecé siempre una opción de acción.
  Respondé en máximo 3 oraciones."

USUARIO: "El usuario gastó 87% de su presupuesto de Alimentación 
  ($241.000 de $280.000) y faltan 12 días de mes. Su mayor gasto
  fue 'Super Día' por $67.000 el viernes."
  
→ IA responde algo como: "Ey, tus compras de super del viernes 
  te llevaron al 87% del mes 🛒. Quedan $39K para 12 días —
  tranquilo, es manejable. ¿Querés que te arme una estrategia 
  para la última semana?"
```

El mensaje se guarda en `copiloto_mensajes` y el ícono del chat muestra badge.

---

### Paso 4: Reactivar ChatPage como interfaz del Copiloto

Modificar `src/pages/Chat/index.jsx`:
```
Estructura nueva:
├── Header con "Copiloto 🥭" y badge de no leídos
├── Lista de mensajes (burbujas de chat)
│   ├── Mensajes del copiloto (izquierda, fondo amber)
│   └── Mensajes del usuario (derecha, fondo zinc)
├── Input para responder al copiloto
└── Sugerencias de acciones rápidas
    ├── "Ver mis presupuestos"
    ├── "Aportar a una meta"
    └── "Preguntarle algo al Copiloto"
```

El input libre permite **consultas arbitrarias** al mismo proxy `/api/chat`, pero con el contexto financiero del usuario inyectado en el system prompt.

---

### Paso 5: Integrar detección en el Dashboard

Modificar `src/pages/Dashboard/index.jsx`:
```
Al cargar el Dashboard:
1. useEffect → llamar a analizarPresupuestos()
2. Si hay triggers nuevos → generar mensajes IA en background
3. Guardar en copiloto_mensajes
4. Reemplazar <AlertaGastoCritico> por <BannerCopiloto>
   - En lugar de barra roja con "Excediste el límite"
   - Muestra: "El Copiloto tiene algo para vos → [Ver chat]"
```

El banner es una invitación, no una acusación. El usuario decide si va al chat.

---

### Paso 6: Badge de notificaciones en navegación

Modificar `src/components/layout/BottomNav.jsx` y `Sidebar.jsx`:
```
- Crear hook useCopilotoNoLeidos()
  → SELECT count(*) WHERE leido=false AND usuario_id=...
  → Suscribirse a cambios en tiempo real con supabase.channel()

- Mostrar punto rojo animado en el ícono del chat
  cuando hay mensajes sin leer
```

---

### Paso 7: Hook central `useCopiloto`

Crear `src/hooks/useCopiloto.js`:
```
Expone:
- mensajes: []           → para la vista del chat
- noLeidos: number       → para el badge
- cargando: bool
- enviarMensaje(texto)   → usuario escribe en el chat
- marcarLeido(id)        → al abrir el chat
- analizarAhora()        → trigger manual desde dashboard
```

---

### Orden de implementación recomendado

Así podés ver resultados en cada sprint sin romper lo existente:
```
Sprint 1 (2-3hs):
  ✅ Crear SQL de la tabla
  ✅ Crear copilotoDetector.js con 2 triggers básicos
  ✅ Activar ChatPage con UI básica de burbujas
  
Sprint 2 (2-3hs):
  ✅ Conectar generación de mensajes IA al detector
  ✅ Reemplazar AlertaGastoCritico en Dashboard
  ✅ Badge en BottomNav
  
Sprint 3 (opcional):
  ✅ Input libre para consultas arbitrarias
  ✅ Sugerencias de acciones rápidas
  ✅ Más tipos de triggers (metas, rachas, celebraciones)