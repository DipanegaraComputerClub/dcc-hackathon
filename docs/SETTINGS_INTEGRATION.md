# Settings Integration - Dynamic Landing Page

## Overview
Fitur settings UMKM yang terintegrasi dengan landing page. Setiap perubahan di settings akan langsung terlihat di landing page secara real-time.

## Features

### 1. **Profil Bisnis UMKM**
- Nama Bisnis (required)
- Kategori (dropdown)
- Alamat
- Nomor Telepon
- Email
- Deskripsi Bisnis

### 2. **Logo Upload**
- Format: JPEG, PNG, WebP, GIF
- Max size: 5MB
- Preview sebelum upload
- Langsung tersimpan ke Supabase Storage
- Auto-update di navbar & hero landing page

### 3. **Real-time Updates**
- Perubahan langsung terlihat di landing page
- Support multi-tab (localStorage event)
- Support same-tab (custom event)

## How It Works

### Settings Page (`/settings`)
1. Load data dari `/api/dapur-umkm/profile` saat mount
2. User edit form (nama bisnis, alamat, deskripsi, dll)
3. User upload logo (optional)
4. Click "Simpan Semua Perubahan"
5. POST ke `/api/dapur-umkm/profile`
6. Trigger event: `localStorage.setItem('profile_updated')` & `window.dispatchEvent('profileUpdated')`

### Landing Page (`/`)
1. Load data dari `/api/dapur-umkm/public/profile` saat mount
2. Listen to events:
   - `storage` event (untuk cross-tab updates)
   - `profileUpdated` event (untuk same-tab updates)
3. Auto-refresh profile ketika ada perubahan
4. Update navbar logo & hero section

## API Endpoints Used

### GET `/api/dapur-umkm/profile`
Load existing profile data (authenticated)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "Coto Makassar Pak Amir",
    "category": "Kuliner / Makanan",
    "address": "Jl. Pengayoman No. 10, Makassar",
    "phone": "0812-3456-7890",
    "email": "bisnis@example.com",
    "description": "Coto Makassar legendaris sejak 1990",
    "logo_url": "https://supabase.co/storage/.../logo.png"
  }
}
```

### POST `/api/dapur-umkm/profile`
Save/update profile

**Request:**
```json
{
  "id": "uuid (optional, for update)",
  "business_name": "Coto Makassar Pak Amir",
  "category": "Kuliner / Makanan",
  "address": "Jl. Pengayoman No. 10, Makassar",
  "phone": "0812-3456-7890",
  "email": "bisnis@example.com",
  "description": "Coto Makassar legendaris sejak 1990"
}
```

### POST `/api/dapur-umkm/upload-logo`
Upload logo to Supabase Storage

**Request (FormData):**
```
logo: File (image)
profile_id: uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { /* updated profile with new logo_url */ },
    "storage": {
      "path": "uuid-timestamp.ext",
      "publicUrl": "https://..."
    }
  }
}
```

### GET `/api/dapur-umkm/public/profile`
Get public profile (no auth required, for landing page)

**Response:**
```json
{
  "success": true,
  "data": {
    "business_name": "Coto Makassar Pak Amir",
    "category": "Kuliner / Makanan",
    "logo_url": "https://...",
    "description": "...",
    "address": "..."
  }
}
```

## UI Components

### Settings Page Structure
```
┌─ Settings UMKM Header ────────────────────┐
│  "Kelola profil bisnis - perubahan akan   │
│   langsung terlihat di landing page"      │
│                      [Lihat Landing Page] │
└───────────────────────────────────────────┘

┌─ Profil Bisnis UMKM ──────────────────────┐
│  Nama Bisnis*: [________________]          │
│  Kategori: [Dropdown]                      │
│  Alamat: [________________]                │
│  Telepon: [________________]               │
│  Email: [________________]                 │
│  Deskripsi: [Textarea]                     │
└───────────────────────────────────────────┘

┌─ Logo UMKM ───────────────────────────────┐
│  [Logo Preview Image]                      │
│  Upload Logo: [Choose File]                │
│  ℹ️ JPEG, PNG, WebP, GIF - Max 5MB        │
└───────────────────────────────────────────┘

[💾 Simpan Semua Perubahan] (with loading state)
```

### Landing Page Dynamic Elements
```
Navbar:
┌─────────────────────────────────────────┐
│ [Logo] Nama Bisnis      [Menu Links]   │
└─────────────────────────────────────────┘

Hero Section:
┌─ UMKM Profile Card ────────────────────┐
│  [Logo]  Nama Bisnis                   │
│          Kategori                      │
│          📍 Alamat                     │
│          Deskripsi...                  │
└────────────────────────────────────────┘
```

## Testing Steps

1. **Backend Running**
   ```bash
   cd backend
   bun run dev  # Port 3000
   ```

2. **Frontend Running**
   ```bash
   cd frontend
   bun run dev  # Port 1997
   ```

3. **Test Flow**
   - Open `http://localhost:1997` (landing page) di tab 1
   - Open `http://localhost:1997/settings` di tab 2
   - Edit nama bisnis di tab 2
   - Click "Simpan Semua Perubahan"
   - Check tab 1 → navbar & hero harus update otomatis

4. **Test Logo Upload**
   - Pastikan profil sudah tersimpan (ada ID)
   - Upload logo di settings
   - Logo langsung muncul di landing page navbar & hero

## Database Schema

### Table: `umkm_profiles`
```sql
CREATE TABLE umkm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category TEXT DEFAULT 'Kuliner / Makanan',
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage Bucket: `umkm-logos`
- Public access
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- RLS policies: SELECT/INSERT/UPDATE/DELETE allowed for public

## Notes

- **Validation**: Business name adalah field required
- **Logo Requirement**: Profil harus tersimpan dulu (memiliki ID) sebelum upload logo
- **Storage Path**: `{profile_id}-{timestamp}.{ext}`
- **Auto-refresh**: Landing page akan auto-refresh dalam 1-2 detik setelah save
- **Error Handling**: Toast notifications untuk success/error messages
- **Loading States**: Spinner saat save/upload in progress

## Future Enhancements

1. **Tone of Voice Integration**
   - Add `tone` field to `umkm_profiles` table
   - Pass tone preference to AI recommendation system
   - Adjust AI personality based on tone setting

2. **Multiple Images**
   - Support product gallery uploads
   - Display product images in landing page

3. **Preview Mode**
   - Real-time preview panel di settings page
   - See changes before saving

4. **Analytics**
   - Track profile views
   - Monitor logo impressions
