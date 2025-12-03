# 🚀 QUICK START - Backend Setup dalam 5 Menit

## Step 1: Install Dependencies (30 detik)
```bash
cd backend
bun install
```

## Step 2: Setup API Key Kolosal AI (2 menit)

### Dapatkan API Key:
1. Buka https://kolosal.ai atau https://console.kolosal.ai
2. Login/Register
3. Dashboard → API Keys → Create New
4. Copy API key

### Isi ke .env:
```bash
# Edit file .env
KOLOSAL_API_KEY=sk-xxxxxxxxxxxxxxxx  # Paste API key di sini
```

## Step 3: Setup Database Supabase (2 menit)

1. Buka https://supabase.com/dashboard
2. Project → SQL Editor
3. Copy-paste isi file `src/migration.sql`
4. Run query

**SQL Query:**
```sql
CREATE TABLE IF NOT EXISTS copywriting_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_produk VARCHAR(255) NOT NULL,
  jenis_konten VARCHAR(100) NOT NULL,
  gaya_bahasa VARCHAR(100) NOT NULL,
  tujuan_konten TEXT NOT NULL,
  main_text TEXT NOT NULL,
  alternatives JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copywriting_history_created_at ON copywriting_history(created_at DESC);
```

## Step 4: Run Backend (10 detik)
```bash
bun run dev
```

✅ Backend running di: http://localhost:3000

## Step 5: Test API (30 detik)

### Test 1: Root Endpoint
```bash
curl http://localhost:3000
```
Expected: `Hono + Bun + Supabase Connected 🚀`

### Test 2: Generate Copywriting
```bash
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d "{\"namaProduk\": \"Coto Makassar\", \"jenisKonten\": \"Caption\", \"gayaBahasa\": \"Makassar Halus\", \"tujuanKonten\": \"Brand awareness\"}"
```

Expected: JSON dengan `mainText` dan `alternatives`

---

## ✨ SELESAI! Backend siap digunakan!

## Next: Integrasikan dengan Frontend

Update `frontend/src/app/(dashboard)/copywriting/page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('http://localhost:3000/api/copywriting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  console.log(data); // Check hasil
};
```

---

## 🆘 Troubleshooting Cepat

| Problem | Solution |
|---------|----------|
| Error: KOLOSAL_API_KEY not defined | Edit `.env`, isi `KOLOSAL_API_KEY` |
| Table does not exist | Run migration SQL di Supabase |
| Port 3000 already in use | Kill process atau ubah port |
| CORS Error | Update `origin` di `src/index.ts` |

---

## 📚 Dokumentasi Lengkap

- `SUMMARY.md` - Overview lengkap
- `README_NEW.md` - Dokumentasi detail
- `KOLOSAL_AI_SETUP.md` - Setup API detail
- `FRONTEND_INTEGRATION.md` - Integrasi frontend
- `TESTING.md` - Testing guide

---

**Total waktu setup: ~5 menit**

Happy Hacking! 🎉
