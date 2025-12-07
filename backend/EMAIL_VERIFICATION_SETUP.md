# Setup Email Verification di Supabase

## 1. Aktifkan Email Confirmation

1. Buka **Supabase Dashboard** → Project Settings → Authentication
2. Scroll ke **Email Auth**
3. Aktifkan **Enable email confirmations**
4. Set **Confirm email** ke `Enabled`

## 2. Konfigurasi Email Templates

1. Buka **Authentication** → **Email Templates**
2. Edit template **Confirm signup**
3. Pastikan redirect URL menggunakan: `{{ .SiteURL }}/auth/callback`

Template contoh:
```html
<h2>Konfirmasi Email Anda</h2>
<p>Klik link di bawah untuk mengaktifkan akun TABE AI Anda:</p>
<p><a href="{{ .ConfirmationURL }}">Konfirmasi Email</a></p>
```

## 3. Site URL Configuration

1. Buka **Project Settings** → **Authentication** → **URL Configuration**
2. Set **Site URL** ke production URL:
   - Development: `http://localhost:3000`
   - Production: `https://hack-front.vercel.app`
3. Tambahkan ke **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://hack-front.vercel.app/auth/callback`

## 4. Email Provider (Optional)

Untuk custom email provider (SendGrid, Mailgun, etc):

1. Buka **Project Settings** → **Authentication** → **Email**
2. Pilih **Custom SMTP**
3. Masukkan SMTP credentials

**Note:** Tanpa custom SMTP, Supabase akan menggunakan default email mereka (terbatas).

## 5. Flow Email Verification

### Register:
1. User register → `/auth/register`
2. Backend create user di Supabase Auth
3. Supabase kirim email verifikasi
4. User cek email (termasuk folder spam)
5. User klik link verifikasi
6. Redirect ke `/auth/callback`
7. Callback page extract token dan tampilkan success
8. Redirect ke `/login`

### Login:
1. User login dengan email belum verified
2. Backend return error: "Email belum diverifikasi"
3. Frontend tampilkan link "Kirim ulang email verifikasi"
4. User klik link
5. Backend call `supabase.auth.resend()`
6. Email verifikasi dikirim ulang

## 6. Testing

### Test Registration:
```bash
curl -X POST https://dcc-hackathon-backend.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "business_name": "Test UMKM"
  }'
```

Response:
```json
{
  "message": "Registrasi berhasil! Cek email Anda untuk verifikasi akun.",
  "needsConfirmation": true
}
```

### Test Login (Before Verification):
```bash
curl -X POST https://dcc-hackathon-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "error": "Email belum diverifikasi. Cek email Anda untuk link verifikasi."
}
```

### Test Resend Verification:
```bash
curl -X POST https://dcc-hackathon-backend.vercel.app/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## 7. Troubleshooting

### Email tidak terkirim:
- Cek folder Spam/Junk
- Verifikasi email provider settings di Supabase
- Cek Supabase logs: Authentication → Logs

### Link verifikasi error:
- Pastikan Redirect URLs sudah dikonfigurasi
- Cek Site URL di Supabase settings
- Clear browser cache

### "Email already registered":
- Email sudah digunakan
- Gunakan email berbeda atau reset password

## 8. Environment Variables

Tambahkan di backend `.env`:
```env
FRONTEND_URL=https://hack-front.vercel.app
```

Atau set di Vercel Environment Variables.

## 9. Security Notes

- Email verification wajib sebelum login
- Token verification otomatis expire setelah 24 jam
- Link verifikasi hanya bisa digunakan sekali
- User tidak bisa login sebelum email verified
