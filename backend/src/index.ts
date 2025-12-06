import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import { generateCopywriting, type CopywritingRequest } from './kolosalai'
import { generateAIContent, type AIContentRequest, type ContentType } from './ai-content-studio'
import { 
  analyzeImageWithAI, 
  generateTemplateDesign, 
  generateSchedulePlanner,
  type ImageAnalysisRequest,
  type TemplateGenerationRequest,
  type SchedulePlannerRequest,
  type UMKMBrandingRequest
} from './visual-studio'

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
    const validTypes: ContentType[] = ['caption', 'promo', 'branding', 'planner', 'copywriting', 'pricing', 'reply', 'comment']
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
        branding: 0,
        planner: 0,
        copywriting: 0,
        pricing: 0,
        reply: 0,
        comment: 0,
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

// ================================
// 🎯 VISUAL STUDIO - MAIN ENDPOINT: UMKM BRANDING (ALL-IN-ONE)
// ================================
app.post('/api/visual-studio/generate-umkm-branding', async (c) => {
  try {
    const body = await c.req.json()
    const { 
      productImage,
      productName,
      businessType,
      theme,
      brandColor,
      targetMarket,
      format,
      additionalInfo,
      userId 
    } = body

    // Validasi input
    if (!productName || !businessType || !theme || !brandColor || !targetMarket || !format) {
      return c.json({ 
        error: 'Validation error', 
        message: 'productName, businessType, theme, brandColor, targetMarket, dan format wajib diisi' 
      }, 400)
    }

    const request: UMKMBrandingRequest = {
      productImage,
      productName,
      businessType,
      theme,
      brandColor,
      targetMarket,
      format,
      additionalInfo
    }

    console.log('🎨 Processing UMKM Branding request:', {
      productName,
      businessType,
      theme,
      format,
      hasImage: !!productImage
    })

    const { generateUMKMBranding } = await import('./visual-studio')
    const result = await generateUMKMBranding(request)

    // Simpan ke database
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'umkm_branding',
        input_data: { 
          productName, 
          businessType, 
          theme, 
          format,
          hasProductImage: !!productImage
        },
        output_data: {
          success: result.success,
          imageAnalysis: result.imageAnalysis,
          processingTime: result.metadata.processingTime
        },
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/generate-umkm-branding:', error)
    return c.json({ 
      error: 'Gagal generate branding UMKM', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Image Analysis (OLD - Keep for backward compatibility)
// ================================
app.post('/api/visual-studio/analyze-image', async (c) => {
  try {
    const body = await c.req.json()
    const { imageUrl, imageBase64, context, userId } = body

    // Validasi input
    if (!imageUrl && !imageBase64) {
      return c.json({ 
        error: 'Validation error', 
        message: 'imageUrl atau imageBase64 wajib diisi' 
      }, 400)
    }

    const request: ImageAnalysisRequest = {
      imageUrl,
      imageBase64,
      context: context || 'UMKM kuliner Makassar'
    }

    const result = await analyzeImageWithAI(request)

    // Simpan ke database (optional - untuk history)
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'image_analysis',
        input_data: { imageUrl, context },
        output_data: result,
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/analyze-image:', error)
    return c.json({ 
      error: 'Gagal menganalisa gambar', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Template Generation
// ================================
app.post('/api/visual-studio/generate-template', async (c) => {
  try {
    const body = await c.req.json()
    const { imageUrl, imageBase64, templateType, theme, brandColor, targetAudience, userId } = body

    // Validasi input
    if (!templateType || !theme || !targetAudience) {
      return c.json({ 
        error: 'Validation error', 
        message: 'templateType, theme, dan targetAudience wajib diisi' 
      }, 400)
    }

    const validTypes = ['promo', 'story', 'feed', 'reels', 'carousel']
    if (!validTypes.includes(templateType)) {
      return c.json({ 
        error: 'Invalid templateType', 
        message: `templateType harus salah satu dari: ${validTypes.join(', ')}` 
      }, 400)
    }

    const request: TemplateGenerationRequest = {
      imageUrl,
      imageBase64,
      templateType,
      theme,
      brandColor,
      targetAudience
    }

    const result = await generateTemplateDesign(request)

    // Simpan ke database
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'template_generation',
        input_data: { templateType, theme, targetAudience },
        output_data: result,
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/generate-template:', error)
    return c.json({ 
      error: 'Gagal generate template', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Background Removal (Pixian.ai)
// ================================
app.post('/api/visual-studio/remove-background', async (c) => {
  try {
    const body = await c.req.json()
    const { imageBase64, userId } = body

    if (!imageBase64) {
      return c.json({ 
        error: 'Validation error', 
        message: 'imageBase64 wajib diisi' 
      }, 400)
    }

    const { removeBackgroundWithRemoveBg } = await import('./external-apis')
    const result = await removeBackgroundWithRemoveBg(imageBase64)

    if (!result.success) {
      return c.json({ 
        error: 'Background removal failed', 
        message: result.error 
      }, 500)
    }

    // Simpan ke database
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'background_removal',
        input_data: { action: 'remove_background' },
        output_data: { success: true },
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: {
        imageBase64: result.imageBase64
      }
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/remove-background:', error)
    return c.json({ 
      error: 'Gagal menghapus background', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Generate Template Design (Flux)
// ================================
app.post('/api/visual-studio/generate-design', async (c) => {
  try {
    const body = await c.req.json()
    const { prompt, style, userId } = body

    if (!prompt) {
      return c.json({ 
        error: 'Validation error', 
        message: 'prompt wajib diisi' 
      }, 400)
    }

    const { generateTemplateWithHuggingFace } = await import('./external-apis')
    const result = await generateTemplateWithHuggingFace(prompt, style || 'instagram-feed')

    if (!result.success) {
      return c.json({ 
        error: 'Design generation failed', 
        message: result.error 
      }, 500)
    }

    // Simpan ke database
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'design_generation',
        input_data: { prompt, style },
        output_data: result,
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/generate-design:', error)
    return c.json({ 
      error: 'Gagal generate design', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Schedule Planner
// ================================
app.post('/api/visual-studio/schedule-planner', async (c) => {
  try {
    const body = await c.req.json()
    const { imageUrl, contentType, targetAudience, businessGoal, duration, userId } = body

    // Validasi input
    if (!contentType || !targetAudience || !businessGoal || !duration) {
      return c.json({ 
        error: 'Validation error', 
        message: 'contentType, targetAudience, businessGoal, dan duration wajib diisi' 
      }, 400)
    }

    const validGoals = ['awareness', 'engagement', 'sales', 'traffic']
    if (!validGoals.includes(businessGoal)) {
      return c.json({ 
        error: 'Invalid businessGoal', 
        message: `businessGoal harus salah satu dari: ${validGoals.join(', ')}` 
      }, 400)
    }

    const request: SchedulePlannerRequest = {
      imageUrl,
      contentType,
      targetAudience,
      businessGoal,
      duration: parseInt(duration)
    }

    const result = await generateSchedulePlanner(request)

    // Simpan ke database
    const { error: dbError } = await supabase
      .from('visual_studio_activity')
      .insert([{
        user_id: userId || null,
        activity_type: 'schedule_planner',
        input_data: { contentType, targetAudience, businessGoal, duration },
        output_data: result,
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.warn('Warning: Failed to save to DB:', dbError.message)
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/schedule-planner:', error)
    return c.json({ 
      error: 'Gagal generate schedule', 
      message: error.message 
    }, 500)
  }
})

// ================================
// VISUAL STUDIO - Get History
// ================================
app.get('/api/visual-studio/history', async (c) => {
  try {
    const userId = c.req.query('userId')
    const activityType = c.req.query('type') // image_analysis, template_generation, schedule_planner

    let query = supabase
      .from('visual_studio_activity')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return c.json({ success: true, data })

  } catch (error: any) {
    console.error('Error in /api/visual-studio/history:', error)
    return c.json({ 
      error: 'Gagal mengambil history', 
      message: error.message 
    }, 500)
  }
})

// ================================
// TANYA DAENG - AI CHATBOT UMKM
// ================================

app.post('/api/tanya-daeng/chat', async (c) => {
  try {
    const body = await c.req.json()
    const { message, conversationHistory, userContext, userId } = body

    if (!message) {
      return c.json({ 
        error: 'Validation error', 
        message: 'Message wajib diisi' 
      }, 400)
    }

    console.log('💬 Tanya Daeng request:', { message: message.substring(0, 50), userId })

    const { tanyaDaeng } = await import('./tanya-daeng')
    const result = await tanyaDaeng({
      message,
      conversationHistory,
      userContext
    })

    // Save to database (optional)
    if (userId) {
      await supabase
        .from('tanya_daeng_conversations')
        .insert([{
          user_id: userId,
          message,
          reply: result.reply,
          created_at: new Date().toISOString()
        }])
        .select()
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error in /api/tanya-daeng/chat:', error)
    return c.json({ 
      error: 'Gagal memproses chat', 
      message: error.message 
    }, 500)
  }
})

// Get all FAQ
app.get('/api/tanya-daeng/faq', async (c) => {
  try {
    const { getAllFAQ } = await import('./tanya-daeng')
    const faqs = getAllFAQ()

    return c.json({
      success: true,
      data: faqs
    })

  } catch (error: any) {
    console.error('Error in /api/tanya-daeng/faq:', error)
    return c.json({ 
      error: 'Gagal mengambil FAQ', 
      message: error.message 
    }, 500)
  }
})

// ================================
// DAPUR UMKM API ENDPOINTS
// ================================

// === PROFILE ===
// Get user's UMKM profile
app.get('/api/dapur-umkm/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-ID') // Optional: untuk auth nanti
    
    const { data, error } = await supabase
      .from('umkm_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return c.json({
      success: true,
      data: data || null
    })

  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Create or update UMKM profile
app.post('/api/dapur-umkm/profile', async (c) => {
  try {
    const body = await c.req.json()
    const { id, business_name, category, address, phone, email, logo_url, description } = body

    if (!business_name || !category) {
      return c.json({ 
        success: false,
        message: 'Nama usaha dan kategori wajib diisi' 
      }, 400)
    }

    let result
    
    if (id) {
      // Update existing profile
      const { data, error } = await supabase
        .from('umkm_profiles')
        .update({ 
          business_name, 
          category, 
          address, 
          phone, 
          email, 
          logo_url, 
          description 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('umkm_profiles')
        .insert({ 
          business_name, 
          category, 
          address, 
          phone, 
          email, 
          logo_url, 
          description 
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return c.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error saving profile:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Upload logo
app.post('/api/dapur-umkm/upload-logo', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('logo') as File
    const profileId = formData.get('profile_id') as string

    if (!file) {
      return c.json({ 
        success: false,
        message: 'File logo wajib diupload' 
      }, 400)
    }

    if (!profileId) {
      return c.json({ 
        success: false,
        message: 'Profile ID diperlukan' 
      }, 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        success: false,
        message: 'Format file harus JPEG, PNG, WebP, atau GIF' 
      }, 400)
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ 
        success: false,
        message: 'Ukuran file maksimal 5MB' 
      }, 400)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${profileId}-${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('umkm-logos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('umkm-logos')
      .getPublicUrl(filePath)

    // Update profile with new logo URL
    const { data: profile, error: updateError } = await supabase
      .from('umkm_profiles')
      .update({ logo_url: publicUrl })
      .eq('id', profileId)
      .select()
      .single()

    if (updateError) throw updateError

    return c.json({
      success: true,
      data: {
        logo_url: publicUrl,
        profile
      }
    })

  } catch (error: any) {
    console.error('Error uploading logo:', error)
    return c.json({ 
      success: false,
      message: error.message || 'Gagal upload logo'
    }, 500)
  }
})

// Get public profile (for landing page)
app.get('/api/dapur-umkm/public/profile', async (c) => {
  try {
    // Get the first/active profile (you can add logic for active status later)
    const { data, error } = await supabase
      .from('umkm_profiles')
      .select('id, business_name, category, address, phone, email, logo_url, description')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return c.json({
      success: true,
      data: data || null
    })

  } catch (error: any) {
    console.error('Error fetching public profile:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// === PRODUCTS ===
// Get all products
app.get('/api/dapur-umkm/products', async (c) => {
  try {
    const profileId = c.req.query('profile_id')

    let query = supabase.from('umkm_products').select('*').order('created_at', { ascending: false })
    
    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) throw error

    return c.json({
      success: true,
      data: data || []
    })

  } catch (error: any) {
    console.error('Error fetching products:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Add new product
app.post('/api/dapur-umkm/products', async (c) => {
  try {
    const body = await c.req.json()
    const { profile_id, name, price, stock, image_url, category, description, cost_price } = body

    if (!name || !price) {
      return c.json({ 
        success: false,
        message: 'Nama dan harga produk wajib diisi' 
      }, 400)
    }

    const { data, error } = await supabase
      .from('umkm_products')
      .insert({ 
        profile_id,
        name, 
        price, 
        stock: stock || 0, 
        image_url, 
        category, 
        description,
        cost_price: cost_price || 0,
        is_available: true
      })
      .select()
      .single()

    if (error) throw error

    return c.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('Error adding product:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Update product
app.put('/api/dapur-umkm/products/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, price, stock, image_url, category, description, cost_price, is_available } = body

    const { data, error } = await supabase
      .from('umkm_products')
      .update({ 
        name, 
        price, 
        stock, 
        image_url, 
        category, 
        description,
        cost_price,
        is_available
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return c.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('Error updating product:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Delete product
app.delete('/api/dapur-umkm/products/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const { error } = await supabase
      .from('umkm_products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return c.json({
      success: true,
      message: 'Produk berhasil dihapus'
    })

  } catch (error: any) {
    console.error('Error deleting product:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// === TRANSACTIONS ===
// Get all transactions
app.get('/api/dapur-umkm/transactions', async (c) => {
  try {
    const profileId = c.req.query('profile_id')
    const type = c.req.query('type') // 'in' or 'out'

    let query = supabase
      .from('umkm_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return c.json({
      success: true,
      data: data || []
    })

  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Add new transaction
app.post('/api/dapur-umkm/transactions', async (c) => {
  try {
    const body = await c.req.json()
    const { profile_id, transaction_date, description, amount, type, category, product_id, notes } = body

    if (!description || !amount || !type) {
      return c.json({ 
        success: false,
        message: 'Keterangan, jumlah, dan jenis transaksi wajib diisi' 
      }, 400)
    }

    if (!['in', 'out'].includes(type)) {
      return c.json({ 
        success: false,
        message: 'Jenis transaksi harus "in" atau "out"' 
      }, 400)
    }

    const { data, error } = await supabase
      .from('umkm_transactions')
      .insert({ 
        profile_id,
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
        description,
        amount,
        type,
        category,
        product_id,
        notes
      })
      .select()
      .single()

    if (error) throw error

    return c.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('Error adding transaction:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Get financial summary
app.get('/api/dapur-umkm/summary', async (c) => {
  try {
    const profileId = c.req.query('profile_id')

    if (!profileId) {
      return c.json({ 
        success: false,
        message: 'profile_id diperlukan' 
      }, 400)
    }

    const { calculateBusinessMetrics } = await import('./dapur-umkm')
    const metrics = await calculateBusinessMetrics(profileId)

    return c.json({
      success: true,
      data: metrics
    })

  } catch (error: any) {
    console.error('Error calculating summary:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// === AI RECOMMENDATIONS ===
// Get AI business advice
app.post('/api/dapur-umkm/ai-advice', async (c) => {
  try {
    const body = await c.req.json()
    const { profile_id, insight_type, question } = body

    if (!profile_id || !insight_type || !question) {
      return c.json({ 
        success: false,
        message: 'profile_id, insight_type, dan question wajib diisi' 
      }, 400)
    }

    const validTypes = ['pricing', 'inventory', 'strategy', 'marketing', 'finance']
    if (!validTypes.includes(insight_type)) {
      return c.json({ 
        success: false,
        message: `insight_type harus salah satu dari: ${validTypes.join(', ')}` 
      }, 400)
    }

    const { getAIRecommendation } = await import('./dapur-umkm')
    const result = await getAIRecommendation({
      profileId: profile_id,
      insightType: insight_type,
      question
    })

    return c.json(result)

  } catch (error: any) {
    console.error('Error getting AI advice:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Get quick AI insights (pre-defined questions)
app.get('/api/dapur-umkm/quick-insights', async (c) => {
  try {
    const { QUICK_INSIGHTS } = await import('./dapur-umkm')

    return c.json({
      success: true,
      data: QUICK_INSIGHTS
    })

  } catch (error: any) {
    console.error('Error fetching quick insights:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// Get past AI insights history
app.get('/api/dapur-umkm/insights-history', async (c) => {
  try {
    const profileId = c.req.query('profile_id')
    const limit = parseInt(c.req.query('limit') || '10')

    if (!profileId) {
      return c.json({ 
        success: false,
        message: 'profile_id diperlukan' 
      }, 400)
    }

    const { getPastInsights } = await import('./dapur-umkm')
    const result = await getPastInsights(profileId, limit)

    return c.json(result)

  } catch (error: any) {
    console.error('Error fetching insights history:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// ============================================
// DASHBOARD ANALYTICS
// ============================================

// Generate comprehensive dashboard analysis with AI
app.post('/api/dapur-umkm/dashboard-analysis', async (c) => {
  try {
    const body = await c.req.json()
    const { profile_id } = body

    if (!profile_id) {
      return c.json({ 
        success: false,
        message: 'profile_id diperlukan' 
      }, 400)
    }

    const { generateDashboardAnalysis } = await import('./dapur-umkm')
    const result = await generateDashboardAnalysis(profile_id)

    return c.json(result)

  } catch (error: any) {
    console.error('Error generating dashboard analysis:', error)
    return c.json({ 
      success: false,
      message: error.message || 'Gagal generate analisis dashboard',
      error: error.toString()
    }, 500)
  }
})

// Get dashboard overview (all data in one call)
app.get('/api/dapur-umkm/dashboard-overview', async (c) => {
  try {
    const profileId = c.req.query('profile_id')

    if (!profileId) {
      return c.json({ 
        success: false,
        message: 'profile_id diperlukan' 
      }, 400)
    }

    // Fetch all data in parallel
    const [profile, products, transactions, insights, summary] = await Promise.all([
      supabase.from('umkm_profiles').select('*').eq('id', profileId).single(),
      supabase.from('umkm_products').select('*').eq('profile_id', profileId),
      supabase.from('umkm_transactions').select('*').eq('profile_id', profileId).order('transaction_date', { ascending: false }).limit(50),
      supabase.from('umkm_ai_insights').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(10),
      supabase.from('umkm_financial_summary').select('*').eq('profile_id', profileId).single()
    ])

    // Calculate metrics
    const { calculateBusinessMetrics } = await import('./dapur-umkm')
    const metrics = await calculateBusinessMetrics(profileId)

    return c.json({
      success: true,
      data: {
        profile: profile.data,
        products: products.data || [],
        transactions: transactions.data || [],
        insights: insights.data || [],
        summary: summary.data,
        metrics
      }
    })

  } catch (error: any) {
    console.error('Error fetching dashboard overview:', error)
    return c.json({ 
      success: false,
      message: error.message 
    }, 500)
  }
})

// ============================================
// MONTHLY REPORT
// ============================================

// Get monthly transaction report
app.get('/api/dapur-umkm/report', async (c) => {
  try {
    const profileId = c.req.query('profile_id')
    const month = parseInt(c.req.query('month') || '0')
    const year = parseInt(c.req.query('year') || new Date().getFullYear().toString())

    if (!profileId) {
      return c.json({ 
        success: false,
        message: 'profile_id diperlukan' 
      }, 400)
    }

    if (month < 1 || month > 12) {
      return c.json({ 
        success: false,
        message: 'month harus antara 1-12' 
      }, 400)
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    console.log('Fetching report for:', { profileId, startDate, endDate })

    // Get transactions for the month
    const { data: transactions, error } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Calculate summary
    const totalIncome = transactions
      ?.filter(t => t.type === 'in')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const totalExpense = transactions
      ?.filter(t => t.type === 'out')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const balance = totalIncome - totalExpense

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    return c.json({
      success: true,
      data: {
        month: monthNames[month - 1],
        year,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0,
        transactions: transactions || []
      }
    })

  } catch (error: any) {
    console.error('Error fetching monthly report:', error)
    return c.json({ 
      success: false,
      message: error.message || 'Gagal mengambil laporan bulanan'
    }, 500)
  }
})

export default app
