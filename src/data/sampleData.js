export const MENU_DATA = [
  {
    id: 1, name: 'Masala Dosa', price: 89, category: 'Breakfast', type: 'veg', emoji: '🥞',
    description: 'Crispy rice crepe with spiced potato filling',
    is_popular: true, is_active: true, rating: 4.8, orders_count: 342,
    ingredients: ['Rice batter', 'Potato', 'Onion', 'Mustard seeds', 'Curry leaves'],
    calories: 206, prep_time: 12, spicy_level: 1,
    tags: ['light', 'shareable'], meal_time: ['breakfast', 'lunch']
  },
  {
    id: 2, name: 'Idli Sambar', price: 60, category: 'Breakfast', type: 'veg', emoji: '🍚',
    description: 'Steamed rice cakes with aromatic lentil soup',
    is_popular: true, is_active: true, rating: 4.6, orders_count: 290,
    ingredients: ['Rice', 'Urad dal', 'Sambar spices', 'Vegetables', 'Tamarind'],
    calories: 150, prep_time: 8, spicy_level: 1,
    tags: ['light', 'healthy'], meal_time: ['breakfast']
  },
  {
    id: 3, name: 'Vada Sambar', price: 65, category: 'Breakfast', type: 'veg', emoji: '🍩',
    description: 'Crispy lentil donuts with sambar & chutney',
    is_popular: false, is_active: true, rating: 4.3, orders_count: 178,
    ingredients: ['Urad dal', 'Curry leaves', 'Ginger', 'Black pepper', 'Coconut chutney'],
    calories: 290, prep_time: 15, spicy_level: 1,
    tags: ['shareable', 'comfort'], meal_time: ['breakfast', 'snack']
  },
  {
    id: 4, name: 'Upma', price: 55, category: 'Breakfast', type: 'veg', emoji: '🥣',
    description: 'Savory semolina porridge with veggies & tempering',
    is_popular: false, is_active: true, rating: 4.0, orders_count: 120,
    ingredients: ['Semolina', 'Onion', 'Green chili', 'Mustard seeds', 'Peanuts'],
    calories: 185, prep_time: 10, spicy_level: 1,
    tags: ['light', 'healthy'], meal_time: ['breakfast']
  },
  {
    id: 5, name: 'Pongal', price: 70, category: 'Breakfast', type: 'veg', emoji: '🍲',
    description: 'Rice & lentil comfort bowl with pepper & ghee',
    is_popular: true, is_active: true, rating: 4.7, orders_count: 256,
    ingredients: ['Rice', 'Moong dal', 'Black pepper', 'Ghee', 'Cashews'],
    calories: 240, prep_time: 15, spicy_level: 0,
    tags: ['comfort', 'healthy'], meal_time: ['breakfast']
  },
  {
    id: 6, name: 'Chicken Biryani', price: 180, category: 'Rice & Biryani', type: 'nonveg', emoji: '🍗',
    description: 'Fragrant basmati rice with spiced Chettinad chicken',
    is_popular: true, is_active: true, rating: 4.9, orders_count: 485,
    ingredients: ['Basmati rice', 'Chicken', 'Saffron', 'Chettinad spices', 'Mint'],
    calories: 490, prep_time: 25, spicy_level: 2,
    tags: ['comfort', 'spicy'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 7, name: 'Vegetable Biryani', price: 140, category: 'Rice & Biryani', type: 'veg', emoji: '🌾',
    description: 'Aromatic rice with garden vegetables & saffron',
    is_popular: false, is_active: true, rating: 4.2, orders_count: 160,
    ingredients: ['Basmati rice', 'Mixed veggies', 'Saffron', 'Biryani spices', 'Mint'],
    calories: 340, prep_time: 22, spicy_level: 1,
    tags: ['comfort'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 8, name: 'Curd Rice', price: 80, category: 'Rice & Biryani', type: 'veg', emoji: '🍚',
    description: 'Cooling yogurt rice with mustard seeds & pomegranate',
    is_popular: false, is_active: true, rating: 4.4, orders_count: 195,
    ingredients: ['Rice', 'Yogurt', 'Mustard seeds', 'Pomegranate', 'Curry leaves'],
    calories: 210, prep_time: 8, spicy_level: 0,
    tags: ['light', 'healthy'], meal_time: ['lunch']
  },
  {
    id: 9, name: 'Lemon Rice', price: 75, category: 'Rice & Biryani', type: 'veg', emoji: '🍋',
    description: 'Tangy rice with mustard seeds & roasted peanuts',
    is_popular: false, is_active: true, rating: 4.1, orders_count: 145,
    ingredients: ['Rice', 'Lemon juice', 'Peanuts', 'Turmeric', 'Mustard seeds'],
    calories: 230, prep_time: 10, spicy_level: 0,
    tags: ['light'], meal_time: ['lunch']
  },
  {
    id: 10, name: 'Sambar Rice', price: 85, category: 'Main Course', type: 'veg', emoji: '🍛',
    description: 'Comfort rice mixed with our signature sambar',
    is_popular: false, is_active: true, rating: 4.3, orders_count: 167,
    ingredients: ['Rice', 'Mixed dal', 'Tamarind', 'Drumstick', 'Sambar powder'],
    calories: 280, prep_time: 12, spicy_level: 1,
    tags: ['comfort', 'healthy'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 11, name: 'Rasam Rice', price: 80, category: 'Main Course', type: 'veg', emoji: '🥘',
    description: 'Light peppery rasam paired with steamed rice',
    is_popular: false, is_active: true, rating: 4.2, orders_count: 134,
    ingredients: ['Rice', 'Tomato', 'Tamarind', 'Black pepper', 'Rasam powder'],
    calories: 190, prep_time: 10, spicy_level: 2,
    tags: ['light', 'spicy', 'healthy'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 12, name: 'Parotta + Curry', price: 110, category: 'Breads', type: 'nonveg', emoji: '🫓',
    description: 'Layered flatbread with spicy egg or chicken curry',
    is_popular: true, is_active: true, rating: 4.7, orders_count: 310,
    ingredients: ['Maida', 'Egg/Chicken curry', 'Onion', 'Tomato', 'Spices'],
    calories: 420, prep_time: 18, spicy_level: 2,
    tags: ['comfort', 'spicy', 'shareable'], meal_time: ['dinner']
  },
  {
    id: 13, name: 'Chapati Set', price: 90, category: 'Breads', type: 'veg', emoji: '🫓',
    description: '3 soft wheat chapatis with dal & sabzi',
    is_popular: false, is_active: true, rating: 4.1, orders_count: 108,
    ingredients: ['Whole wheat flour', 'Dal', 'Mixed vegetables', 'Spices'],
    calories: 320, prep_time: 15, spicy_level: 1,
    tags: ['healthy', 'comfort'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 14, name: 'Bajji Plate', price: 70, category: 'Snacks', type: 'veg', emoji: '🧅',
    description: 'Deep fried onion & banana pepper fritters',
    is_popular: false, is_active: true, rating: 4.4, orders_count: 198,
    ingredients: ['Onion', 'Banana peppers', 'Besan', 'Rice flour', 'Spices'],
    calories: 310, prep_time: 12, spicy_level: 1,
    tags: ['shareable', 'comfort'], meal_time: ['snack']
  },
  {
    id: 15, name: 'Murukku', price: 40, category: 'Snacks', type: 'veg', emoji: '🌀',
    description: 'Traditional crispy rice flour spirals',
    is_popular: false, is_active: true, rating: 4.0, orders_count: 88,
    ingredients: ['Rice flour', 'Urad dal flour', 'Sesame seeds', 'Butter'],
    calories: 180, prep_time: 5, spicy_level: 0,
    tags: ['shareable', 'light'], meal_time: ['snack']
  },
  {
    id: 16, name: 'Filter Coffee', price: 35, category: 'Beverages', type: 'veg', emoji: '☕',
    description: 'Strong South Indian decoction with frothy milk',
    is_popular: true, is_active: true, rating: 4.9, orders_count: 510,
    ingredients: ['Coffee beans', 'Fresh milk', 'Sugar'],
    calories: 90, prep_time: 4, spicy_level: 0,
    tags: ['light'], meal_time: ['breakfast', 'snack']
  },
  {
    id: 17, name: 'Masala Chai', price: 30, category: 'Beverages', type: 'veg', emoji: '🍵',
    description: 'Spiced ginger & cardamom tea',
    is_popular: false, is_active: true, rating: 4.3, orders_count: 220,
    ingredients: ['Tea leaves', 'Ginger', 'Cardamom', 'Milk', 'Sugar'],
    calories: 70, prep_time: 5, spicy_level: 0,
    tags: ['light'], meal_time: ['breakfast', 'snack']
  },
  {
    id: 18, name: 'Mango Lassi', price: 65, category: 'Beverages', type: 'veg', emoji: '🥭',
    description: 'Chilled Alphonso mango yogurt drink',
    is_popular: true, is_active: true, rating: 4.6, orders_count: 275,
    ingredients: ['Alphonso mango', 'Yogurt', 'Sugar', 'Cardamom'],
    calories: 160, prep_time: 3, spicy_level: 0,
    tags: ['light', 'healthy'], meal_time: ['lunch', 'dinner', 'snack']
  },
  {
    id: 19, name: 'Payasam', price: 75, category: 'Desserts', type: 'veg', emoji: '🍮',
    description: 'Creamy semolina pudding with cashews & raisins',
    is_popular: false, is_active: true, rating: 4.5, orders_count: 165,
    ingredients: ['Semolina', 'Milk', 'Sugar', 'Cashews', 'Raisins', 'Ghee'],
    calories: 280, prep_time: 12, spicy_level: 0,
    tags: ['comfort'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 20, name: 'Kesari', price: 60, category: 'Desserts', type: 'veg', emoji: '🟡',
    description: 'Saffron semolina halwa with ghee & nuts',
    is_popular: false, is_active: true, rating: 4.3, orders_count: 140,
    ingredients: ['Semolina', 'Saffron', 'Ghee', 'Sugar', 'Cashews', 'Cardamom'],
    calories: 310, prep_time: 15, spicy_level: 0,
    tags: ['comfort'], meal_time: ['dinner']
  },
  {
    id: 21, name: 'Mutton Kuzhambu', price: 220, category: 'Main Course', type: 'nonveg', emoji: '🍖',
    description: 'Slow-cooked mutton in rich Chettinad gravy',
    is_popular: true, is_active: true, rating: 4.8, orders_count: 380,
    ingredients: ['Mutton', 'Chettinad spices', 'Coconut', 'Onion', 'Tomato'],
    calories: 520, prep_time: 30, spicy_level: 3,
    tags: ['spicy', 'comfort'], meal_time: ['dinner']
  },
  {
    id: 22, name: 'Paneer Butter Masala', price: 160, category: 'Main Course', type: 'veg', emoji: '🧀',
    description: 'Creamy tomato gravy with soft paneer cubes',
    is_popular: true, is_active: true, rating: 4.5, orders_count: 295,
    ingredients: ['Paneer', 'Tomato', 'Butter', 'Cream', 'Kashmiri chili'],
    calories: 380, prep_time: 20, spicy_level: 1,
    tags: ['comfort', 'shareable'], meal_time: ['lunch', 'dinner']
  },
  {
    id: 23, name: 'Chicken 65', price: 150, category: 'Snacks', type: 'nonveg', emoji: '🍗',
    description: 'Spicy deep-fried chicken bites with curry leaves',
    is_popular: true, is_active: true, rating: 4.7, orders_count: 410,
    ingredients: ['Chicken', 'Yogurt', 'Red chili', 'Curry leaves', 'Ginger-garlic'],
    calories: 350, prep_time: 15, spicy_level: 3,
    tags: ['spicy', 'shareable'], meal_time: ['snack', 'dinner']
  },
  {
    id: 24, name: 'Coconut Water', price: 45, category: 'Beverages', type: 'veg', emoji: '🥥',
    description: 'Fresh tender coconut water served chilled',
    is_popular: false, is_active: true, rating: 4.4, orders_count: 175,
    ingredients: ['Fresh tender coconut'],
    calories: 45, prep_time: 1, spicy_level: 0,
    tags: ['light', 'healthy'], meal_time: ['breakfast', 'lunch', 'snack']
  },
]

export const CATEGORIES = ['All', 'Breakfast', 'Main Course', 'Rice & Biryani', 'Snacks', 'Breads', 'Beverages', 'Desserts']

export const FILTER_CHIPS = [
  { key: 'veg', label: '🌿 Veg', filter: item => item.type === 'veg' },
  { key: 'nonveg', label: '🍗 Non-Veg', filter: item => item.type === 'nonveg' },
  { key: 'spicy', label: '🌶️ Spicy', filter: item => item.spicy_level >= 2 },
  { key: 'under100', label: '💰 Under ₹100', filter: item => item.price < 100 },
  { key: 'under200', label: '💸 Under ₹200', filter: item => item.price < 200 },
  { key: 'highProtein', label: '💪 High Protein', filter: item => ['nonveg'].includes(item.type) || item.ingredients?.some(i => ['Paneer', 'Chicken', 'Mutton', 'Urad dal', 'Moong dal', 'Mixed dal'].includes(i)) },
  { key: 'lowCal', label: '🔥 Low Calorie', filter: item => item.calories <= 200 },
  { key: 'quickPrep', label: '⚡ Quick (<10 min)', filter: item => item.prep_time <= 10 },
]

export const MOOD_OPTIONS = [
  { key: 'spicy', label: 'Spicy', emoji: '🌶️', color: '#E53935', tags: ['spicy'] },
  { key: 'light', label: 'Light', emoji: '🥗', color: '#43A047', tags: ['light'] },
  { key: 'comfort', label: 'Comfort', emoji: '🍲', color: '#FF8F00', tags: ['comfort'] },
  { key: 'healthy', label: 'Healthy', emoji: '💪', color: '#1E88E5', tags: ['healthy'] },
  { key: 'shareable', label: 'Shareable', emoji: '🍕', color: '#8E24AA', tags: ['shareable'] },
]

export const SAMPLE_ORDERS = [
  {
    id: 'ORD-001', table_number: 4,
    items: [{ name: 'Masala Dosa', qty: 2, price: 89 }, { name: 'Filter Coffee', qty: 2, price: 35 }],
    status: 'ready', created_at: new Date(Date.now() - 20 * 60000).toISOString(), total: 248,
  },
  {
    id: 'ORD-002', table_number: 7,
    items: [{ name: 'Chicken Biryani', qty: 1, price: 180 }, { name: 'Mango Lassi', qty: 1, price: 65 }],
    status: 'preparing', created_at: new Date(Date.now() - 10 * 60000).toISOString(), total: 245,
  },
  {
    id: 'ORD-003', table_number: 2,
    items: [{ name: 'Idli Sambar', qty: 3, price: 60 }, { name: 'Vada Sambar', qty: 2, price: 65 }],
    status: 'pending', created_at: new Date(Date.now() - 5 * 60000).toISOString(), total: 310,
  },
  {
    id: 'ORD-004', table_number: 9,
    items: [{ name: 'Parotta + Curry', qty: 2, price: 110 }, { name: 'Masala Chai', qty: 2, price: 30 }],
    status: 'pending', created_at: new Date(Date.now() - 2 * 60000).toISOString(), total: 280,
  },
]
