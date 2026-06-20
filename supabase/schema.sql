-- ================================================================
-- TechSooru — Complete Supabase PostgreSQL Schema (v2.0)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Includes: tables, indexes, RLS, triggers, storage, views, seed data
-- Compatible with: src/data/sampleData.js, all frontend contexts
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
-- Includes all fields from src/data/sampleData.js
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category     TEXT,
  type         TEXT CHECK (type IN ('veg', 'nonveg')),
  emoji        TEXT,
  image_url    TEXT,
  is_popular   BOOLEAN DEFAULT false,
  is_active    BOOLEAN DEFAULT true,
  sort_order   INTEGER DEFAULT 0,

  -- Extra fields from sampleData.js (used by MenuContext, MenuCard, etc.)
  rating       NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  orders_count INTEGER       DEFAULT 0,
  ingredients  TEXT[]        DEFAULT '{}',
  calories     INTEGER       DEFAULT 0,
  prep_time    INTEGER       DEFAULT 10,
  spicy_level  INTEGER       DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 3),
  tags         TEXT[]        DEFAULT '{}',
  meal_time    TEXT[]        DEFAULT '{}',

  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. ORDERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  table_number   INTEGER NOT NULL CHECK (table_number > 0),
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  subtotal       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_id     TEXT,               -- Razorpay payment ID
  payment_status TEXT DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
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
-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Menu
CREATE INDEX IF NOT EXISTS idx_menu_category     ON menu (category);
CREATE INDEX IF NOT EXISTS idx_menu_active       ON menu (is_active);
CREATE INDEX IF NOT EXISTS idx_menu_rating       ON menu (rating DESC);
CREATE INDEX IF NOT EXISTS idx_menu_popular      ON menu (is_popular DESC) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_menu_category_type ON menu (category, type);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

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

DROP TRIGGER IF EXISTS trg_users_updated_at   ON users;
CREATE TRIGGER trg_users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_menu_updated_at    ON menu;
CREATE TRIGGER trg_menu_updated_at    BEFORE UPDATE ON menu    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated_at  ON orders;
CREATE TRIGGER trg_orders_updated_at  BEFORE UPDATE ON orders  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile; admin can read/update all
DROP POLICY IF EXISTS "users_select_own"   ON users;
CREATE POLICY "users_select_own"   ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_select_admin" ON users;
CREATE POLICY "users_select_admin" ON users FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
DROP POLICY IF EXISTS "users_update_own"   ON users;
CREATE POLICY "users_update_own"   ON users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
DROP POLICY IF EXISTS "users_insert_own"   ON users;
CREATE POLICY "users_insert_own"   ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Menu: public read; only admins write
DROP POLICY IF EXISTS "menu_select_public" ON menu;
CREATE POLICY "menu_select_public" ON menu FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "menu_all_admin"     ON menu;
CREATE POLICY "menu_all_admin"     ON menu FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Orders: customers see own; kitchen/admin see all
DROP POLICY IF EXISTS "orders_select_own"   ON orders;
CREATE POLICY "orders_select_own"   ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin')
  );
DROP POLICY IF EXISTS "orders_insert_auth"  ON orders;
CREATE POLICY "orders_insert_auth"  ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "orders_update_staff" ON orders;
CREATE POLICY "orders_update_staff" ON orders FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin'));

