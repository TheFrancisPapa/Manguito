// src/hooks/useMercado.js — Hook principal del buscador de precios Mercado
// Maneja búsqueda full-text, precios por producto, carga de precios, y ubicación manual

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Provincias de Argentina ──────────────────────────────────
export const PROVINCIAS_AR = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]

// ── Ciudades principales por provincia (seed inicial) ────────
export const CIUDADES_POR_PROVINCIA = {
  'Corrientes': ['Capital', 'Goya', 'Paso de los Libres', 'Curuzú Cuatiá', 'Mercedes', 'Monte Caseros', 'Esquina', 'Bella Vista', 'Santo Tomé', 'Ituzaingó', "Gobernador Virasoro", "Esquina", "Saladas", "Santa Lucia", "San Luis del Palmar", "Itatí", "Empedrado", "Concepción de Yaguareté Corá"],
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Quilmes', 'Lanús', 'Avellaneda', 'Morón', 'San Isidro', 'Tigre'],
  'CABA': ['CABA'],
  'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'],
  'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto'],
  'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz'],
  'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Banda del Río Salí'],
  'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'],
  'Misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Salta': ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal'],
  'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'San Pedro'],
  'Formosa': ['Formosa', 'Clorinda'],
}

// ── Categorías de productos (macro) ─────────────────────────
export const CATEGORIAS_PRODUCTO = [
  { id: 'bebidas',         nombre: 'Bebidas',           emoji: '🥤' },
  { id: 'comidas',         nombre: 'Comidas',           emoji: '🍔' },
  { id: 'almacen',         nombre: 'Almacén',           emoji: '🏪' },
  { id: 'lacteos',         nombre: 'Lácteos',           emoji: '🥛' },
  { id: 'carnes',          nombre: 'Carnes',            emoji: '🥩' },
  { id: 'verduras_frutas', nombre: 'Verduras y Frutas', emoji: '🥬' },
  { id: 'panaderia',       nombre: 'Panadería',         emoji: '🍞' },
  { id: 'congelados',      nombre: 'Congelados',        emoji: '🧊' },
  { id: 'ropa',            nombre: 'Ropa',              emoji: '👕' },
  { id: 'calzado',         nombre: 'Calzado',           emoji: '👟' },
  { id: 'limpieza',        nombre: 'Limpieza',          emoji: '🧹' },
  { id: 'higiene',         nombre: 'Higiene',           emoji: '🧴' },
  { id: 'electronica',     nombre: 'Electrónica',       emoji: '📱' },
  { id: 'hogar',           nombre: 'Hogar',             emoji: '🏠' },
  { id: 'farmacia',        nombre: 'Farmacia',          emoji: '💊' },
  { id: 'libreria',        nombre: 'Librería',          emoji: '📚' },
  { id: 'otro',            nombre: 'Otro',              emoji: '📦' },
]

