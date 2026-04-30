-- ══════════════════════════════════════════════
--  SEED: Mercado — Datos iniciales
--  Comercios de Corrientes + Productos populares
--  Ejecutar DESPUÉS de 007_mercado.sql
-- ══════════════════════════════════════════════


-- ══════════════════════════════════════════════
--  1. COMERCIOS — Cadenas conocidas de Corrientes
-- ══════════════════════════════════════════════

INSERT INTO public.comercios (nombre, tipo, direccion, ciudad, provincia, cadena, verificado) VALUES
  -- Supermercados grandes
  ('Carrefour Corrientes Centro',     'supermercado', 'Junín 1399',                'Corrientes', 'Corrientes', 'Carrefour',  true),
  ('Carrefour Corrientes Av. Ferré',  'supermercado', 'Av. Ferré 2800',            'Corrientes', 'Corrientes', 'Carrefour',  true),
  ('Impulso Corrientes Centro',       'supermercado', 'Catamarca 1050',             'Corrientes', 'Corrientes', 'Impulso',    true),
  ('Impulso Corrientes Shopping',     'supermercado', 'Av. Maipú 2200',             'Corrientes', 'Corrientes', 'Impulso',    true),
  ('Supermax Corrientes',             'supermercado', 'Av. Independencia 3500',     'Corrientes', 'Corrientes', 'Supermax',   true),
  ('Canga Corrientes Centro',         'supermercado', 'San Lorenzo 980',            'Corrientes', 'Corrientes', 'Canga',      true),
  ('Canga Corrientes Av. Cazadores',  'supermercado', 'Av. Cazadores Correntinos 4100', 'Corrientes', 'Corrientes', 'Canga', true),
  -- Mayoristas
  ('Maxiconsumo Corrientes',          'mayorista',    'Ruta 12 Km 5',              'Corrientes', 'Corrientes', 'Maxiconsumo', true),
  ('Diarco Corrientes',               'mayorista',    'Av. Maipú 3800',            'Corrientes', 'Corrientes', 'Diarco',     true),
  ('Vital Corrientes',                'mayorista',    'Av. 3 de Abril 2950',       'Corrientes', 'Corrientes', 'Vital',      true),
  -- Autoservicio / Almacén
  ('Almacén Don Pedro',               'almacen',      'Pellegrini 800',            'Corrientes', 'Corrientes', NULL,          false),
  ('Autoservicio La Esquina',         'almacen',      'Bolívar y San Martín',      'Corrientes', 'Corrientes', NULL,          false)
ON CONFLICT DO NOTHING;


-- ══════════════════════════════════════════════
--  2. PRODUCTOS — Artículos populares de góndola
-- ══════════════════════════════════════════════

