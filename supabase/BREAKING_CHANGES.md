# TechSooru — Breaking Changes

## Migration 001 — Schema v2.0

### 🔴 Breaking Change 1: `payment_status` Default Changed

**Old:** `DEFAULT 'paid'` (schema.sql line 53)
**New:** `DEFAULT 'pending'`

**Impact:** New orders created without an explicit `payment_status` value will now default to `'pending'` instead of `'paid'`. This is the correct behavior — orders should only be marked `'paid'` after Razorpay confirms payment.

**Affected code:**
- `src/contexts/OrderContext.jsx:40-44` — `createOrder()` does NOT set `payment_status` in the insert payload, so new orders will now have `payment_status = 'pending'` instead of `'paid'`.
- `src/pages/AdminPage.jsx:73` — `o.total || o.amount` — stats don't read `payment_status` yet, so no immediate UI impact.

**Required frontend change (recommended):** After this migration, the `createOrder()` call should explicitly set `payment_status: 'paid'` if the Razorpay payment succeeded, or leave it as `'pending'` if verification is pending a webhook.

### 🟡 Breaking Change 2: Seed Data Expanded from 20 to 24 Items

**Old schema.sql:** 20 menu items seeded
**New schema.sql:** 24 menu items seeded (matches `src/data/sampleData.js`)

**Added items:**
| Name | Category | Price |
|---|---|---|
| Mutton Kuzhambu | Main Course | ₹220 |
| Paneer Butter Masala | Main Course | ₹160 |
| Chicken 65 | Snacks | ₹150 |
| Coconut Water | Beverages | ₹45 |

**Impact:** Fresh installations will have 24 items instead of 20. Existing databases (via migration.sql) are unaffected — the migration does NOT reseed data, only UPDATEs existing rows for the new columns.

### ✅ Non-Breaking: 8 New Menu Columns

These columns were added with `DEFAULT` values, so:
- Existing rows get defaults automatically (rating=0, ingredients={}, etc.)
- The migration.sql UPDATEs the 20 existing rows with real values from sampleData.js
- Frontend `select('*')` queries will automatically include these — no frontend code changes needed
- The new fields are consumed by existing frontend components:
  - `rating` → MenuCard star badge, MenuContext chefsPicks sort
  - `orders_count` → MenuContext chefsPicks sort
  - `ingredients` → MenuCard detail, SmartSearch autocomplete
  - `calories` → MenuCard detail
  - `prep_time` → MenuCard detail, FilterChips quickPrep filter
  - `spicy_level` → MenuCard detail, FilterChips spicy filter
  - `tags` → MoodBrowser filter
  - `meal_time` → MenuContext chefsPicks time-slot filter

### ✅ Non-Breaking: New Indexes

All new indexes use `CREATE INDEX IF NOT EXISTS` — they simply don't exist if already present. Performance improvement only.

### ✅ Non-Breaking: New RLS Policies

All new policies are additive and only expand access (admin read/update all users). Existing policies are unchanged.

### ✅ Non-Breaking: Storage Buckets

Uses `INSERT ... ON CONFLICT (id) DO NOTHING` — no-op if buckets already exist.

### ✅ Non-Breaking: Analytics Views

All views use `CREATE OR REPLACE VIEW` — safe to run multiple times. These are new objects that don't affect existing functionality.

---

## Summary

| Change | Breaking? | Mitigation |
|---|---|---|
| `payment_status DEFAULT 'pending'` | 🔴 Yes — new orders will have `payment_status='pending'` | Update `createOrder()` to explicitly set `payment_status: 'paid'` on success |
| Seed data 20→24 items | 🟡 If relying on exactly 20 items | Update any hardcoded item count references |
| New menu columns | ✅ No — defaults handle existing rows | None needed |
| New indexes | ✅ No — performance only | None needed |
| New RLS policies | ✅ No — additive only | None needed |
| Storage buckets | ✅ No — idempotent | None needed |
| Analytics views | ✅ No — new objects | None needed |
