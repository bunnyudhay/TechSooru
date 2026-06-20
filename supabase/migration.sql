-- ================================================================
-- TechSooru — Migration 001: Schema fixes, indexes, RLS, storage, views
-- Run this AFTER the base schema.sql on an existing database
-- Idempotent: safe to run multiple times
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1: Add 8 missing menu columns (from src/data/sampleData.js)
-- All columns have DEFAULT values so existing rows are unaffected
-- ----------------------------------------------------------------
ALTER TABLE menu ADD COLUMN IF NOT EXISTS rating       NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE menu ADD COLUMN IF NOT EXISTS orders_count INTEGER       DEFAULT 0;
ALTER TABLE menu ADD COLUMN IF NOT EXISTS ingredients  TEXT[]        DEFAULT '{}';
ALTER TABLE menu ADD COLUMN IF NOT EXISTS calories     INTEGER       DEFAULT 0;
ALTER TABLE menu ADD COLUMN IF NOT EXISTS prep_time    INTEGER       DEFAULT 10;
ALTER TABLE menu ADD COLUMN IF NOT EXISTS spicy_level  INTEGER       DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 3);
ALTER TABLE menu ADD COLUMN IF NOT EXISTS tags         TEXT[]        DEFAULT '{}';
ALTER TABLE menu ADD COLUMN IF NOT EXISTS meal_time    TEXT[]        DEFAULT '{}';


-- ----------------------------------------------------------------
-- STEP 2: Fix payment_status default
-- 🔴 Critical: DEFAULT 'paid' was incorrect — new orders should
--    start as 'pending' until Razorpay confirms payment
-- ----------------------------------------------------------------
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';


-- ----------------------------------------------------------------
-- STEP 3: Add missing indexes
-- ----------------------------------------------------------------
-- Email lookups during auth / user management
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Chef's picks / popular item sorting
CREATE INDEX IF NOT EXISTS idx_menu_rating ON menu (rating DESC);

-- Filtered query for popular items (HomePage)
CREATE INDEX IF NOT EXISTS idx_menu_popular ON menu (is_popular DESC) WHERE is_popular = true;

-- Combined category + type filter (MenuPage filter chips)
CREATE INDEX IF NOT EXISTS idx_menu_category_type ON menu (category, type);

-- Payment status queries (admin analytics / refund flows)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);


-- ----------------------------------------------------------------
-- STEP 4: Add missing RLS policies
-- ----------------------------------------------------------------
-- Admin can list all users (user management)
DROP POLICY IF EXISTS "users_select_admin" ON users;
CREATE POLICY "users_select_admin" ON users FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Admin can update any user (role changes, etc.)
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');


-- ----------------------------------------------------------------
-- STEP 5: Create storage buckets and policies
-- Requires: Storage extension enabled in Supabase project
-- ----------------------------------------------------------------

-- Create buckets
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

-- Users can only update their own avatar (filename pattern: {userId}/avatar.*)
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );


-- ----------------------------------------------------------------
-- STEP 6: Create admin analytics views
-- These aggregate live data for the AdminPage dashboard
-- Charts reference: src/pages/AdminPage.jsx lines 20-43
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

-- Weekly revenue (bar chart: src/pages/AdminPage.jsx line 120-132)
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

-- Top selling items (bar list: src/pages/AdminPage.jsx line 256-278)
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

-- Category sales distribution (pie chart: src/pages/AdminPage.jsx line 282-297)
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