INSERT INTO public.productos (nombre, marca, categoria, subcategoria, presentacion) VALUES
  -- Almacén
  ('Nesquik Cacao en Polvo',            'Nesquik',       'almacen',    'Cacao',       '400g'),
  ('Nesquik Cacao en Polvo',            'Nesquik',       'almacen',    'Cacao',       '800g'),
  ('Arroz Gallo Oro Largo Fino',        'Gallo',         'almacen',    'Arroz',       '1kg'),
  ('Arroz Lucchetti Largo Fino',        'Lucchetti',     'almacen',    'Arroz',       '1kg'),
  ('Fideos Matarazzo Spaghetti',        'Matarazzo',     'almacen',    'Fideos',      '500g'),
  ('Fideos Lucchetti Tirabuzón',        'Lucchetti',     'almacen',    'Fideos',      '500g'),
  ('Aceite Cocinero Girasol',           'Cocinero',      'almacen',    'Aceite',      '1.5L'),
  ('Aceite Natura Girasol',             'Natura',        'almacen',    'Aceite',      '1.5L'),
  ('Azúcar Ledesma Clásica',           'Ledesma',       'almacen',    'Azúcar',      '1kg'),
  ('Harina Pureza 000',                'Pureza',        'almacen',    'Harina',      '1kg'),
  ('Yerba Mate Taragüí Con Palo',      'Taragüí',       'almacen',    'Yerba',       '1kg'),
  ('Yerba Mate Playadito',             'Playadito',     'almacen',    'Yerba',       '1kg'),
  ('Yerba Mate Rosamonte',             'Rosamonte',     'almacen',    'Yerba',       '1kg'),
  ('Yerba Mate Amanda',                'Amanda',        'almacen',    'Yerba',       '1kg'),
  ('Sal Fina Celusal',                 'Celusal',       'almacen',    'Sal',         '500g'),
  ('Galletitas Pepitos',               'Pepitos',       'almacen',    'Galletitas',  '354g'),
  ('Galletitas Oreo',                  'Oreo',          'almacen',    'Galletitas',  '351g'),
  ('Galletitas Toddy',                 'Toddy',         'almacen',    'Galletitas',  '126g'),
  ('Mermelada BC La Campagnola',       'La Campagnola', 'almacen',    'Mermelada',   '454g'),
  ('Dulce de Leche La Serenísima',     'La Serenísima', 'almacen',    'Dulce',       '400g'),
  ('Atún Gomes da Costa en Aceite',    'Gomes da Costa','almacen',    'Enlatados',   '170g'),
  -- Bebidas
  ('Coca-Cola',                         'Coca-Cola',     'bebidas',    'Gaseosas',    '2.25L'),
  ('Coca-Cola',                         'Coca-Cola',     'bebidas',    'Gaseosas',    '500ml'),
  ('Pepsi',                             'Pepsi',         'bebidas',    'Gaseosas',    '2.25L'),
  ('Sprite',                            'Sprite',        'bebidas',    'Gaseosas',    '2.25L'),
  ('Fanta Naranja',                     'Fanta',         'bebidas',    'Gaseosas',    '2.25L'),
  ('Agua Mineral Villavicencio',        'Villavicencio', 'bebidas',    'Agua',        '1.5L'),
  ('Cerveza Quilmes Cristal',           'Quilmes',       'bebidas',    'Cerveza',     '1L'),
  ('Cerveza Brahma',                    'Brahma',        'bebidas',    'Cerveza',     '1L'),
  -- Lácteos
  ('Leche Entera La Serenísima',       'La Serenísima', 'lacteos',    'Leche',       '1L'),
  ('Leche Entera SanCor',             'SanCor',        'lacteos',    'Leche',       '1L'),
  ('Yogur Ser Bebible Frutilla',       'Ser',           'lacteos',    'Yogur',       '1kg'),
  ('Queso Cremoso La Paulina',         'La Paulina',    'lacteos',    'Queso',       'por kg'),
  ('Manteca La Serenísima',           'La Serenísima', 'lacteos',    'Manteca',     '200g'),
  -- Limpieza
  ('Detergente Magistral',             'Magistral',     'limpieza',   'Detergente',  '500ml'),
  ('Lavandina Ayudín',                 'Ayudín',        'limpieza',   'Lavandina',   '1L'),
  ('Jabón en Polvo Skip',              'Skip',          'limpieza',   'Jabón',       '800g'),
  ('Papel Higiénico Elegante',         'Elegante',      'limpieza',   'Papel',       '4 rollos'),
  -- Higiene
  ('Shampoo Head & Shoulders',         'Head & Shoulders','higiene',  'Shampoo',     '375ml'),
  ('Jabón de Tocador Rexona',          'Rexona',        'higiene',    'Jabón',       '3x125g'),
  ('Pasta Dental Colgate Triple Acción','Colgate',      'higiene',    'Dental',      '90g'),
  ('Desodorante Rexona Men',           'Rexona',        'higiene',    'Desodorante', '150ml'),
  -- Carnes (precio referencia por kg)
  ('Asado de Tira',                     'Carnicería',    'carnes',     'Vacuna',      'por kg'),
  ('Vacío',                             'Carnicería',    'carnes',     'Vacuna',      'por kg'),
  ('Pollo Entero',                      'Avícola',       'carnes',     'Pollo',       'por kg'),
  ('Milanesa de Pollo',                 'Avícola',       'carnes',     'Pollo',       'por kg'),
  -- Verduras y Frutas
  ('Tomate Redondo',                    'Verdulería',    'verduras_frutas', 'Verdura', 'por kg'),
  ('Papa',                              'Verdulería',    'verduras_frutas', 'Verdura', 'por kg'),
  ('Cebolla',                           'Verdulería',    'verduras_frutas', 'Verdura', 'por kg'),
  ('Banana',                            'Verdulería',    'verduras_frutas', 'Fruta',   'por kg'),
  ('Manzana Roja',                      'Verdulería',    'verduras_frutas', 'Fruta',   'por kg'),
  -- Panadería
  ('Pan Francés',                       'Panadería',     'panaderia',  'Pan',         'por kg'),
  ('Pan Lactal Bimbo',                  'Bimbo',         'panaderia',  'Pan',         '350g'),
  ('Facturas Surtidas',                 'Panadería',     'panaderia',  'Facturas',    'docena')
ON CONFLICT DO NOTHING;


-- ══════════════════════════════════════════════
--  3. PRECIOS — Datos iniciales de referencia
--  Precios aproximados para que la app no esté vacía.
--  La comunidad los actualiza después.
-- ══════════════════════════════════════════════

-- Helper: insertar precio vinculando producto y comercio por nombre
-- Nota: Ejecutar esto DESPUÉS de las inserciones de arriba

