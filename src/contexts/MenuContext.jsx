import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { MENU_DATA, FILTER_CHIPS, MOOD_OPTIONS, CATEGORIES } from '../data/sampleData'
import { supabase } from '../supabaseClient'

const MenuContext = createContext(null)

/* ── helpers ── */
function getMealTimeSlot() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 18) return 'snack'
  return 'dinner'
}

export function MenuProvider({ children }) {
  /* ── raw items (from DB or fallback) ── */
  const [items, setItems] = useState(MENU_DATA)
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuError, setMenuError] = useState(null)

  const fetchMenu = useCallback(async () => {
    setMenuLoading(true)
    setMenuError(null)
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_active', true)
        .order('category')
      if (error) throw error
      if (data && data.length > 0) setItems(data)
    } catch (err) {
      console.warn('MenuContext: Supabase fetch failed, using fallback data —', err.message)
      setMenuError(err.message)
    } finally {
      setMenuLoading(false)
    }
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  /* ── filter state ── */
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeFilters, setActiveFilters] = useState([])   // keys from FILTER_CHIPS
  const [activeMood, setActiveMood] = useState(null)        // key from MOOD_OPTIONS
  const [search, setSearch] = useState('')

  /* ── toggle helpers ── */
  const toggleFilter = useCallback((key) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }, [])

  const toggleMood = useCallback((key) => {
    setActiveMood(prev => prev === key ? null : key)
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    setActiveMood(null)
    setSearch('')
    setActiveCategory('All')
  }, [])

  /* ── derived filtered list (memoized) ── */
  const filtered = useMemo(() => {
    let result = items

    // Category
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.ingredients?.some(ing => ing.toLowerCase().includes(q))
      )
    }

    // Filter chips (AND logic)
    for (const key of activeFilters) {
      const chip = FILTER_CHIPS.find(c => c.key === key)
      if (chip) result = result.filter(chip.filter)
    }

    // Mood
    if (activeMood) {
      const mood = MOOD_OPTIONS.find(m => m.key === activeMood)
      if (mood) {
        result = result.filter(item =>
          item.tags?.some(t => mood.tags.includes(t))
        )
      }
    }

    return result
  }, [items, activeCategory, search, activeFilters, activeMood])

  /* ── autocomplete suggestions ── */
  const suggestions = useMemo(() => {
    if (!search.trim() || search.length < 2) return []
    const q = search.toLowerCase()
    const nameMatches = items
      .filter(i => i.name.toLowerCase().includes(q))
      .map(i => ({ type: 'dish', label: i.name, emoji: i.emoji, id: i.id }))
    const ingredientSet = new Set()
    items.forEach(item => {
      item.ingredients?.forEach(ing => {
        if (ing.toLowerCase().includes(q)) ingredientSet.add(ing)
      })
    })
    const ingMatches = [...ingredientSet].map(ing => ({
      type: 'ingredient', label: ing, emoji: '🧂', id: `ing-${ing}`
    }))
    return [...nameMatches.slice(0, 5), ...ingMatches.slice(0, 3)]
  }, [search, items])

  /* ── Chef's picks: time-aware + high rated ── */
  const chefsPicks = useMemo(() => {
    const slot = getMealTimeSlot()
    const timeRelevant = items.filter(item =>
      item.meal_time?.includes(slot) && item.rating >= 4.3
    )
    // Sort by combo of rating + orders 
    const sorted = timeRelevant.sort((a, b) => {
      const scoreA = (a.rating || 0) * 100 + (a.orders_count || 0)
      const scoreB = (b.rating || 0) * 100 + (b.orders_count || 0)
      return scoreB - scoreA
    })
    // Shuffle the top picks slightly for variety
    const top = sorted.slice(0, 8)
    for (let i = top.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]]
    }
    return top.slice(0, 4)
  }, [items])

  /* ── Surprise me: random high-rated dish ── */
  const getRandomDish = useCallback(() => {
    const highRated = items.filter(i => i.rating >= 4.3)
    return highRated[Math.floor(Math.random() * highRated.length)]
  }, [items])

  /* ── active filter labels for summary bar ── */
  const activeFilterLabels = useMemo(() => {
    const labels = []
    if (activeCategory !== 'All') labels.push(activeCategory)
    activeFilters.forEach(key => {
      const chip = FILTER_CHIPS.find(c => c.key === key)
      if (chip) labels.push(chip.label)
    })
    if (activeMood) {
      const mood = MOOD_OPTIONS.find(m => m.key === activeMood)
      if (mood) labels.push(`${mood.emoji} ${mood.label}`)
    }
    if (search.trim()) labels.push(`"${search}"`)
    return labels
  }, [activeCategory, activeFilters, activeMood, search])

  const hasAnyFilter = activeFilterLabels.length > 0

  const value = {
    // data
    items,
    filtered,
    suggestions,
    chefsPicks,
    categories: CATEGORIES,
    filterChips: FILTER_CHIPS,
    moodOptions: MOOD_OPTIONS,
    // state
    menuLoading,
    menuError,
    activeCategory,
    activeFilters,
    activeMood,
    search,
    // derived
    activeFilterLabels,
    hasAnyFilter,
    mealTimeSlot: getMealTimeSlot(),
    // actions
    setActiveCategory,
    toggleFilter,
    toggleMood,
    setSearch,
    clearAllFilters,
    getRandomDish,
    refreshMenu: fetchMenu,
  }

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used within MenuProvider')
  return ctx
}
