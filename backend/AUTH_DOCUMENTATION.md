# Panduan Setup Authentication

## 1. Jalankan Migration Database

Buka Supabase Dashboard → SQL Editor, lalu jalankan SQL berikut:

```sql
-- Add user_id column to umkm_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'umkm_profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE umkm_profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_umkm_profiles_user_id ON umkm_profiles(user_id);
        
        ALTER TABLE umkm_profiles 
        ADD CONSTRAINT unique_user_profile UNIQUE(user_id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE umkm_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON umkm_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON umkm_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON umkm_profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
ON umkm_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON umkm_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON umkm_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 2. API Endpoints

### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nama User",
  "business_name": "Nama Bisnis (optional)",
  "category": "Kuliner (optional)",
  "phone": "08123456789 (optional)"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login berhasil",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nama User",
    "profile_id": "uuid",
    "business_name": "Nama Bisnis",
    "category": "Kuliner"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "refresh_token",
    "expires_at": timestamp
  }
}
```

### Get Current User
```bash
GET /auth/me
Authorization: Bearer <access_token>

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nama User",
    "profile_id": "uuid",
    "business_name": "Nama Bisnis",
    "category": "Kuliner"
  }
}
```

### Logout
```bash
POST /auth/logout
Authorization: Bearer <access_token>
```

### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}
```

## 3. Frontend Integration

Auth context sudah tersedia di `src/contexts/AuthContext.tsx`

### Cara Pakai:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, register, logout, isLoading } = useAuth();

  // Login
  await login(email, password);

  // Register
  await register({
    email,
    password,
    name,
    business_name
  });

  // Logout
  await logout();

  // Check user
  if (user) {
    console.log('Logged in:', user.email);
  }
}
```

## 4. Testing

### Register User Baru:
1. Buka: https://hack-front.vercel.app/register
2. Isi form registrasi
3. Klik "Daftar Sekarang"
4. Akan redirect ke /login

### Login:
1. Buka: https://hack-front.vercel.app/login
2. Masukkan email & password
3. Klik "Masuk"
4. Akan redirect ke /dashboard

## 5. Environment Variables

Pastikan Supabase credentials sudah ada di `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## 6. Security Notes

- Password minimal 6 karakter
- Email harus unique
- Access token disimpan di localStorage
- RLS (Row Level Security) enabled untuk umkm_profiles
- Users hanya bisa akses data mereka sendiri
- Auto-logout jika token invalid

## 7. Troubleshooting

### Error: "Email sudah terdaftar"
- Email sudah digunakan, gunakan email lain

### Error: "Invalid token"
- Token expired atau invalid
- Clear localStorage dan login lagi

### Error: "Gagal membuat profile"
- Check Supabase RLS policies
- Pastikan migration sudah dijalankan

### Error: "CORS"
- Check CORS configuration di backend
- Pastikan frontend URL ada di allowlist
