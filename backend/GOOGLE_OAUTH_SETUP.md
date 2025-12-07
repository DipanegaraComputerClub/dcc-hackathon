# Setup Google OAuth di Supabase

## ⚠️ QUICK START - Urutan Penting!

Ikuti langkah ini berurutan untuk menghindari error:

1. ✅ **Buat Google OAuth Credentials** (5 menit)
2. ✅ **Enable Google Provider di Supabase** (WAJIB!) 
3. ✅ **Set Redirect URLs di Supabase**
4. ✅ **Test login**

---

## 1. Buat Google OAuth Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project atau buat project baru
3. Navigate ke **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth 2.0 Client IDs**
5. Pilih **Application type**: Web application
6. Tambahkan **Authorized redirect URIs**:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   Ganti `[YOUR-SUPABASE-PROJECT-REF]` dengan project reference Anda

7. Copy **Client ID** dan **Client Secret**

## 2. Configure di Supabase Dashboard

**PENTING: LAKUKAN INI TERLEBIH DAHULU!**

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Authentication** di sidebar kiri
4. Klik tab **Providers**
5. Scroll ke bawah cari **Google** 
6. Klik pada card Google
7. Toggle switch **Enable Sign in with Google** → ON (hijau)
8. Isi form:
   - **Client ID (for OAuth)**: Paste dari Google Console
   - **Client Secret (for OAuth)**: Paste dari Google Console
   - **Authorized Client IDs**: (kosongkan jika tidak tahu)
9. Klik **Save** di kanan bawah

**⚠️ TANPA ENABLE INI, AKAN ERROR:**
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

**Cara Cek Sudah Enable:**
- Buka Providers lagi
- Google harus ada tulisan "Enabled" atau switch hijau
- Jika masih abu-abu, berarti belum enable

## 3. Configure Redirect URLs

Di Supabase Dashboard → **Authentication** → **URL Configuration**:

**Site URL**: 
```
https://hack-front.vercel.app
```

**Redirect URLs** (tambahkan):
```
https://hack-front.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

## 4. Update Environment Variables

Backend `.env`:
```env
FRONTEND_URL=https://hack-front.vercel.app
```

## 5. Flow Google OAuth

### Login Flow:
1. User klik "Login dengan Google"
2. Frontend call `GET /auth/google` untuk dapat auth URL
3. Redirect user ke Google OAuth consent screen
4. User approve permissions
5. Google redirect ke `/auth/callback` dengan tokens
6. Frontend save tokens ke localStorage
7. Redirect ke `/dashboard`

### Auto Profile Creation:
- Jika user login pertama kali via Google
- Backend otomatis create profile di `umkm_profiles`
- Business name diambil dari Google full name atau email

## 6. Testing

### Test Login:
1. Buka https://hack-front.vercel.app/login
2. Klik "Login dengan Google"
3. Pilih akun Google
4. Approve permissions
5. Akan redirect ke dashboard

### Test Register:
1. Buka https://hack-front.vercel.app/register
2. Klik "Daftar dengan Google"
3. Same flow as login

## 7. Troubleshooting

### Error: "redirect_uri_mismatch"
- Check redirect URI di Google Console
- Harus exact match dengan Supabase callback URL
- Format: `https://[project-ref].supabase.co/auth/v1/callback`

### Error: "Email link expired"
- Link verifikasi hanya valid 24 jam
- User bisa request link baru di halaman login
- Klik "Kirim ulang email verifikasi"

### Error: "Access denied"
- User cancel OAuth consent
- User tidak approve permissions
- Coba lagi dengan approve

### Profile tidak terbuat
- Check RLS policies di `umkm_profiles`
- Check SQL migration sudah dijalankan
- Check logs di Supabase Dashboard

## 8. Security Notes

- Google OAuth lebih aman dari password
- Tidak perlu handle password reset
- Email sudah terverifikasi by Google
- User bisa logout untuk revoke access

## 9. API Endpoints

### Get Google Auth URL
```bash
GET /auth/google

Response:
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Handle Callback (Internal)
```bash
POST /auth/callback
Content-Type: application/json

{
  "access_token": "token",
  "refresh_token": "refresh_token"
}
```

## 10. Frontend Implementation

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginButton() {
  const { loginWithGoogle } = useAuth();
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Will redirect to Google OAuth
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <button onClick={handleGoogleLogin}>
      Login dengan Google
    </button>
  );
}
```

## 11. Temporary: Disable Google Button

Jika belum siap setup Google OAuth, bisa disable sementara:

**Frontend: `src/app/(auth)/login/page.tsx`**
```tsx
{/* Uncomment untuk enable Google login */}
{/* 
<Button onClick={handleGoogleLogin}>
  Login dengan Google
</Button>
*/}
```

Atau tambahkan conditional:
```tsx
const GOOGLE_OAUTH_ENABLED = false; // Set true setelah setup

{GOOGLE_OAUTH_ENABLED && (
  <Button onClick={handleGoogleLogin}>
    Login dengan Google
  </Button>
)}
```

## 12. Next Steps

- [ ] Setup Google OAuth credentials
- [ ] Configure Supabase providers (WAJIB!)
- [ ] Test login flow
- [ ] Test register flow
- [ ] Verify profile creation
- [ ] Test on production

## 12. Additional Providers (Optional)

Anda juga bisa tambahkan providers lain:
- GitHub
- Facebook
- Twitter
- Discord
- etc.

Sama seperti Google, tinggal enable di Supabase dan tambahkan credentials.
