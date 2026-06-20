-- ================================================================
-- TechSooru — Complete Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  role       TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'kitchen', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. MENU
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category    TEXT,
  type        TEXT CHECK (type IN ('veg', 'nonveg')),
  emoji       TEXT,
  image_url   TEXT,
  is_popular  BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. ORDERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  table_number INTEGER NOT NULL CHECK (table_number > 0),
  status       TEXT DEFAULT 'pending'
               CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  subtotal     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_id   TEXT,               -- Razorpay payment ID
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. ORDER ITEMS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id    UUID REFERENCES menu(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,       -- snapshot of name at order time
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal   NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 5. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_user_id    ON orders (user_id);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_menu_category     ON menu (category);
CREATE INDEX idx_menu_active       ON menu (is_active);

-- ----------------------------------------------------------------
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_menu_updated_at    BEFORE UPDATE ON menu    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at  BEFORE UPDATE ON orders  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Menu: public read; only admins write
CREATE POLICY "menu_select_public"   ON menu FOR SELECT USING (is_active = true);
CREATE POLICY "menu_all_admin" ON menu FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Orders: customers see own; kitchen/admin see all
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin')
  );
CREATE POLICY "orders_insert_auth" ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "orders_update_staff" ON orders FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin'));

-- Order items follow parent order
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin'))
    )
  );
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------
-- 8. REALTIME PUBLICATIONS
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- ----------------------------------------------------------------
-- 9. SAMPLE DATA — 20 South Indian Menu Items
-- ----------------------------------------------------------------
INSERT INTO menu (name, description, price, category, type, emoji, is_popular, sort_order) VALUES
  ('Masala Dosa',        'Crispy rice crepe with spiced potato filling',              89,  'Breakfast',      'veg',    '🥞', true,  1),
  ('Idli Sambar',        'Steamed rice cakes with aromatic lentil soup',             60,  'Breakfast',      'veg',    '🍚', true,  2),
  ('Vada Sambar',        'Crispy lentil donuts with sambar & chutney',              65,  'Breakfast',      'veg',    '🍩', false, 3),
  ('Upma',               'Savory semolina porridge with veggies & tempering',        55,  'Breakfast',      'veg',    '🥣', false, 4),
  ('Pongal',             'Rice & lentil comfort bowl with pepper & ghee',            70,  'Breakfast',      'veg',    '🍲', true,  5),
  ('Chicken Biryani',    'Fragrant basmati rice with spiced Chettinad chicken',     180, 'Rice & Biryani', 'nonveg', '🍗', true,  6),
  ('Vegetable Biryani',  'Aromatic rice with garden vegetables & saffron',          140, 'Rice & Biryani', 'veg',    '🌾', false, 7),
  ('Curd Rice',          'Cooling yogurt rice with mustard seeds & pomegranate',     80,  'Rice & Biryani', 'veg',    '🍚', false, 8),
  ('Lemon Rice',         'Tangy rice with mustard seeds & roasted peanuts',          75,  'Rice & Biryani', 'veg',    '🍋', false, 9),
  ('Sambar Rice',        'Comfort rice mixed with our signature sambar',             85,  'Main Course',    'veg',    '🍛', false, 10),
  ('Rasam Rice',         'Light peppery rasam paired with steamed rice',             80,  'Main Course',    'veg',    '🥘', false, 11),
  ('Parotta + Curry',    'Layered flatbread with spicy egg or chicken curry',       110, 'Breads',         'nonveg', '🫓', true,  12),
  ('Chapati Set',        '3 soft wheat chapatis with dal & sabzi',                   90,  'Breads',         'veg',    '🫓', false, 13),
  ('Bajji Plate',        'Deep fried onion & banana pepper fritters',                70,  'Snacks',         'veg',    '🧅', false, 14),
  ('Murukku',            'Traditional crispy rice flour spirals',                    40,  'Snacks',         'veg',    '🌀', false, 15),
  ('Filter Coffee',      'Strong South Indian decoction with frothy milk',           35,  'Beverages',      'veg',    '☕', true,  16),
  ('Masala Chai',        'Spiced ginger & cardamom tea',                             30,  'Beverages',      'veg',    '🍵', false, 17),
  ('Mango Lassi',        'Chilled Alphonso mango yogurt drink',                      65,  'Beverages',      'veg',    '🥭', true,  18),
  ('Payasam',            'Creamy semolina pudding with cashews & raisins',           75,  'Desserts',       'veg',    '🍮', false, 19),
  ('Kesari',             'Saffron semolina halwa with ghee & nuts',                  60,  'Desserts',       'veg',    '🟡', false, 20);

-- ----------------------------------------------------------------
-- DONE — Connect your app with:
--   VITE_SUPABASE_URL=https://<your-project>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<your-anon-key>
-- ================================================================
