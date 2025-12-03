# Testing Guide - Backend API

## Prerequisites
1. Pastikan `.env` sudah terisi dengan benar (SUPABASE_URL, SUPABASE_KEY, KOLOSAL_API_KEY)
2. Jalankan migration SQL di Supabase (dari file `src/migration.sql`)
3. Server sudah running dengan `bun run dev`

## Test dengan cURL

### 1. Test Endpoint Root
```bash
curl http://localhost:3000
```
Expected: `Hono + Bun + Supabase Connected 🚀`

### 2. Test Generate Copywriting - Formal Style
```bash
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d "{\"namaProduk\": \"Coto Makassar Daeng Tata\", \"jenisKonten\": \"Caption\", \"gayaBahasa\": \"Formal\", \"tujuanKonten\": \"Brand awareness dan meningkatkan penjualan\"}"
```

### 3. Test Generate Copywriting - Makassar Halus
```bash
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d "{\"namaProduk\": \"Pisang Epe\", \"jenisKonten\": \"Story\", \"gayaBahasa\": \"Makassar Halus\", \"tujuanKonten\": \"Promosi produk baru\"}"
```

### 4. Test Generate Copywriting - Gen Z TikTok
```bash
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d "{\"namaProduk\": \"Es Pallu Butung\", \"jenisKonten\": \"Reel\", \"gayaBahasa\": \"Gen Z TikTok\", \"tujuanKonten\": \"Viral di TikTok dan meningkatkan engagement\"}"
```

### 5. Test Get History
```bash
curl http://localhost:3000/api/copywriting/history
```

### 6. Test Get History by ID (ganti {id} dengan UUID dari response sebelumnya)
```bash
curl http://localhost:3000/api/copywriting/history/{id}
```

## Test dengan PowerShell

### 1. Test Generate Copywriting
```powershell
$body = @{
    namaProduk = "Coto Makassar Daeng Tata"
    jenisKonten = "Caption"
    gayaBahasa = "Makassar Halus"
    tujuanKonten = "Brand awareness dan meningkatkan penjualan"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/copywriting" -Method POST -Body $body -ContentType "application/json"
```

### 2. Test Get History
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/copywriting/history" -Method GET
```

## Test dengan Browser/Postman

### POST /api/copywriting
**URL:** `http://localhost:3000/api/copywriting`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "namaProduk": "Konro Bakar Bu Haji",
  "jenisKonten": "Post",
  "gayaBahasa": "Daeng Friendly",
  "tujuanKonten": "Mengajak pelanggan datang ke restoran"
}
```

### GET /api/copywriting/history
**URL:** `http://localhost:3000/api/copywriting/history`
**Method:** GET

## Expected Response Examples

### Successful Generation
```json
{
  "success": true,
  "data": {
    "mainText": "Assalamualaikum Daeng! Cobai mi Konro Bakar Bu Haji yang enak sekali rasanya...",
    "alternatives": [
      "Halo Daeng! Lapar ji? Mari mampir ki di Konro Bakar Bu Haji...",
      "Daeng-daeng semua! Ada menu special ni hari ini di Konro Bakar Bu Haji...",
      "Konro Bakar Bu Haji, enak sekali mi! Daging nya empuk, bumbu nya meresap..."
    ]
  },
  "historyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Validation Error
```json
{
  "error": "Semua field wajib diisi",
  "details": {
    "namaProduk": null,
    "jenisKonten": "Jenis konten wajib diisi",
    "gayaBahasa": null,
    "tujuanKonten": null
  }
}
```

### API Error
```json
{
  "error": "Gagal generate copywriting",
  "message": "Request failed with status code 401"
}
```

## Troubleshooting

### 1. Error: "KOLOSAL_API_KEY is not defined"
**Solution:** 
- Pastikan file `.env` ada di root folder backend
- Pastikan `KOLOSAL_API_KEY` sudah terisi
- Restart server setelah menambahkan env variable

### 2. Error: "Table copywriting_history does not exist"
**Solution:**
- Buka Supabase Dashboard → SQL Editor
- Jalankan query dari file `src/migration.sql`
- Refresh dan coba lagi

### 3. Error: Connection timeout to Kolosal AI
**Solution:**
- Check internet connection
- Verify API key is valid
- Check Kolosal AI service status

### 4. CORS Error
**Solution:**
- Pastikan frontend URL sudah ditambahkan di `src/index.ts`
- Check browser console untuk detail error

## Test Checklist

- [ ] Server bisa running dengan `bun run dev`
- [ ] Endpoint root (`/`) mengembalikan response
- [ ] Generate copywriting dengan style Formal berhasil
- [ ] Generate copywriting dengan style Makassar Halus berhasil
- [ ] Generate copywriting dengan style Daeng Friendly berhasil
- [ ] Generate copywriting dengan style Gen Z TikTok berhasil
- [ ] History tersimpan di database
- [ ] Get history berhasil
- [ ] Get history by ID berhasil
- [ ] Validasi input bekerja dengan baik
- [ ] Error handling berfungsi dengan baik
