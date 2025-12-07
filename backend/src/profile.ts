import { Hono } from 'hono';
import { supabase } from './supabase';
import type { Context, Next } from 'hono';

type Variables = {
  user: any;
};

const profile = new Hono<{ Variables: Variables }>();

// ============================================
// MIDDLEWARE - VERIFY JWT TOKEN
// ============================================
const authMiddleware = async (c: Context<{ Variables: Variables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token tidak ditemukan' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Token tidak valid' }, 401);
    }

    // Simpan user ke context
    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ error: 'Autentikasi gagal' }, 401);
  }
};

// ============================================
// GET USER PROFILE
// ============================================
profile.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Ambil profil dari umkm_profiles
    const { data, error } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      
      // Jika profil tidak ada, return data minimal dari auth
      if (error.code === 'PGRST116') {
        return c.json({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          business_name: null,
          business_code: null,
          created_at: user.created_at
        });
      }
      
      return c.json({ error: 'Gagal mengambil data profil' }, 500);
    }

    return c.json(data);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// GENERATE/REGENERATE BUSINESS CODE
// ============================================
profile.post('/generate-code', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Generate code from user_id (first 8 chars of UUID without dashes + random)
    const baseCode = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const businessCode = `${baseCode}${randomSuffix}`;
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('umkm_profiles')
      .select('id, business_code')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('umkm_profiles')
        .update({ business_code: businessCode })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating business code:', error);
        return c.json({ error: 'Gagal generate kode bisnis' }, 500);
      }

      return c.json({ 
        success: true, 
        business_code: businessCode,
        message: 'Kode bisnis berhasil digenerate'
      });
    } else {
      // Create new profile with business code
      const { data, error } = await supabase
        .from('umkm_profiles')
        .insert({
          user_id: user.id,
          business_code: businessCode
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile with business code:', error);
        return c.json({ error: 'Gagal membuat profil' }, 500);
      }

      return c.json({ 
        success: true, 
        business_code: businessCode,
        message: 'Profil dan kode bisnis berhasil dibuat'
      });
    }
  } catch (error: any) {
    console.error('Generate business code error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================
profile.put('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    // Field yang diperbolehkan untuk update
    const allowedFields = ['business_name', 'phone', 'address', 'description'];
    const updateData: any = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'Tidak ada data untuk diupdate' }, 400);
    }

    // Cek apakah profil sudah ada
    const { data: existingProfile } = await supabase
      .from('umkm_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update profil yang ada
      result = await supabase
        .from('umkm_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Buat profil baru
      result = await supabase
        .from('umkm_profiles')
        .insert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating profile:', result.error);
      return c.json({ error: 'Gagal mengupdate profil' }, 500);
    }

    return c.json(result.data);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

export default profile;
