# TechSooru — Migration Verification Checklist

## How to Apply

### Fresh Install (new Supabase project)
```sql
-- Run the complete schema.sql once:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste supabase/schema.sql
--   3. Execute
```

### Existing Database (has old schema.sql already)
```sql
-- Run the migration on top:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste supabase/migration.sql
--   3. Execute
```

---

## Verification Steps

### Step 1: Verify Menu Columns
Run this query — should return 18 columns (12 original + 8 new, minus id which is in both):
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu'
ORDER BY ordinal_position;
```

**Expected columns:** id, name, description, price, category, type, emoji, image_url, is_popular, is_active, sort_order, rating, orders_count, ingredients, calories, prep_time, spicy_level, tags, meal_time, created_at, updated_at

### Step 2: Verify payment_status Default
```sql
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'payment_status';
```
**Expected:** `'pending'::text`

### Step 3: Verify New Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'menu', 'orders', 'order_items')
ORDER BY tablename, indexname;
```

**Expected indexes:**
| Table | Index |
|---|---|
| users | idx_users_email |
| menu | idx_menu_category, idx_menu_active, idx_menu_rating, idx_menu_popular, idx_menu_category_type |
| orders | idx_orders_status, idx_orders_user_id, idx_orders_created_at, idx_orders_payment_status, idx_orders_created_date |
| order_items | idx_order_items_order |

### Step 4: Verify RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'menu', 'orders', 'order_items')
ORDER BY tablename, policyname;
```

**Expected policies:**
| Table | Policies |
|---|---|
| users | users_select_own, users_select_admin, users_update_own, users_update_admin, users_insert_own |
| menu | menu_select_public, menu_all_admin |
| orders | orders_select_own, orders_insert_auth, orders_update_staff |
| order_items | order_items_select, order_items_insert |

### Step 5: Verify Storage Buckets
```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('menu-images', 'avatars');
```
**Expected:** Two buckets with correct size limits (5MB for menu-images, 2MB for avatars)

### Step 6: Verify Analytics Views
```sql
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'admin_%'
ORDER BY table_name;
```

**Expected views:** admin_daily_stats, admin_weekly_revenue, admin_top_items, admin_category_sales, admin_daily_orders

Test each view returns data:
```sql
SELECT * FROM admin_daily_stats;
SELECT * FROM admin_weekly_revenue;
SELECT * FROM admin_top_items;
SELECT * FROM admin_category_sales;
SELECT * FROM admin_daily_orders;
```

### Step 7: Verify Seed Data
```sql
SELECT name, rating, orders_count, calories, prep_time, spicy_level,
       array_length(ingredients, 1) as ingredient_count,
       array_length(tags, 1) as tag_count,
       array_length(meal_time, 1) as meal_time_count
FROM menu
ORDER BY sort_order;
```

**Expected:** 24 rows, all with non-null extra fields.

### Step 8: Verify Realtime Publications
```sql
SELECT pubname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```
**Expected:** orders, order_items

### Step 9: Verify Frontend Compatibility
Check that `MenuContext` fetch returns the new columns:
```javascript
// In src/contexts/MenuContext.jsx, the query:
supabase.from('menu').select('*').eq('is_active', true).order('category')
// uses select('*'), so all new columns are automatically included
```

### Step 10: Verify Auth Flow (Manual)
1. Open Supabase Dashboard → Authentication → Providers → Ensure Email auth is enabled
2. Try registering a new user via the frontend AuthPage
3. Verify `users` table gets the new row with `role = 'customer'`
4. Try logging in — verify JWT is issued

---

## Rollback Plan

If migration causes issues, run these in order:

```sql
-- Drop new views
DROP VIEW IF EXISTS admin_daily_stats;
DROP VIEW IF EXISTS admin_weekly_revenue;
DROP VIEW IF EXISTS admin_top_items;
DROP VIEW IF EXISTS admin_category_sales;
DROP VIEW IF EXISTS admin_daily_orders;

-- Drop new storage policies
DROP POLICY IF EXISTS "menu_images_select" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_update" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;

-- Drop new RLS policies
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;

-- Drop new indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_menu_rating;
DROP INDEX IF EXISTS idx_menu_popular;
DROP INDEX IF EXISTS idx_menu_category_type;
DROP INDEX IF EXISTS idx_orders_payment_status;
DROP INDEX IF EXISTS idx_orders_created_date;

-- Revert payment_status default
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'paid';

-- Drop new menu columns
ALTER TABLE menu DROP COLUMN IF EXISTS rating;
ALTER TABLE menu DROP COLUMN IF EXISTS orders_count;
ALTER TABLE menu DROP COLUMN IF EXISTS ingredients;
ALTER TABLE menu DROP COLUMN IF EXISTS calories;
ALTER TABLE menu DROP COLUMN IF EXISTS prep_time;
ALTER TABLE menu DROP COLUMN IF EXISTS spicy_level;
ALTER TABLE menu DROP COLUMN IF EXISTS tags;
ALTER TABLE menu DROP COLUMN IF EXISTS meal_time;
```