INSERT INTO public.precios_productos (producto_id, comercio_id, precio, en_oferta)
SELECT p.id, c.id, precios.precio, precios.oferta
FROM (VALUES
  -- Nesquik 400g en varios comercios
  ('Nesquik Cacao en Polvo', '400g', 'Carrefour Corrientes Centro',    4890, false),
  ('Nesquik Cacao en Polvo', '400g', 'Impulso Corrientes Centro',      5150, false),
  ('Nesquik Cacao en Polvo', '400g', 'Canga Corrientes Centro',        4750, false),
  ('Nesquik Cacao en Polvo', '400g', 'Supermax Corrientes',            5290, false),
  ('Nesquik Cacao en Polvo', '400g', 'Maxiconsumo Corrientes',         4350, false),
  -- Coca-Cola 2.25L
  ('Coca-Cola',              '2.25L', 'Carrefour Corrientes Centro',   3490, false),
  ('Coca-Cola',              '2.25L', 'Impulso Corrientes Centro',     3650, false),
  ('Coca-Cola',              '2.25L', 'Canga Corrientes Centro',       3390, true),
  ('Coca-Cola',              '2.25L', 'Maxiconsumo Corrientes',        3100, false),
  ('Coca-Cola',              '2.25L', 'Diarco Corrientes',             3050, false),
  -- Yerba Taragüí 1kg
  ('Yerba Mate Taragüí Con Palo', '1kg', 'Carrefour Corrientes Centro', 4200, false),
  ('Yerba Mate Taragüí Con Palo', '1kg', 'Impulso Corrientes Centro',   4350, false),
  ('Yerba Mate Taragüí Con Palo', '1kg', 'Canga Corrientes Centro',     4100, false),
  ('Yerba Mate Taragüí Con Palo', '1kg', 'Maxiconsumo Corrientes',      3800, false),
  ('Yerba Mate Taragüí Con Palo', '1kg', 'Supermax Corrientes',         4450, false),
  -- Arroz Gallo 1kg
  ('Arroz Gallo Oro Largo Fino', '1kg', 'Carrefour Corrientes Centro',  2190, false),
  ('Arroz Gallo Oro Largo Fino', '1kg', 'Impulso Corrientes Centro',    2350, false),
  ('Arroz Gallo Oro Largo Fino', '1kg', 'Canga Corrientes Centro',      2100, true),
  ('Arroz Gallo Oro Largo Fino', '1kg', 'Maxiconsumo Corrientes',       1950, false),
  -- Leche La Serenísima 1L
  ('Leche Entera La Serenísima', '1L', 'Carrefour Corrientes Centro',   1690, false),
  ('Leche Entera La Serenísima', '1L', 'Impulso Corrientes Centro',     1750, false),
  ('Leche Entera La Serenísima', '1L', 'Canga Corrientes Centro',       1650, false),
  ('Leche Entera La Serenísima', '1L', 'Supermax Corrientes',           1790, false),
  -- Fideos Matarazzo 500g
  ('Fideos Matarazzo Spaghetti', '500g', 'Carrefour Corrientes Centro', 1890, false),
  ('Fideos Matarazzo Spaghetti', '500g', 'Impulso Corrientes Centro',   2050, false),
  ('Fideos Matarazzo Spaghetti', '500g', 'Maxiconsumo Corrientes',      1650, false),
  -- Aceite Cocinero 1.5L
  ('Aceite Cocinero Girasol',    '1.5L', 'Carrefour Corrientes Centro', 3990, false),
  ('Aceite Cocinero Girasol',    '1.5L', 'Impulso Corrientes Centro',   4150, false),
  ('Aceite Cocinero Girasol',    '1.5L', 'Maxiconsumo Corrientes',      3650, false),
  ('Aceite Cocinero Girasol',    '1.5L', 'Canga Corrientes Centro',     3890, true),
  -- Detergente Magistral 500ml
  ('Detergente Magistral',       '500ml','Carrefour Corrientes Centro',  1590, false),
  ('Detergente Magistral',       '500ml','Impulso Corrientes Centro',    1690, false),
  ('Detergente Magistral',       '500ml','Canga Corrientes Centro',      1550, false),
  -- Cerveza Quilmes 1L
  ('Cerveza Quilmes Cristal',    '1L',   'Carrefour Corrientes Centro',  2290, false),
  ('Cerveza Quilmes Cristal',    '1L',   'Maxiconsumo Corrientes',       1990, false),
  ('Cerveza Quilmes Cristal',    '1L',   'Diarco Corrientes',            2050, false)
) AS precios(producto_nombre, producto_pres, comercio_nombre, precio, oferta)
JOIN public.productos p ON p.nombre = precios.producto_nombre AND p.presentacion = precios.producto_pres
JOIN public.comercios c ON c.nombre = precios.comercio_nombre
ON CONFLICT (producto_id, comercio_id) DO UPDATE SET
  precio = EXCLUDED.precio,
  en_oferta = EXCLUDED.en_oferta,
  updated_at = now();
