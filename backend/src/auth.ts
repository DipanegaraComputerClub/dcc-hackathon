import { Hono } from 'hono';
import { supabase } from './supabase';

const auth = new Hono();

// ============================================
// REGISTER
// ============================================
auth.post('/register', async (c) => {
  try {
    const { email, password, name, business_name, category, phone } = await c.req.json();

    // Validate required fields
    if (!email || !password) {
      return c.json({ error: 'Email dan password wajib diisi' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password minimal 6 karakter' }, 400);
    }

    // Create auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'https://hack-front.vercel.app'}/auth/callback`
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.message.includes('already registered')) {
        return c.json({ error: 'Email sudah terdaftar' }, 400);
      }
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Gagal membuat akun' }, 400);
    }

    // Check if email confirmation is required
    const needsConfirmation = authData.user.identities && authData.user.identities.length === 0;

    // Create UMKM profile
    const { data: profile, error: profileError } = await supabase
      .from('umkm_profiles')
      .insert([{
        user_id: authData.user.id,
        business_name: business_name || name || 'UMKM Baru',
        category: category || 'Kuliner',
        phone: phone || '',
        address: '',
        description: ''
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Note: Don't delete user if profile fails, they can retry or admin can fix
    }

    return c.json({
      message: needsConfirmation 
        ? 'Registrasi berhasil! Cek email Anda untuk verifikasi akun.' 
        : 'Registrasi berhasil! Silakan login.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        profile_id: profile?.id || null
      },
      needsConfirmation
    }, 201);

  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// LOGIN
// ============================================
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email dan password wajib diisi' }, 400);
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      
      // Check if it's an email not confirmed error
      if (authError.message.includes('Email not confirmed')) {
        return c.json({ 
          error: 'Email belum diverifikasi. Cek email Anda untuk link verifikasi.' 
        }, 403);
      }
      
      return c.json({ error: 'Email atau password salah' }, 401);
    }

    if (!authData.user || !authData.session) {
      return c.json({ error: 'Login gagal' }, 401);
    }

    // Check if email is confirmed
    if (!authData.user.email_confirmed_at) {
      return c.json({ 
        error: 'Email belum diverifikasi. Cek email Anda untuk link verifikasi.' 
      }, 403);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    return c.json({
      message: 'Login berhasil',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || email.split('@')[0],
        profile_id: profile?.id || null,
        business_name: profile?.business_name || null,
        category: profile?.category || null
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// LOGOUT
// ============================================
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return c.json({ error: 'Logout gagal' }, 500);
    }

    return c.json({ message: 'Logout berhasil' });

  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// GET CURRENT USER
// ============================================
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        profile_id: profile?.id || null,
        business_name: profile?.business_name || null,
        category: profile?.category || null
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// REFRESH TOKEN
// ============================================
auth.post('/refresh', async (c) => {
  try {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
      return c.json({ error: 'Refresh token required' }, 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data.session) {
      return c.json({ error: 'Invalid refresh token' }, 401);
    }

    return c.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error: any) {
    console.error('Refresh token error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
auth.post('/resend-verification', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email required' }, 400);
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'https://hack-front.vercel.app'}/auth/callback`
      }
    });

    if (error) {
      console.error('Resend verification error:', error);
      return c.json({ error: 'Gagal mengirim ulang email verifikasi' }, 500);
    }

    return c.json({ 
      message: 'Email verifikasi telah dikirim ulang. Cek inbox atau folder spam Anda.' 
    });

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// GOOGLE OAUTH - GET AUTH URL
// ============================================
auth.get('/google', async (c) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.FRONTEND_URL || 'https://hack-front.vercel.app'}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return c.json({ error: 'Gagal memulai login dengan Google' }, 500);
    }

    return c.json({ url: data.url });

  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// HANDLE OAUTH CALLBACK
// ============================================
auth.post('/callback', async (c) => {
  try {
    const { access_token, refresh_token } = await c.req.json();

    if (!access_token) {
      return c.json({ error: 'Token tidak valid' }, 400);
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);

    if (userError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Check if user has profile
    let { data: profile, error: profileError } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Create profile if doesn't exist (for OAuth users)
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('umkm_profiles')
        .insert([{
          user_id: user.id,
          business_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'UMKM Baru',
          category: 'Kuliner',
          phone: '',
          address: '',
          description: ''
        }])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
      } else {
        profile = newProfile;
      }
    }

    return c.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        profile_id: profile?.id || null,
        business_name: profile?.business_name || null,
        category: profile?.category || null
      }
    });

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

export default auth;