// ── Etiquetas detalladas por categoría ──────────────────────
export const ETIQUETAS_POR_CATEGORIA = {
  bebidas: [
    { id: 'agua',             nombre: 'Agua',                    emoji: '💧' },
    { id: 'agua_saborizada',  nombre: 'Agua Saborizada',         emoji: '💧' },
    { id: 'gaseosa',          nombre: 'Gaseosa',                 emoji: '🥤' },
    { id: 'jugo',             nombre: 'Jugo',                    emoji: '🧃' },
    { id: 'jugo_en_polvo',    nombre: 'Jugo en Polvo',           emoji: '🧃' },
    { id: 'cerveza',          nombre: 'Cerveza',                 emoji: '🍺' },
    { id: 'vino',             nombre: 'Vino',                    emoji: '🍷' },
    { id: 'vino_espumante',   nombre: 'Vino Espumante',          emoji: '🥂' },
    { id: 'fernet',           nombre: 'Fernet',                  emoji: '🥃' },
    { id: 'whisky',           nombre: 'Whisky',                  emoji: '🥃' },
    { id: 'vodka',            nombre: 'Vodka',                   emoji: '🥃' },
    { id: 'gin',              nombre: 'Gin',                     emoji: '🍸' },
    { id: 'licor',            nombre: 'Licor',                   emoji: '🍹' },
    { id: 'energizante',      nombre: 'Energizante',             emoji: '⚡' },
    { id: 'isotonica',        nombre: 'Bebida Isotónica',        emoji: '💪' },
    { id: 'mate_cocido',      nombre: 'Mate Cocido',             emoji: '🧉' },
    { id: 'te',               nombre: 'Té',                      emoji: '🍵' },
    { id: 'cafe',             nombre: 'Café',                    emoji: '☕' },
    { id: 'leche_chocolatada',nombre: 'Leche Chocolatada',       emoji: '🍫' },
    { id: 'soda',             nombre: 'Soda',                    emoji: '🫧' },
    { id: 'otra_bebida',      nombre: 'Otra Bebida',             emoji: '🍶' },
  ],
  comidas: [
    { id: 'hamburguesa',      nombre: 'Hamburguesa',             emoji: '🍔' },
    { id: 'hamburguesa_papas',nombre: 'Hamburguesa + Papas',     emoji: '🍔🍟' },
    { id: 'milanesa',         nombre: 'Milanesa',                emoji: '🥩' },
    { id: 'milanesa_papas',   nombre: 'Milanesa + Papas',        emoji: '🥩🍟' },
    { id: 'pizza',            nombre: 'Pizza',                   emoji: '🍕' },
    { id: 'empanada',         nombre: 'Empanada',                emoji: '🥟' },
    { id: 'lomito',           nombre: 'Lomito',                  emoji: '🥖' },
    { id: 'lomito_papas',     nombre: 'Lomito + Papas',          emoji: '🥖🍟' },
    { id: 'pancho',           nombre: 'Pancho',                  emoji: '🌭' },
    { id: 'sanguche',         nombre: 'Sánguche/Sándwich',       emoji: '🥪' },
    { id: 'sanguche_papas',   nombre: 'Sánguche/Sándwich + Papas', emoji: '🥪🍟' },
    { id: 'wrap',             nombre: 'Wrap',                    emoji: '🌯' },
    { id: 'ensalada',         nombre: 'Ensalada',                emoji: '🥗' },
    { id: 'papas_fritas',     nombre: 'Papas Fritas',            emoji: '🍟' },
    { id: 'nuggets',          nombre: 'Nuggets',                 emoji: '🍗' },
    { id: 'pollo_asado',      nombre: 'Pollo Asado',             emoji: '🍗' },
    { id: 'asado',            nombre: 'Asado',                   emoji: '🥩' },
    { id: 'choripan',         nombre: 'Choripán',                emoji: '🌭' },
    { id: 'sushi',            nombre: 'Sushi',                   emoji: '🍣' },
    { id: 'pasta',            nombre: 'Pasta / Fideos',          emoji: '🍝' },
    { id: 'tarta',            nombre: 'Tarta',                   emoji: '🥧' },
    { id: 'guiso',            nombre: 'Guiso',                   emoji: '🍲' },
    { id: 'postre',           nombre: 'Postre',                  emoji: '🍨' },
    { id: 'helado',           nombre: 'Helado',                  emoji: '🍦' },
    { id: 'medialunas',       nombre: 'Medialunas',              emoji: '🥐' },
    { id: 'facturas',         nombre: 'Facturas',                emoji: '🧁' },
    { id: 'torta',            nombre: 'Torta',                   emoji: '🎂' },
    { id: 'otra_comida',      nombre: 'Otra Comida',             emoji: '🍽️' },
  ],
  ropa: [
    { id: 'remera_corta',     nombre: 'Remera Manga Corta',      emoji: '👕' },
    { id: 'remera_larga',     nombre: 'Remera Manga Larga',      emoji: '👕' },
    { id: 'remera_oversize',  nombre: 'Remera Oversize',         emoji: '👕' },
    { id: 'musculosa',        nombre: 'Musculosa',               emoji: '🎽' },
    { id: 'campera',          nombre: 'Campera',                 emoji: '🧥' },
    { id: 'buzo',             nombre: 'Buzo',                    emoji: '🧥' },
    { id: 'hoodie',           nombre: 'Hoodie / Canguro',        emoji: '🧥' },
    { id: 'camisa',           nombre: 'Camisa',                  emoji: '👔' },
    { id: 'jean',             nombre: 'Jean',                    emoji: '👖' },
    { id: 'pantalon',         nombre: 'Pantalón',                emoji: '👖' },
    { id: 'short',            nombre: 'Short / Bermuda',         emoji: '🩳' },
    { id: 'calza',            nombre: 'Calza',                   emoji: '👖' },
    { id: 'jogger',           nombre: 'Jogger',                  emoji: '👖' },
    { id: 'vestido',          nombre: 'Vestido',                 emoji: '👗' },
    { id: 'pollera',          nombre: 'Pollera / Falda',         emoji: '👗' },
    { id: 'traje_bano',       nombre: 'Traje de Baño',           emoji: '👙' },
    { id: 'ropa_interior',    nombre: 'Ropa Interior',           emoji: '🩲' },
    { id: 'medias',           nombre: 'Medias',                  emoji: '🧦' },
    { id: 'gorra',            nombre: 'Gorra / Sombrero',        emoji: '🧢' },
    { id: 'conjunto_dep',     nombre: 'Conjunto Deportivo',      emoji: '🏃' },
    { id: 'otra_ropa',        nombre: 'Otra Ropa',               emoji: '👚' },
  ],
  calzado: [
    { id: 'zapatilla_urbana', nombre: 'Zapatilla Urbana',        emoji: '👟' },
    { id: 'zapatilla_dep',    nombre: 'Zapatilla Deportiva',     emoji: '👟' },
    { id: 'bota',             nombre: 'Bota',                    emoji: '🥾' },
    { id: 'sandalia',         nombre: 'Sandalia',                emoji: '👡' },
    { id: 'ojota',            nombre: 'Ojota / Chancleta',       emoji: '🩴' },
    { id: 'zapato',           nombre: 'Zapato',                  emoji: '👞' },
    { id: 'otro_calzado',     nombre: 'Otro Calzado',            emoji: '👠' },
  ],
  almacen: [
    { id: 'arroz',            nombre: 'Arroz',                   emoji: '🍚' },
    { id: 'fideos',           nombre: 'Fideos',                  emoji: '🍝' },
    { id: 'aceite',           nombre: 'Aceite',                  emoji: '🫒' },
    { id: 'azucar',           nombre: 'Azúcar',                  emoji: '🍬' },
    { id: 'yerba',            nombre: 'Yerba',                   emoji: '🧉' },
    { id: 'harina',           nombre: 'Harina',                  emoji: '🌾' },
    { id: 'galletitas',       nombre: 'Galletitas',              emoji: '🍪' },
    { id: 'cereales',         nombre: 'Cereales',                emoji: '🥣' },
    { id: 'mermelada',        nombre: 'Mermelada',               emoji: '🍯' },
    { id: 'dulce_leche',      nombre: 'Dulce de Leche',          emoji: '🥛' },
    { id: 'conserva',         nombre: 'Conserva / Lata',         emoji: '🥫' },
    { id: 'condimento',       nombre: 'Condimento',              emoji: '🧂' },
    { id: 'salsa',            nombre: 'Salsa',                   emoji: '🍅' },
    { id: 'snack',            nombre: 'Snack / Papas',           emoji: '🍿' },
    { id: 'chocolate',        nombre: 'Chocolate / Golosina',    emoji: '🍫' },
    { id: 'otro_almacen',     nombre: 'Otro Almacén',            emoji: '🏪' },
  ],
  lacteos: [
    { id: 'leche',            nombre: 'Leche',                   emoji: '🥛' },
    { id: 'yogur',            nombre: 'Yogur',                   emoji: '🥛' },
    { id: 'queso',            nombre: 'Queso',                   emoji: '🧀' },
    { id: 'manteca',          nombre: 'Manteca',                 emoji: '🧈' },
    { id: 'crema',            nombre: 'Crema',                   emoji: '🥛' },
    { id: 'otro_lacteo',      nombre: 'Otro Lácteo',             emoji: '🥛' },
  ],
  carnes: [
    { id: 'carne_vacuna',     nombre: 'Carne Vacuna',            emoji: '🥩' },
    { id: 'pollo',            nombre: 'Pollo',                   emoji: '🍗' },
    { id: 'cerdo',            nombre: 'Cerdo',                   emoji: '🥓' },
    { id: 'pescado',          nombre: 'Pescado',                 emoji: '🐟' },
    { id: 'fiambre',          nombre: 'Fiambre / Embutido',      emoji: '🥓' },
    { id: 'otra_carne',       nombre: 'Otra Carne',              emoji: '🥩' },
  ],
  verduras_frutas: [
    { id: 'verdura',          nombre: 'Verdura',                 emoji: '🥬' },
    { id: 'fruta',            nombre: 'Fruta',                   emoji: '🍎' },
    { id: 'otro_vf',          nombre: 'Otro',                    emoji: '🥕' },
  ],
  panaderia: [
    { id: 'pan',              nombre: 'Pan',                     emoji: '🍞' },
    { id: 'facturas_pan',     nombre: 'Facturas',                emoji: '🥐' },
    { id: 'torta_pan',        nombre: 'Torta / Budín',           emoji: '🎂' },
    { id: 'otro_pan',         nombre: 'Otro Panadería',          emoji: '🍞' },
  ],
  congelados: [
    { id: 'congelado',        nombre: 'Congelado',               emoji: '🧊' },
  ],
  limpieza: [
    { id: 'detergente',       nombre: 'Detergente',              emoji: '🧴' },
    { id: 'lavandina',        nombre: 'Lavandina',               emoji: '🧹' },
    { id: 'limpia_pisos',     nombre: 'Limpia Pisos',            emoji: '🧹' },
    { id: 'otro_limpieza',    nombre: 'Otro Limpieza',           emoji: '🧹' },
  ],
  higiene: [
    { id: 'shampoo',          nombre: 'Shampoo',                 emoji: '🧴' },
    { id: 'jabon',            nombre: 'Jabón',                   emoji: '🧼' },
    { id: 'desodorante',      nombre: 'Desodorante',             emoji: '🧴' },
    { id: 'papel_higienico',  nombre: 'Papel Higiénico',         emoji: '🧻' },
    { id: 'otro_higiene',     nombre: 'Otro Higiene',            emoji: '🧴' },
  ],
  electronica: [
    { id: 'celular',          nombre: 'Celular',                 emoji: '📱' },
    { id: 'auricular',        nombre: 'Auricular',               emoji: '🎧' },
    { id: 'cargador',         nombre: 'Cargador',                emoji: '🔌' },
    { id: 'otro_electro',     nombre: 'Otro Electrónica',        emoji: '📱' },
  ],
  hogar: [
    { id: 'articulo_hogar',   nombre: 'Artículo Hogar',          emoji: '🏠' },
  ],
  farmacia: [
    { id: 'medicamento',      nombre: 'Medicamento',             emoji: '💊' },
    { id: 'otro_farmacia',    nombre: 'Otro Farmacia',           emoji: '💊' },
  ],
  libreria: [
    { id: 'cuaderno',         nombre: 'Cuaderno',                emoji: '📓' },
    { id: 'lapicera',         nombre: 'Lapicera / Lápiz',        emoji: '✏️' },
    { id: 'otro_libreria',    nombre: 'Otro Librería',           emoji: '📚' },
  ],
  otro: [
    { id: 'otro_gen',         nombre: 'Otro',                    emoji: '📦' },
  ],
}