-- Order items: follow parent order visibility
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('kitchen', 'admin'))
    )
  );
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------
-- 8. REALTIME PUBLICATIONS
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 9. STORAGE — Buckets and Policies
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('avatars',     'avatars',     true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Menu images: public read
DROP POLICY IF EXISTS "menu_images_select" ON storage.objects;
CREATE POLICY "menu_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

-- Menu images: admin-only write
DROP POLICY IF EXISTS "menu_images_insert" ON storage.objects;
CREATE POLICY "menu_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "menu_images_update" ON storage.objects;
CREATE POLICY "menu_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "menu_images_delete" ON storage.objects;
CREATE POLICY "menu_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Avatars: public read
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Avatars: any authenticated user can upload
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- Users can only update their own avatar (filename: {userId}/avatar.*)
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

-- ----------------------------------------------------------------
-- 10. ADMIN ANALYTICS VIEWS
-- These aggregate live data for the AdminPage dashboard
-- ----------------------------------------------------------------

-- Today's dashboard stats (4 stat cards)
CREATE OR REPLACE VIEW admin_daily_stats AS
SELECT
  CURRENT_DATE                                         AS date,
  COALESCE(SUM(total) FILTER (
    WHERE DATE(created_at) = CURRENT_DATE
      AND payment_status IN ('paid', 'pending')
  ), 0)::NUMERIC(10,2)                                 AS today_revenue,
  COUNT(*) FILTER (
    WHERE DATE(created_at) = CURRENT_DATE
  )::INTEGER                                            AS total_orders_today,
  COUNT(DISTINCT table_number) FILTER (
    WHERE DATE(created_at) = CURRENT_DATE
  )::INTEGER                                            AS active_tables,
  COALESCE(
    AVG(total) FILTER (
      WHERE DATE(created_at) = CURRENT_DATE
        AND payment_status = 'paid'
    ), 0
  )::NUMERIC(10,2)                                      AS avg_order_value,
  COUNT(*) FILTER (
    WHERE status = 'pending'
  )::INTEGER                                            AS pending_orders,
  COUNT(*) FILTER (
    WHERE status = 'preparing'
  )::INTEGER                                            AS preparing_orders,
  COUNT(*) FILTER (
    WHERE status = 'ready'
  )::INTEGER                                            AS ready_orders
FROM orders;

-- Weekly revenue (bar chart)
CREATE OR REPLACE VIEW admin_weekly_revenue AS
SELECT
  to_char(day, 'Dy')                                   AS day,
  COALESCE(orders, 0)::INTEGER                          AS orders,
  COALESCE(revenue, 0)::NUMERIC(10,2)                   AS revenue
FROM generate_series(
  DATE_TRUNC('day', NOW()) - INTERVAL '6 days',
  DATE_TRUNC('day', NOW()),
  '1 day'
) AS day
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::INTEGER  AS orders,
    SUM(total)::NUMERIC(10,2) AS revenue
  FROM orders o
  WHERE DATE(o.created_at) = day::DATE
    AND o.payment_status = 'paid'
) stats ON true
ORDER BY day ASC;

-- Top selling items (bar list)
CREATE OR REPLACE VIEW admin_top_items AS
SELECT
  COALESCE(m.name, oi.name)                            AS name,
  COUNT(*)::INTEGER                                     AS orders,
  SUM(oi.unit_price * oi.quantity)::NUMERIC(10,2)       AS revenue
FROM order_items oi
LEFT JOIN menu m ON oi.menu_id = m.id
JOIN orders o ON oi.order_id = o.id
WHERE o.payment_status = 'paid'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY COALESCE(m.name, oi.name)
ORDER BY orders DESC
LIMIT 10;

-- Category sales distribution (pie chart)
CREATE OR REPLACE VIEW admin_category_sales AS
SELECT
  COALESCE(m.category, 'Other')                        AS name,
  COUNT(*)::INTEGER                                     AS value
FROM order_items oi
LEFT JOIN menu m ON oi.menu_id = m.id
JOIN orders o ON oi.order_id = o.id
WHERE o.payment_status = 'paid'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY COALESCE(m.category, 'Other')
ORDER BY value DESC;

-- Daily orders line chart
CREATE OR REPLACE VIEW admin_daily_orders AS
SELECT
  to_char(day, 'Dy')                                   AS day,
  COALESCE(orders, 0)::INTEGER                          AS orders
FROM generate_series(
  DATE_TRUNC('day', NOW()) - INTERVAL '6 days',
  DATE_TRUNC('day', NOW()),
  '1 day'
) AS day
LEFT JOIN LATERAL (
  SELECT COUNT(*)::INTEGER AS orders
  FROM orders o
  WHERE DATE(o.created_at) = day::DATE
) stats ON true
ORDER BY day ASC;

