import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import { generateCopywriting, type CopywritingRequest } from './kolosalai'

const app = new Hono()

// Enable CORS untuk frontend
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Sesuaikan dengan port frontend
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

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

// ================================
// AI COPYWRITING
// ================================
app.post('/api/copywriting', async (c) => {
  try {
    const body = await c.req.json()
    const { namaProduk, jenisKonten, gayaBahasa, tujuanKonten } = body as CopywritingRequest

    // Validasi input
    if (!namaProduk || !jenisKonten || !gayaBahasa || !tujuanKonten) {
      return c.json(
        { 
          error: 'Semua field wajib diisi',
          details: {
            namaProduk: !namaProduk ? 'Nama produk wajib diisi' : null,
            jenisKonten: !jenisKonten ? 'Jenis konten wajib diisi' : null,
            gayaBahasa: !gayaBahasa ? 'Gaya bahasa wajib diisi' : null,
            tujuanKonten: !tujuanKonten ? 'Tujuan konten wajib diisi' : null,
          }
        },
        400
      )
    }

    // Generate copywriting dengan AI
    const result = await generateCopywriting({
      namaProduk,
      jenisKonten,
      gayaBahasa,
      tujuanKonten,
    })

    // Optional: Simpan ke database untuk history
    const { data: historyData, error: historyError } = await supabase
      .from('copywriting_history')
      .insert([
        {
          nama_produk: namaProduk,
          jenis_konten: jenisKonten,
          gaya_bahasa: gayaBahasa,
          tujuan_konten: tujuanKonten,
          main_text: result.mainText,
          alternatives: result.alternatives,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    // Jika error simpan history, log saja tapi tetap return result
    if (historyError) {
      console.error('Error saving history:', historyError)
    }

    return c.json({
      success: true,
      data: result,
      historyId: historyData?.[0]?.id || null,
    })
  } catch (error: any) {
    console.error('Error in /api/copywriting:', error)
    return c.json(
      { 
        error: 'Gagal generate copywriting', 
        message: error.message || 'Internal server error' 
      },
      500
    )
  }
})

// ================================
// GET COPYWRITING HISTORY
// ================================
app.get('/api/copywriting/history', async (c) => {
  try {
    const { data, error } = await supabase
      .from('copywriting_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching history:', error)
      return c.json({ error: error.message }, 500)
    }

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in /api/copywriting/history:', error)
    return c.json({ error: 'Gagal mengambil history', message: error.message }, 500)
  }
})

// ================================
// GET COPYWRITING HISTORY BY ID
// ================================
app.get('/api/copywriting/history/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('copywriting_history')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return c.json({ error: 'History tidak ditemukan' }, 404)
    }

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in /api/copywriting/history/:id:', error)
    return c.json({ error: 'Gagal mengambil history', message: error.message }, 500)
  }
})

export default app