// ── Locales conocidos en Corrientes (iremos sumando) ────────
export const LOCALES_CORRIENTES = [
  // ── Supermax ──
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Junín 1637',                      ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Av. 3 de Abril 1047',                ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Av. Sarmiento 2525',                 ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Av. Maipú 359',                     ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Av. Gdor. Pujol 1929',              ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'San Juan 902',                      ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Supermax',            tipo: 'supermercado', direccion: 'Carlos Pellegrini 767',               ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Impulso ──
  { nombre: 'Impulso',             tipo: 'supermercado', direccion: 'Av. Pedro Ferré',                   ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Impulso',             tipo: 'supermercado', direccion: 'Tucumán 1236',                      ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Impulso',             tipo: 'supermercado', direccion: 'Paraguay 997',                      ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Impulso',             tipo: 'supermercado', direccion: 'Av. Maipú 628',                     ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Impulso',             tipo: 'supermercado', direccion: 'Hipólito Yrigoyen',                 ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Parada Canga ──
  { nombre: 'Parada Canga',        tipo: 'supermercado', direccion: 'Belgrano 2215',                     ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Parada Canga',        tipo: 'supermercado', direccion: 'Av. Raúl Alfonsín 3496',            ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Parada Canga',        tipo: 'supermercado', direccion: 'Av. Raúl Alfonsín 5094',            ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Parada Canga',        tipo: 'supermercado', direccion: 'Av. Reg. Cazadores Correntinos 4370', ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Parada Canga',        tipo: 'supermercado', direccion: 'Av. Independencia 5444',            ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Carrefour ──
  { nombre: 'Carrefour Hiper',     tipo: 'supermercado', direccion: 'Av. Pedro Ferré 2985',              ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Carrefour Market',    tipo: 'supermercado', direccion: 'Junín 1336',                        ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── ChangoMás ──
  { nombre: 'Hiper ChangoMás (24h)', tipo: 'supermercado', direccion: 'Gregorio Pomar 840',             ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'ChangoMás',           tipo: 'supermercado', direccion: 'Av. Maipú 2803',                   ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Makro ──
  { nombre: 'Makro',               tipo: 'mayorista',    direccion: 'Ruta Provincial N° 5, Km 0.5',     ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Diarco ──
  { nombre: 'Diarco',              tipo: 'mayorista',    direccion: 'Colectora RN 12',                  ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── HiperCucher ──
  { nombre: 'HiperCucher',         tipo: 'mayorista',    direccion: 'Colectora RN 12',                  ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Facor Express Mayorista ──
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Av. 3 de Abril 1068',              ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Junín 1102',                       ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Paraguay 501',                     ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Gutenberg 2251',                   ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Av. Sarmiento 2016',               ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Av. Libertad 5291',                ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Express',       tipo: 'mayorista',    direccion: 'Av. Maipú 3224',                   ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Facor Mayorista ──
  { nombre: 'Facor Mayorista',     tipo: 'mayorista',    direccion: 'Av. Reg. Cazadores Correntinos 3550', ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Mayorista',     tipo: 'mayorista',    direccion: 'RP5 Km 0.4',                       ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Facor Mayorista',     tipo: 'mayorista',    direccion: 'Av. Maipú 6580',                   ciudad: 'Corrientes', provincia: 'Corrientes' },
  // ── Full 24 ──
  { nombre: 'Full 24',             tipo: 'kiosco',       direccion: 'Brasil 999',                       ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Full 24',             tipo: 'kiosco',       direccion: 'Hipólito Yrigoyen 1801',           ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Full 24',             tipo: 'kiosco',       direccion: '9 de Julio y Uruguay',               ciudad: 'Corrientes', provincia: 'Corrientes' },
  { nombre: 'Full 24',             tipo: 'kiosco',       direccion: 'Hipólito Yrigoyen 2499',           ciudad: 'Corrientes', provincia: 'Corrientes' },
  
]

// ── Tipos de comercio ───────────────────────────────────────
export const TIPOS_COMERCIO = [
  { id: 'supermercado', nombre: 'Supermercado',  emoji: '🛒' },
  { id: 'mayorista',    nombre: 'Mayorista',     emoji: '📦' },
  { id: 'kiosco',       nombre: 'Kiosco',        emoji: '🏪' },
  { id: 'almacen',      nombre: 'Almacén',       emoji: '🏬' },
  { id: 'verduleria',   nombre: 'Verdulería',    emoji: '🥬' },
  { id: 'farmacia',     nombre: 'Farmacia',      emoji: '💊' },
  { id: 'tienda_ropa',  nombre: 'Tienda de Ropa', emoji: '👕' },
  { id: 'libreria',     nombre: 'Librería',      emoji: '📚' },
  { id: 'ferreteria',   nombre: 'Ferretería',    emoji: '🔧' },
  { id: 'electronica',  nombre: 'Electrónica',   emoji: '📱' },
  { id: 'otro',         nombre: 'Otro',          emoji: '🏷️' },
]

const STORAGE_KEY_UBICACION = 'manguito_mercado_ubicacion'

// ── Hook de ubicación manual ─────────────────────────────────
export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_UBICACION)
      if (guardado) return JSON.parse(guardado)
    } catch {}
    return { provincia: 'Corrientes', ciudad: 'Corrientes' }
  })

  const cambiarUbicacion = useCallback((provincia, ciudad) => {
    const nueva = { provincia, ciudad }
    setUbicacion(nueva)
    try { localStorage.setItem(STORAGE_KEY_UBICACION, JSON.stringify(nueva)) } catch {}
  }, [])

  return { ubicacion, cambiarUbicacion }
}

// ── Hook principal de búsqueda ───────────────────────────────
export function useBusqueda() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const buscar = useCallback(async (texto, ciudad = null, provincia = null) => {
    if (!texto || texto.trim().length < 2) {
      setResultados([])
      return
    }

    setCargando(true)
    setError(null)

    try {
      const { data, error: err } = await supabase.rpc('buscar_productos', {
        p_query: texto.trim(),
        p_ciudad: ciudad,
        p_provincia: provincia,
        p_limite: 20,
      })

      if (err) throw err
      setResultados(data || [])
    } catch (e) {
      console.error('Error buscando productos:', e)
      setError('Error al buscar. Intentá de nuevo.')
      setResultados([])
    } finally {
      setCargando(false)
    }
  }, [])

  // Búsqueda con debounce
  const buscarConDebounce = useCallback((texto, ciudad, provincia) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery(texto)

    if (!texto || texto.trim().length < 2) {
      setResultados([])
      setCargando(false)
      return
    }

    setCargando(true)
    debounceRef.current = setTimeout(() => {
      buscar(texto, ciudad, provincia)
    }, 350)
  }, [buscar])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return { query, setQuery, resultados, cargando, error, buscar, buscarConDebounce }
}