-- ----------------------------------------------------------------
-- 11. SAMPLE DATA — 24 South Indian Menu Items
-- Matches src/data/sampleData.js exactly
-- ----------------------------------------------------------------
INSERT INTO menu (name, description, price, category, type, emoji, is_popular, sort_order,
                  rating, orders_count, ingredients, calories, prep_time, spicy_level, tags, meal_time) VALUES
  ('Masala Dosa',        'Crispy rice crepe with spiced potato filling',                 89,  'Breakfast',      'veg',    '🥞', true,  1,
   4.8, 342, ARRAY['Rice batter','Potato','Onion','Mustard seeds','Curry leaves'], 206, 12, 1, ARRAY['light','shareable'], ARRAY['breakfast','lunch']),
  ('Idli Sambar',        'Steamed rice cakes with aromatic lentil soup',                 60,  'Breakfast',      'veg',    '🍚', true,  2,
   4.6, 290, ARRAY['Rice','Urad dal','Sambar spices','Vegetables','Tamarind'],      150, 8,  1, ARRAY['light','healthy'],  ARRAY['breakfast']),
  ('Vada Sambar',        'Crispy lentil donuts with sambar & chutney',                   65,  'Breakfast',      'veg',    '🍩', false, 3,
   4.3, 178, ARRAY['Urad dal','Curry leaves','Ginger','Black pepper','Coconut chutney'], 290, 15, 1, ARRAY['shareable','comfort'], ARRAY['breakfast','snack']),
  ('Upma',               'Savory semolina porridge with veggies & tempering',            55,  'Breakfast',      'veg',    '🥣', false, 4,
   4.0, 120, ARRAY['Semolina','Onion','Green chili','Mustard seeds','Peanuts'],     185, 10, 1, ARRAY['light','healthy'],  ARRAY['breakfast']),
  ('Pongal',             'Rice & lentil comfort bowl with pepper & ghee',                70,  'Breakfast',      'veg',    '🍲', true,  5,
   4.7, 256, ARRAY['Rice','Moong dal','Black pepper','Ghee','Cashews'],             240, 15, 0, ARRAY['comfort','healthy'], ARRAY['breakfast']),
  ('Chicken Biryani',    'Fragrant basmati rice with spiced Chettinad chicken',         180, 'Rice & Biryani', 'nonveg', '🍗', true,  6,
   4.9, 485, ARRAY['Basmati rice','Chicken','Saffron','Chettinad spices','Mint'],  490, 25, 2, ARRAY['comfort','spicy'],   ARRAY['lunch','dinner']),
  ('Vegetable Biryani',  'Aromatic rice with garden vegetables & saffron',              140, 'Rice & Biryani', 'veg',    '🌾', false, 7,
   4.2, 160, ARRAY['Basmati rice','Mixed veggies','Saffron','Biryani spices','Mint'], 340, 22, 1, ARRAY['comfort'],          ARRAY['lunch','dinner']),
  ('Curd Rice',          'Cooling yogurt rice with mustard seeds & pomegranate',         80,  'Rice & Biryani', 'veg',    '🍚', false, 8,
   4.4, 195, ARRAY['Rice','Yogurt','Mustard seeds','Pomegranate','Curry leaves'],  210, 8,  0, ARRAY['light','healthy'],  ARRAY['lunch']),
  ('Lemon Rice',         'Tangy rice with mustard seeds & roasted peanuts',              75,  'Rice & Biryani', 'veg',    '🍋', false, 9,
   4.1, 145, ARRAY['Rice','Lemon juice','Peanuts','Turmeric','Mustard seeds'],     230, 10, 0, ARRAY['light'],             ARRAY['lunch']),
  ('Sambar Rice',        'Comfort rice mixed with our signature sambar',                 85,  'Main Course',    'veg',    '🍛', false, 10,
   4.3, 167, ARRAY['Rice','Mixed dal','Tamarind','Drumstick','Sambar powder'],      280, 12, 1, ARRAY['comfort','healthy'], ARRAY['lunch','dinner']),
  ('Rasam Rice',         'Light peppery rasam paired with steamed rice',                 80,  'Main Course',    'veg',    '🥘', false, 11,
   4.2, 134, ARRAY['Rice','Tomato','Tamarind','Black pepper','Rasam powder'],       190, 10, 2, ARRAY['light','spicy','healthy'], ARRAY['lunch','dinner']),
  ('Parotta + Curry',    'Layered flatbread with spicy egg or chicken curry',           110, 'Breads',         'nonveg', '🫓', true,  12,
   4.7, 310, ARRAY['Maida','Egg/Chicken curry','Onion','Tomato','Spices'],           420, 18, 2, ARRAY['comfort','spicy','shareable'], ARRAY['dinner']),
  ('Chapati Set',        '3 soft wheat chapatis with dal & sabzi',                       90,  'Breads',         'veg',    '🫓', false, 13,
   4.1, 108, ARRAY['Whole wheat flour','Dal','Mixed vegetables','Spices'],           320, 15, 1, ARRAY['healthy','comfort'], ARRAY['lunch','dinner']),
  ('Bajji Plate',        'Deep fried onion & banana pepper fritters',                    70,  'Snacks',         'veg',    '🧅', false, 14,
   4.4, 198, ARRAY['Onion','Banana peppers','Besan','Rice flour','Spices'],           310, 12, 1, ARRAY['shareable','comfort'], ARRAY['snack']),
  ('Murukku',            'Traditional crispy rice flour spirals',                        40,  'Snacks',         'veg',    '🌀', false, 15,
   4.0, 88,  ARRAY['Rice flour','Urad dal flour','Sesame seeds','Butter'],            180, 5,  0, ARRAY['shareable','light'], ARRAY['snack']),
  ('Filter Coffee',      'Strong South Indian decoction with frothy milk',               35,  'Beverages',      'veg',    '☕', true,  16,
   4.9, 510, ARRAY['Coffee beans','Fresh milk','Sugar'],                              90,  4,  0, ARRAY['light'],             ARRAY['breakfast','snack']),
  ('Masala Chai',        'Spiced ginger & cardamom tea',                                 30,  'Beverages',      'veg',    '🍵', false, 17,
   4.3, 220, ARRAY['Tea leaves','Ginger','Cardamom','Milk','Sugar'],                  70,  5,  0, ARRAY['light'],             ARRAY['breakfast','snack']),
  ('Mango Lassi',        'Chilled Alphonso mango yogurt drink',                          65,  'Beverages',      'veg',    '🥭', true,  18,
   4.6, 275, ARRAY['Alphonso mango','Yogurt','Sugar','Cardamom'],                     160, 3,  0, ARRAY['light','healthy'],  ARRAY['lunch','dinner','snack']),
  ('Payasam',            'Creamy semolina pudding with cashews & raisins',               75,  'Desserts',       'veg',    '🍮', false, 19,
   4.5, 165, ARRAY['Semolina','Milk','Sugar','Cashews','Raisins','Ghee'],             280, 12, 0, ARRAY['comfort'],          ARRAY['lunch','dinner']),
  ('Kesari',             'Saffron semolina halwa with ghee & nuts',                      60,  'Desserts',       'veg',    '🟡', false, 20,
   4.3, 140, ARRAY['Semolina','Saffron','Ghee','Sugar','Cashews','Cardamom'],         310, 15, 0, ARRAY['comfort'],          ARRAY['dinner']),
  ('Mutton Kuzhambu',    'Slow-cooked mutton in rich Chettinad gravy',                  220, 'Main Course',    'nonveg', '🍖', true,  21,
   4.8, 380, ARRAY['Mutton','Chettinad spices','Coconut','Onion','Tomato'],           520, 30, 3, ARRAY['spicy','comfort'],  ARRAY['dinner']),
  ('Paneer Butter Masala','Creamy tomato gravy with soft paneer cubes',                 160, 'Main Course',    'veg',    '🧀', true,  22,
   4.5, 295, ARRAY['Paneer','Tomato','Butter','Cream','Kashmiri chili'],               380, 20, 1, ARRAY['comfort','shareable'], ARRAY['lunch','dinner']),
  ('Chicken 65',         'Spicy deep-fried chicken bites with curry leaves',             150, 'Snacks',         'nonveg', '🍗', true,  23,
   4.7, 410, ARRAY['Chicken','Yogurt','Red chili','Curry leaves','Ginger-garlic'],     350, 15, 3, ARRAY['spicy','shareable'], ARRAY['snack','dinner']),
  ('Coconut Water',      'Fresh tender coconut water served chilled',                    45,  'Beverages',      'veg',    '🥥', false, 24,
   4.4, 175, ARRAY['Fresh tender coconut'],                                             45,  1,  0, ARRAY['light','healthy'],  ARRAY['breakfast','lunch','snack']);

-- ----------------------------------------------------------------
-- DONE — Connect your app with:
--   VITE_SUPABASE_URL=https://<your-project>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<your-anon-key>
--   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
-- ================================================================
