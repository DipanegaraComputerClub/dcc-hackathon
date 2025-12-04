import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import { generateCopywriting, type CopywritingRequest } from './kolosalai'
import { generateAIContent, type AIContentRequest, type ContentType } from './ai-content-studio'

const app = new Hono()

// Enable CORS untuk frontend
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:1997'], // Sesuaikan dengan port frontend
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

// ================================
// AI CONTENT STUDIO - Generate Content
// ================================
app.post('/api/ai-content', async (c) => {
  try {
    const body = await c.req.json()
    const { type, inputText, metadata, userId } = body

    // Validasi input
    if (!type || !inputText) {
      return c.json({ 
        error: 'Validation error', 
        message: 'type dan inputText wajib diisi' 
      }, 400)
    }

    // Validasi type
    const validTypes: ContentType[] = ['caption', 'promo', 'brand_voice', 'comment_analysis', 'auto_reply', 'pricing']
    if (!validTypes.includes(type)) {
      return c.json({ 
        error: 'Invalid type', 
        message: `Type harus salah satu dari: ${validTypes.join(', ')}` 
      }, 400)
    }

    // Generate AI Content
    const request: AIContentRequest = {
      type,
      inputText,
      metadata: metadata || {}
    }

    const result = await generateAIContent(request)

    // Simpan ke database
    const { data: savedData, error: dbError } = await supabase
      .from('ai_content_activity')
      .insert([{
        user_id: userId || null,
        type: result.type,
        input_text: result.inputText,
        output_text: result.outputText,
        metadata: result.metadata
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Error saving to database:', dbError)
      // Tetap return hasil AI meskipun gagal save ke DB
      return c.json({
        success: true,
        data: result,
        warning: 'Berhasil generate tapi gagal menyimpan ke history'
      })
    }

    return c.json({
      success: true,
      data: {
        id: savedData.id,
        ...result,
        createdAt: savedData.created_at
      }
    })

  } catch (error: any) {
    console.error('Error in /api/ai-content:', error)
    return c.json({ 
      error: 'Gagal generate content', 
      message: error.message 
    }, 500)
  }
})

// ================================
// AI CONTENT STUDIO - Get History (All Types)
// ================================
app.get('/api/ai-content/history', async (c) => {
  try {
    const userId = c.req.query('userId')
    const type = c.req.query('type') as ContentType | undefined
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = supabase
      .from('ai_content_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by userId jika ada
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by type jika ada
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching history:', error)
      return c.json({ error: 'Gagal mengambil history' }, 500)
    }

    return c.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || data?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Error in /api/ai-content/history:', error)
    return c.json({ 
      error: 'Gagal mengambil history', 
      message: error.message 
    }, 500)
  }
})

// ================================
// AI CONTENT STUDIO - Get History by ID
// ================================
app.get('/api/ai-content/history/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('ai_content_activity')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return c.json({ error: 'History tidak ditemukan' }, 404)
    }

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in /api/ai-content/history/:id:', error)
    return c.json({ 
      error: 'Gagal mengambil history', 
      message: error.message 
    }, 500)
  }
})

// ================================
// AI CONTENT STUDIO - Delete History
// ================================
app.delete('/api/ai-content/history/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const { error } = await supabase
      .from('ai_content_activity')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting history:', error)
      return c.json({ error: 'Gagal menghapus history' }, 500)
    }

    return c.json({ 
      success: true, 
      message: 'History berhasil dihapus' 
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/ai-content/history/:id:', error)
    return c.json({ 
      error: 'Gagal menghapus history', 
      message: error.message 
    }, 500)
  }
})

// ================================
// AI CONTENT STUDIO - Get Stats
// ================================
app.get('/api/ai-content/stats', async (c) => {
  try {
    const userId = c.req.query('userId')

    let query = supabase
      .from('ai_content_activity')
      .select('type, created_at')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching stats:', error)
      return c.json({ error: 'Gagal mengambil statistik' }, 500)
    }

    // Hitung statistik per type
    const stats = {
      total: data?.length || 0,
      byType: {
        caption: 0,
        promo: 0,
        brand_voice: 0,
        comment_analysis: 0,
        auto_reply: 0,
        pricing: 0,
      },
      recentActivity: data?.slice(0, 10) || []
    }

    data?.forEach(item => {
      if (item.type in stats.byType) {
        stats.byType[item.type as ContentType]++
      }
    })

    return c.json({ success: true, data: stats })

  } catch (error: any) {
    console.error('Error in /api/ai-content/stats:', error)
    return c.json({ 
      error: 'Gagal mengambil statistik', 
      message: error.message 
    }, 500)
  }
})

export default app
