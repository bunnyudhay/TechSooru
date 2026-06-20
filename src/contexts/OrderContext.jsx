import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { SAMPLE_ORDERS } from '../data/sampleData'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(SAMPLE_ORDERS)
  const [loading, setLoading] = useState(false)

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, menu(*))`)
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
    setLoading(false)
  }, [])

  const createOrder = useCallback(async ({ userId, tableNumber, items, subtotal, tax, total, paymentId, notes }) => {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, table_number: tableNumber, status: 'pending', subtotal, tax, total, payment_id: paymentId, notes })
      .select()
      .single()
    if (orderError) throw orderError

    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_id: item.menu_id || null,
      name: item.name,
      quantity: item.qty,
      unit_price: item.price,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Optimistic update for demo mode
    setOrders(prev => [{
      ...order,
      items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    }, ...prev])

    return order
  }, [])

  const updateOrderStatus = useCallback(async (orderId, status) => {
    // Optimistic local update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    // Persist to Supabase
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) {
      // Revert on failure
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: o.status } : o))
      throw error
    }
  }, [])

  return (
    <OrderContext.Provider value={{ orders, loading, fetchOrders, createOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within OrderProvider')
  return ctx
}
