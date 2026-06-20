# 🍛 TechSooru — Restaurant Management SaaS

> Traditional South Indian flavors × Modern Tech Stack

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite                   |
| UI         | Material UI v5                    |
| Backend    | Supabase (PostgreSQL + Realtime)  |
| Auth       | Supabase Auth                     |
| Payments   | Razorpay (test mode)              |
| Charts     | Recharts                          |
| Routing    | React Router v6                   |

---

## Project Structure

```
techsooru/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── supabase/
│   └── schema.sql            ← Run this in Supabase SQL Editor
└── src/
    ├── main.jsx
    ├── App.jsx               ← Routes + Protected routes
    ├── theme.js              ← MUI TechSooru theme
    ├── index.css             ← Global styles + animations
    ├── supabaseClient.js
    ├── data/
    │   └── sampleData.js     ← 20 menu items + sample orders
    ├── contexts/
    │   ├── AuthContext.jsx   ← Auth + role management
    │   ├── CartContext.jsx   ← Cart state (useReducer)
    │   └── OrderContext.jsx  ← Orders + Supabase Realtime
    ├── components/
    │   ├── layout/
    │   │   └── Layout.jsx    ← Topbar + navigation
    │   ├── cart/
    │   │   └── CartDrawer.jsx
    │   ├── menu/
    │   │   └── MenuCard.jsx
    │   ├── kitchen/
    │   │   └── KitchenOrderCard.jsx
    │   └── tracking/
    │       └── OrderStatusChip.jsx
    └── pages/
        ├── HomePage.jsx      ← Hero + popular items
        ├── MenuPage.jsx      ← Full menu with search + filter
        ├── TablePage.jsx     ← QR code landing (/table/:id)
        ├── PaymentPage.jsx   ← Razorpay checkout
        ├── OrderTrackingPage.jsx ← Live order tracking
        ├── KitchenPage.jsx   ← Kitchen dashboard
        ├── AdminPage.jsx     ← Analytics + Menu CRUD + Reports
        └── AuthPage.jsx      ← Sign in / Sign up + demo mode
```

---

## Setup Instructions

### 1. Install dependencies

```bash
cd techsooru
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Set up Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates:
- `users` table with role-based access
- `menu` table with 20 pre-loaded South Indian dishes
- `orders` table with status tracking
- `order_items` table with computed subtotals
- Row Level Security policies
- Realtime publications for live updates

### 4. Run the app

```bash
npm run dev
```

Open: http://localhost:5173

---

## QR Table Ordering

Each table gets a QR code pointing to:
```
https://your-app.com/table/4
```

The TablePage auto-sets the table number and redirects to the menu.

Generate QR codes for each table using any QR generator with the above URL pattern.

---

## User Roles

| Role     | Access                                  |
|----------|-----------------------------------------|
| customer | Menu, Cart, Checkout, Order Tracking    |
| kitchen  | Kitchen Dashboard (real-time orders)    |
| admin    | Everything + Analytics + Menu CRUD      |

Demo mode is enabled by default — click "Continue as [Role] (Demo)" on the auth page to skip Supabase auth during development.

---

## Razorpay Integration

1. Create an account at [razorpay.com](https://razorpay.com)
2. Get your **test mode** Key ID from Dashboard → Settings → API Keys
3. Add to `.env`: `VITE_RAZORPAY_KEY_ID=rzp_test_...`

The Razorpay checkout script is loaded dynamically in `PaymentPage.jsx`. Payment handler creates the order in Supabase upon success.

---

## Supabase Realtime

The `OrderContext` subscribes to `postgres_changes` on the `orders` table:

```js
supabase.channel('orders-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handler)
  .subscribe()
```

This powers:
- Kitchen dashboard auto-refresh on new orders
- Customer order tracking status updates

---

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Brand Colors

| Token     | Hex       | Usage                    |
|-----------|-----------|--------------------------|
| Primary   | `#8B4513` | Buttons, headings, CTAs  |
| Secondary | `#D4A373` | Cards, borders, accents  |
| Accent    | `#FF6B35` | Highlights, cart, alerts |
| Background| `#FFF8F0` | Page background          |
| Dark      | `#2C1810` | Topbar, hero             |
