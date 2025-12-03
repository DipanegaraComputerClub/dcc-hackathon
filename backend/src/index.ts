import { Hono } from 'hono'
import { supabase } from './supabase'

const app = new Hono()

// Root
app.get('/', (c) => c.text('Hono + Bun + Supabase Connected 🚀'))

// ================================
// GET ALL MENUS
// ================================
app.get('/menus', async (c) => {
  const { data, error } = await supabase.from('menus').select('*')

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ================================
// GET MENU BY ID
// ================================
app.get('/menus/:id', async (c) => {
  const id = c.req.param('id')

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return c.json({ error }, 404)
  return c.json({ data })
})

// ================================
// CREATE MENU
// ================================
app.post('/menus', async (c) => {
  const body = await c.req.json()
  const { name, price, description } = body

  if (!name || !price) {
    return c.json({ error: 'name dan price wajib diisi' }, 400)
  }

  const { data, error } = await supabase
    .from('menus')
    .insert([{ name, price, description }])
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ================================
// UPDATE MENU
// ================================
app.put('/menus/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const { name, price, description } = body

  const { data, error } = await supabase
    .from('menus')
    .update({ name, price, description })
    .eq('id', id)
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ================================
// DELETE MENU
// ================================
app.delete('/menus/:id', async (c) => {
  const id = c.req.param('id')

  const { data, error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id)
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

export default app
