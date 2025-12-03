import { Hono } from 'hono'
import { supabase } from './supabase'

const app = new Hono()

// Root
app.get('/', (c) => c.text('Hono + Bun + Supabase Connected'))

// ========== GET: Ambil semua notes ==========
app.get('/notes', async (c) => {
  const { data, error } = await supabase.from('notes').select('*')

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ========== POST: Tambah note ==========
app.post('/notes', async (c) => {
  const body = await c.req.json()

  const { title } = body
  if (!title) return c.json({ error: 'title wajib diisi' }, 400)

  const { data, error } = await supabase
    .from('notes')
    .insert([{ title }])
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ========== PUT: Update note ==========
app.put('/notes/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const { title } = body

  const { data, error } = await supabase
    .from('notes')
    .update({ title })
    .eq('id', id)
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

// ========== DELETE: Hapus note ==========
app.delete('/notes/:id', async (c) => {
  const id = c.req.param('id')

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .select()

  if (error) return c.json({ error }, 500)
  return c.json({ data })
})

export default app
