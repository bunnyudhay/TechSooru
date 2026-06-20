import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext(null)

const TAX_RATE = 0.05

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return { ...state, items: state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i) }
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] }
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => i.id === action.id)
      if (!existing) return state
      if (existing.qty === 1) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) }
      }
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: i.qty - 1 } : i) }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'SET_TABLE':
      return { ...state, tableNumber: action.tableNumber }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], tableNumber: null })

  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', item }), [])
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const setTable = useCallback((tableNumber) => dispatch({ type: 'SET_TABLE', tableNumber }), [])

  const itemCount = state.items.reduce((s, i) => s + i.qty, 0)
  const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax

  const getQty = (id) => state.items.find(i => i.id === id)?.qty || 0

  return (
    <CartContext.Provider value={{ items: state.items, tableNumber: state.tableNumber, itemCount, subtotal, tax, total, addItem, removeItem, clearCart, setTable, getQty }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