// ── Hook para precios de un producto ─────────────────────────
export function usePreciosProducto(productoId, ciudad, provincia) {
  const [precios, setPrecios] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    if (!productoId) return

    setCargando(true)
    try {
      const { data, error } = await supabase.rpc('precios_producto_en_ciudad', {
        p_producto_id: productoId,
        p_ciudad: ciudad || null,
        p_provincia: provincia || null,
      })

      if (error) throw error
      setPrecios(data || [])
    } catch (e) {
      console.error('Error cargando precios:', e)
    } finally {
      setCargando(false)
    }
  }, [productoId, ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { precios, cargando, recargar: cargar }
}

// ── Funciones de escritura (requieren auth) ──────────────────

export async function crearComercio({ nombre, tipo, direccion, ciudad, provincia, cadena }) {
  const { data, error } = await supabase
    .from('comercios')
    .insert({
      nombre: nombre.trim(),
      tipo,
      direccion: direccion?.trim() || null,
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      cadena: cadena?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function crearProducto({ nombre, marca, categoria, subcategoria, presentacion }) {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: nombre.trim(),
      marca: marca.trim(),
      categoria,
      subcategoria: subcategoria?.trim() || null,
      presentacion: presentacion?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reportarPrecio({ productoId, comercioId, precio, enOferta = false, precioOferta = null, esRetornable = false }) {
  const { data, error } = await supabase
    .from('precios_productos')
    .upsert({
      producto_id: productoId,
      comercio_id: comercioId,
      precio: Number(precio),
      en_oferta: enOferta,
      precio_oferta: precioOferta ? Number(precioOferta) : null,
      es_retornable: esRetornable,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'producto_id,comercio_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function votarPrecio(precioId, tipoVoto) {
  const campo = tipoVoto === 'ok' ? 'votos_ok' : 'votos_desactual'

  // Leer valor actual
  const { data: actual } = await supabase
    .from('precios_productos')
    .select(campo)
    .eq('id', precioId)
    .single()

  if (!actual) return

  const { error } = await supabase
    .from('precios_productos')
    .update({ [campo]: (actual[campo] || 0) + 1 })
    .eq('id', precioId)

  if (error) throw error
}

// ── Hook para listar comercios ───────────────────────────────
export function useComercios(ciudad, provincia) {
  const [comercios, setComercios] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      let q = supabase.from('comercios').select('*').order('nombre')
      if (ciudad) q = q.eq('ciudad', ciudad)
      if (provincia) q = q.eq('provincia', provincia)

      const { data, error } = await q
      if (error) throw error
      setComercios(data || [])
    } catch (e) {
      console.error('Error cargando comercios:', e)
    } finally {
      setCargando(false)
    }
  }, [ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { comercios, cargando, recargar: cargar }
}

// ── Hook para productos populares ────────────────────────────
export function usePopulares(ciudad, provincia) {
  const [populares, setPopulares] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase.rpc('productos_populares', {
        p_ciudad: ciudad || null,
        p_provincia: provincia || null,
        p_limite: 8,
      })
      if (error) throw error
      setPopulares(data || [])
    } catch (e) {
      console.error('Error cargando populares:', e)
    } finally {
      setCargando(false)
    }
  }, [ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { populares, cargando }
}

// ── Helpers ──────────────────────────────────────────────────
export function fmtPrecio(n) {
  if (!n && n !== 0) return '—'
  return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function tiempoDesde(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias}d`
  return new Date(isoStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
