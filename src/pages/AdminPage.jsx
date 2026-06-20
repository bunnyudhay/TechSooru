import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Paper, Tabs, Tab, Stack,
  Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useOrders } from '../contexts/OrderContext'
import { useMenu } from '../contexts/MenuContext'
import { supabase } from '../supabaseClient'
import { CATEGORIES } from '../data/sampleData'
import OrderStatusChip from '../components/tracking/OrderStatusChip'

const WEEK_DATA = [
  { day: 'Mon', revenue: 6200, orders: 38 },
  { day: 'Tue', revenue: 7800, orders: 44 },
  { day: 'Wed', revenue: 5400, orders: 31 },
  { day: 'Thu', revenue: 8420, orders: 48 },
  { day: 'Fri', revenue: 9100, orders: 55 },
  { day: 'Sat', revenue: 11200, orders: 67 },
  { day: 'Sun', revenue: 7600, orders: 46 },
]

const TOP_ITEMS = [
  { name: 'Masala Dosa', orders: 142, revenue: 12638 },
  { name: 'Filter Coffee', orders: 128, revenue: 4480 },
  { name: 'Chicken Biryani', orders: 98, revenue: 17640 },
  { name: 'Mango Lassi', orders: 87, revenue: 5655 },
  { name: 'Pongal', orders: 76, revenue: 5320 },
]

const PIE_DATA = [
  { name: 'Breakfast', value: 38, color: '#8B4513' },
  { name: 'Rice & Biryani', value: 28, color: '#D4A373' },
  { name: 'Beverages', value: 18, color: '#FF6B35' },
  { name: 'Others', value: 16, color: '#E8C9A0' },
]

function StatCard({ icon, label, value, change }) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3,
      transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(139,69,19,0.1)' }
    }}>
      <Typography sx={{ fontSize: 28, mb: 0.5 }}>{icon}</Typography>
      <Typography sx={{ fontSize: 11, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#8B4513' }}>
        {value}
      </Typography>
      {change && <Typography sx={{ fontSize: 11, color: '#2E7D32', mt: 0.3 }}>{change}</Typography>}
    </Paper>
  )
}

const EMPTY_ITEM = { name: '', price: '', category: 'Breakfast', type: 'veg', emoji: '', description: '' }