-- Daily orders line chart (src/pages/AdminPage.jsx line 300-317)
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
-- STEP 7: Populate new menu columns from sampleData.js
-- Updates the 20 seeded menu items with rating, ingredients, etc.
-- ----------------------------------------------------------------
UPDATE menu SET
  rating       = CASE name
    WHEN 'Masala Dosa'        THEN 4.8 WHEN 'Idli Sambar'        THEN 4.6
    WHEN 'Vada Sambar'        THEN 4.3 WHEN 'Upma'               THEN 4.0
    WHEN 'Pongal'             THEN 4.7 WHEN 'Chicken Biryani'    THEN 4.9
    WHEN 'Vegetable Biryani'  THEN 4.2 WHEN 'Curd Rice'          THEN 4.4
    WHEN 'Lemon Rice'         THEN 4.1 WHEN 'Sambar Rice'        THEN 4.3
    WHEN 'Rasam Rice'         THEN 4.2 WHEN 'Parotta + Curry'    THEN 4.7
    WHEN 'Chapati Set'        THEN 4.1 WHEN 'Bajji Plate'        THEN 4.4
    WHEN 'Murukku'            THEN 4.0 WHEN 'Filter Coffee'      THEN 4.9
    WHEN 'Masala Chai'        THEN 4.3 WHEN 'Mango Lassi'        THEN 4.6
    WHEN 'Payasam'            THEN 4.5 WHEN 'Kesari'             THEN 4.3
  END,
  orders_count = CASE name
    WHEN 'Masala Dosa'        THEN 342 WHEN 'Idli Sambar'        THEN 290
    WHEN 'Vada Sambar'        THEN 178 WHEN 'Upma'               THEN 120
    WHEN 'Pongal'             THEN 256 WHEN 'Chicken Biryani'    THEN 485
    WHEN 'Vegetable Biryani'  THEN 160 WHEN 'Curd Rice'          THEN 195
    WHEN 'Lemon Rice'         THEN 145 WHEN 'Sambar Rice'        THEN 167
    WHEN 'Rasam Rice'         THEN 134 WHEN 'Parotta + Curry'    THEN 310
    WHEN 'Chapati Set'        THEN 108 WHEN 'Bajji Plate'        THEN 198
    WHEN 'Murukku'            THEN 88  WHEN 'Filter Coffee'      THEN 510
    WHEN 'Masala Chai'        THEN 220 WHEN 'Mango Lassi'        THEN 275
    WHEN 'Payasam'            THEN 165 WHEN 'Kesari'             THEN 140
  END,
  ingredients  = CASE name
    WHEN 'Masala Dosa'        THEN ARRAY['Rice batter','Potato','Onion','Mustard seeds','Curry leaves']
    WHEN 'Idli Sambar'        THEN ARRAY['Rice','Urad dal','Sambar spices','Vegetables','Tamarind']
    WHEN 'Vada Sambar'        THEN ARRAY['Urad dal','Curry leaves','Ginger','Black pepper','Coconut chutney']
    WHEN 'Upma'               THEN ARRAY['Semolina','Onion','Green chili','Mustard seeds','Peanuts']
    WHEN 'Pongal'             THEN ARRAY['Rice','Moong dal','Black pepper','Ghee','Cashews']
    WHEN 'Chicken Biryani'    THEN ARRAY['Basmati rice','Chicken','Saffron','Chettinad spices','Mint']
    WHEN 'Vegetable Biryani'  THEN ARRAY['Basmati rice','Mixed veggies','Saffron','Biryani spices','Mint']
    WHEN 'Curd Rice'          THEN ARRAY['Rice','Yogurt','Mustard seeds','Pomegranate','Curry leaves']
    WHEN 'Lemon Rice'         THEN ARRAY['Rice','Lemon juice','Peanuts','Turmeric','Mustard seeds']
    WHEN 'Sambar Rice'        THEN ARRAY['Rice','Mixed dal','Tamarind','Drumstick','Sambar powder']
    WHEN 'Rasam Rice'         THEN ARRAY['Rice','Tomato','Tamarind','Black pepper','Rasam powder']
    WHEN 'Parotta + Curry'    THEN ARRAY['Maida','Egg/Chicken curry','Onion','Tomato','Spices']
    WHEN 'Chapati Set'        THEN ARRAY['Whole wheat flour','Dal','Mixed vegetables','Spices']
    WHEN 'Bajji Plate'        THEN ARRAY['Onion','Banana peppers','Besan','Rice flour','Spices']
    WHEN 'Murukku'            THEN ARRAY['Rice flour','Urad dal flour','Sesame seeds','Butter']
    WHEN 'Filter Coffee'      THEN ARRAY['Coffee beans','Fresh milk','Sugar']
    WHEN 'Masala Chai'        THEN ARRAY['Tea leaves','Ginger','Cardamom','Milk','Sugar']
    WHEN 'Mango Lassi'        THEN ARRAY['Alphonso mango','Yogurt','Sugar','Cardamom']
    WHEN 'Payasam'            THEN ARRAY['Semolina','Milk','Sugar','Cashews','Raisins','Ghee']
    WHEN 'Kesari'             THEN ARRAY['Semolina','Saffron','Ghee','Sugar','Cashews','Cardamom']
  END,
  calories     = CASE name
    WHEN 'Masala Dosa'        THEN 206 WHEN 'Idli Sambar'        THEN 150
    WHEN 'Vada Sambar'        THEN 290 WHEN 'Upma'               THEN 185
    WHEN 'Pongal'             THEN 240 WHEN 'Chicken Biryani'    THEN 490
    WHEN 'Vegetable Biryani'  THEN 340 WHEN 'Curd Rice'          THEN 210
    WHEN 'Lemon Rice'         THEN 230 WHEN 'Sambar Rice'        THEN 280
    WHEN 'Rasam Rice'         THEN 190 WHEN 'Parotta + Curry'    THEN 420
    WHEN 'Chapati Set'        THEN 320 WHEN 'Bajji Plate'        THEN 310
    WHEN 'Murukku'            THEN 180 WHEN 'Filter Coffee'      THEN 90
    WHEN 'Masala Chai'        THEN 70  WHEN 'Mango Lassi'        THEN 160
    WHEN 'Payasam'            THEN 280 WHEN 'Kesari'             THEN 310
  END,
  prep_time    = CASE name
    WHEN 'Masala Dosa'        THEN 12  WHEN 'Idli Sambar'        THEN 8
    WHEN 'Vada Sambar'        THEN 15  WHEN 'Upma'               THEN 10
    WHEN 'Pongal'             THEN 15  WHEN 'Chicken Biryani'    THEN 25
    WHEN 'Vegetable Biryani'  THEN 22  WHEN 'Curd Rice'          THEN 8
    WHEN 'Lemon Rice'         THEN 10  WHEN 'Sambar Rice'        THEN 12
    WHEN 'Rasam Rice'         THEN 10  WHEN 'Parotta + Curry'    THEN 18
    WHEN 'Chapati Set'        THEN 15  WHEN 'Bajji Plate'        THEN 12
    WHEN 'Murukku'            THEN 5   WHEN 'Filter Coffee'      THEN 4
    WHEN 'Masala Chai'        THEN 5   WHEN 'Mango Lassi'        THEN 3
    WHEN 'Payasam'            THEN 12  WHEN 'Kesari'             THEN 15
  END,
  spicy_level  = CASE name
    WHEN 'Masala Dosa'        THEN 1  WHEN 'Idli Sambar'        THEN 1
    WHEN 'Vada Sambar'        THEN 1  WHEN 'Upma'               THEN 1
    WHEN 'Pongal'             THEN 0  WHEN 'Chicken Biryani'    THEN 2
    WHEN 'Vegetable Biryani'  THEN 1  WHEN 'Curd Rice'          THEN 0
    WHEN 'Lemon Rice'         THEN 0  WHEN 'Sambar Rice'        THEN 1
    WHEN 'Rasam Rice'         THEN 2  WHEN 'Parotta + Curry'    THEN 2
    WHEN 'Chapati Set'        THEN 1  WHEN 'Bajji Plate'        THEN 1
    WHEN 'Murukku'            THEN 0  WHEN 'Filter Coffee'      THEN 0
    WHEN 'Masala Chai'        THEN 0  WHEN 'Mango Lassi'        THEN 0
    WHEN 'Payasam'            THEN 0  WHEN 'Kesari'             THEN 0
  END,
  tags         = CASE name
    WHEN 'Masala Dosa'        THEN ARRAY['light','shareable']                WHEN 'Idli Sambar'        THEN ARRAY['light','healthy']
    WHEN 'Vada Sambar'        THEN ARRAY['shareable','comfort']              WHEN 'Upma'               THEN ARRAY['light','healthy']
    WHEN 'Pongal'             THEN ARRAY['comfort','healthy']                WHEN 'Chicken Biryani'    THEN ARRAY['comfort','spicy']
    WHEN 'Vegetable Biryani'  THEN ARRAY['comfort']                          WHEN 'Curd Rice'          THEN ARRAY['light','healthy']
    WHEN 'Lemon Rice'         THEN ARRAY['light']                             WHEN 'Sambar Rice'        THEN ARRAY['comfort','healthy']
    WHEN 'Rasam Rice'         THEN ARRAY['light','spicy','healthy']           WHEN 'Parotta + Curry'    THEN ARRAY['comfort','spicy','shareable']
    WHEN 'Chapati Set'        THEN ARRAY['healthy','comfort']                 WHEN 'Bajji Plate'        THEN ARRAY['shareable','comfort']
    WHEN 'Murukku'            THEN ARRAY['shareable','light']                 WHEN 'Filter Coffee'      THEN ARRAY['light']
    WHEN 'Masala Chai'        THEN ARRAY['light']                             WHEN 'Mango Lassi'        THEN ARRAY['light','healthy']
    WHEN 'Payasam'            THEN ARRAY['comfort']                           WHEN 'Kesari'             THEN ARRAY['comfort']
  END,
  meal_time    = CASE name
    WHEN 'Masala Dosa'        THEN ARRAY['breakfast','lunch']                WHEN 'Idli Sambar'        THEN ARRAY['breakfast']
    WHEN 'Vada Sambar'        THEN ARRAY['breakfast','snack']                WHEN 'Upma'               THEN ARRAY['breakfast']
    WHEN 'Pongal'             THEN ARRAY['breakfast']                         WHEN 'Chicken Biryani'    THEN ARRAY['lunch','dinner']
    WHEN 'Vegetable Biryani'  THEN ARRAY['lunch','dinner']                   WHEN 'Curd Rice'          THEN ARRAY['lunch']
    WHEN 'Lemon Rice'         THEN ARRAY['lunch']                             WHEN 'Sambar Rice'        THEN ARRAY['lunch','dinner']
    WHEN 'Rasam Rice'         THEN ARRAY['lunch','dinner']                   WHEN 'Parotta + Curry'    THEN ARRAY['dinner']
    WHEN 'Chapati Set'        THEN ARRAY['lunch','dinner']                   WHEN 'Bajji Plate'        THEN ARRAY['snack']
    WHEN 'Murukku'            THEN ARRAY['snack']                             WHEN 'Filter Coffee'      THEN ARRAY['breakfast','snack']
    WHEN 'Masala Chai'        THEN ARRAY['breakfast','snack']                 WHEN 'Mango Lassi'        THEN ARRAY['lunch','dinner','snack']
    WHEN 'Payasam'            THEN ARRAY['lunch','dinner']                   WHEN 'Kesari'             THEN ARRAY['dinner']
  END
WHERE name IN (
  'Masala Dosa', 'Idli Sambar', 'Vada Sambar', 'Upma', 'Pongal',
  'Chicken Biryani', 'Vegetable Biryani', 'Curd Rice', 'Lemon Rice',
  'Sambar Rice', 'Rasam Rice', 'Parotta + Curry', 'Chapati Set',
  'Bajji Plate', 'Murukku', 'Filter Coffee', 'Masala Chai',
  'Mango Lassi', 'Payasam', 'Kesari'
);

-- ----------------------------------------------------------------
-- MIGRATION COMPLETE
-- Verify with:
--   SELECT column_name FROM information_schema.columns WHERE table_name='menu';
--   SELECT * FROM admin_daily_stats;
--   SELECT * FROM admin_weekly_revenue;
--   SELECT * FROM admin_top_items;
--   SELECT * FROM admin_category_sales;
--   SELECT * FROM admin_daily_orders;
-- ================================================================