export default function AdminPage() {
  const { orders, updateOrderStatus } = useOrders()
  const { items: contextItems, refreshMenu } = useMenu()
  const [tab, setTab] = useState(0)
  const [menuItems, setMenuItems] = useState(contextItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_ITEM)

  useEffect(() => { setMenuItems(contextItems) }, [contextItems])

  const totalRevenue = orders.reduce((s, o) => s + (o.total || o.amount || 0), 0)
  const todayRevenue = 8420 + totalRevenue

  function openAdd() { setEditItem(null); setForm(EMPTY_ITEM); setDialogOpen(true) }
  function openEdit(item) { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  function handleClose() { setDialogOpen(false); setEditItem(null) }

  function handleSave() {
    if (!form.name || !form.price) return
    const payload = { ...form, price: Number(form.price) }

    if (editItem) {
      setMenuItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...payload } : i))
      supabase.from('menu').update(payload).eq('id', editItem.id).then(({ error }) => {
        if (!error) refreshMenu()
      })
    } else {
      const newItem = { ...payload, id: Date.now(), is_popular: false, is_active: true }
      setMenuItems(prev => [...prev, newItem])
      supabase.from('menu').insert(newItem).then(({ error }) => {
        if (!error) refreshMenu()
      })
    }
    handleClose()
  }

  function handleDelete(id) {
    setMenuItems(prev => prev.filter(i => i.id !== id))
    supabase.from('menu').update({ is_active: false }).eq('id', id).then(({ error }) => {
      if (!error) refreshMenu()
    })
  }

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: 28, mb: 0.5 }}>Admin Dashboard</Typography>
        <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>TechSooru Restaurant Management Suite</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: '💰', label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, change: '↑ 12% vs yesterday' },
          { icon: '🛒', label: 'Total Orders', value: 48 + orders.length, change: `↑ ${orders.length} new today` },
          { icon: '🍽️', label: 'Tables Active', value: '6 / 12', change: '3 tables free' },
          { icon: '⭐', label: 'Avg Order Value', value: '₹175', change: '↑ 5% this week' },
        ].map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Revenue Chart */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3, mb: 3 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
          Weekly Revenue (₹)
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={WEEK_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,163,115,0.2)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8B6A5A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8B6A5A' }} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid rgba(212,163,115,0.3)', fontSize: 13 }}
              formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#D4A373" radius={[6, 6, 0, 0]}
              activeBar={{ fill: '#FF6B35' }} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid rgba(212,163,115,0.2)', '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 14 }, '& .Mui-selected': { color: '#8B4513' }, '& .MuiTabs-indicator': { bgcolor: '#8B4513' } }}>
        <Tab label="Orders" />
        <Tab label="Menu Management" />
        <Tab label="Reports" />
      </Tabs>

      {/* ORDERS TAB */}
      {tab === 0 && (
        <Paper elevation={0} sx={{ border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FFF8F0' }}>
                {['Order ID', 'Table', 'Items', 'Amount', 'Status', 'Time'].map(h => (
                  <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,248,240,0.6)' } }}>
                  <TableCell><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{o.id}</Typography></TableCell>
                  <TableCell>Table {o.table_number}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>
                      {(o.items || []).map(i => i.name).join(', ').substring(0, 40)}...
                    </Typography>
                  </TableCell>
                  <TableCell><Typography sx={{ fontWeight: 600 }}>₹{o.total || o.amount}</Typography></TableCell>
                  <TableCell><OrderStatusChip status={o.status} /></TableCell>
                  <TableCell sx={{ fontSize: 12, color: '#8B6A5A' }}>
                    {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* MENU MANAGEMENT TAB */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>
              Menu Items <Box component="span" sx={{ color: '#8B6A5A', fontWeight: 400, fontSize: 13, ml: 1 }}>
                {menuItems.length} items
              </Box>
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' } }}>
              Add Item
            </Button>
          </Box>
          <Paper elevation={0} sx={{ border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FFF8F0' }}>
                  {['Item', 'Category', 'Price', 'Type', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {menuItems.map(item => (
                  <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,248,240,0.6)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 20 }}>{item.emoji}</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small"
                        sx={{ bgcolor: 'rgba(212,163,115,0.15)', color: '#8B4513', fontSize: 11 }} />
                    </TableCell>
                    <TableCell><Typography sx={{ fontWeight: 700, fontSize: 14 }}>₹{item.price}</Typography></TableCell>
                    <TableCell>
                      <Chip label={item.type} size="small" sx={{
                        bgcolor: item.type === 'veg' ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.1)',
                        color: item.type === 'veg' ? '#2E7D32' : '#C62828', fontSize: 11
                      }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#8B4513' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: '#C62828' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* REPORTS TAB */}
      {tab === 2 && (
        <Grid container spacing={3}>
          {/* Summary Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {[
                { icon: '📅', label: "Today's Sales", value: `₹${todayRevenue.toLocaleString('en-IN')}` },
                { icon: '📊', label: 'This Week', value: '₹55,720' },
                { icon: '📈', label: 'This Month', value: '₹2.1L' },
                { icon: '🏆', label: 'Top Item', value: 'Masala Dosa' },
              ].map(s => <Grid item xs={6} md={3} key={s.label}><StatCard {...s} /></Grid>)}
            </Grid>
          </Grid>

          {/* Top Items Bar */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                Top Selling Items
              </Typography>
              <Stack spacing={1.5}>
                {TOP_ITEMS.map((item, i) => (
                  <Box key={item.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>{item.orders} orders · ₹{item.revenue.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(212,163,115,0.2)', borderRadius: 2, height: 8, overflow: 'hidden' }}>
                      <Box sx={{
                        width: `${(item.orders / TOP_ITEMS[0].orders) * 100}%`,
                        bgcolor: i === 0 ? '#FF6B35' : '#D4A373', height: '100%', borderRadius: 2,
                        transition: 'width 0.8s ease'
                      }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Category Pie */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                  <Tooltip formatter={v => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Orders Line Chart */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(212,163,115,0.2)', borderRadius: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                Daily Orders This Week
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={WEEK_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,163,115,0.2)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8B6A5A' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8B6A5A' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(212,163,115,0.3)', fontSize: 13 }} />
                  <Line type="monotone" dataKey="orders" stroke="#FF6B35" strokeWidth={2.5}
                    dot={{ fill: '#FF6B35', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ADD / EDIT MENU ITEM DIALOG */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", fontSize: 22, pb: 1 }}>
          {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Item Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Price (₹)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" fullWidth size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} fullWidth size="small" inputProps={{ style: { fontSize: 20 } }} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <MenuItem value="veg">Veg</MenuItem>
                    <MenuItem value="nonveg">Non-Veg</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleClose} sx={{ color: '#5C3D2E', border: '1.5px solid rgba(212,163,115,0.4)', borderRadius: 2.5, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, borderRadius: 2.5, px: 4 }}>
            {editItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
