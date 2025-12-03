# Backend - AI Copywriting untuk UMKM Kuliner Makassar

Backend API untuk platform AI copywriting yang menggunakan Kolosal AI dan Supabase.

## 🚀 Teknologi yang Digunakan

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: Supabase (PostgreSQL)
- **AI**: Kolosal AI API
- **HTTP Client**: Axios

## 📦 Instalasi

```bash
# Install dependencies
bun install
```

## ⚙️ Konfigurasi

1. Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Isi environment variables di file `.env`:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
KOLOSAL_API_KEY=your_kolosal_ai_api_key_here
PORT=3001
```

3. Buat tabel di Supabase:
   - Buka Supabase Dashboard
   - Pergi ke SQL Editor
   - Copy isi file `src/migration.sql`
   - Jalankan query tersebut

## 🏃‍♂️ Menjalankan Server

```bash
# Development mode dengan hot reload
bun run dev
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### 1. Generate Copywriting dengan AI

**POST** `/api/copywriting`

Generate copywriting menggunakan AI berdasarkan input dari user.

**Request Body:**
```json
{
  "namaProduk": "Coto Makassar Daeng Tata",
  "jenisKonten": "Caption",
  "gayaBahasa": "Makassar Halus",
  "tujuanKonten": "Brand awareness dan mengajak orang untuk datang"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "Enak sekali mi Coto Makassar Daeng Tata! Kuah nya gurih, daging nya empuk...",
    "alternatives": [
      "Alternatif 1...",
      "Alternatif 2...",
      "Alternatif 3..."
    ]
  },
  "historyId": "uuid-here"
}
```

**Error Response:**
```json
{
  "error": "Semua field wajib diisi",
  "details": {
    "namaProduk": "Nama produk wajib diisi",
    "jenisKonten": null,
    "gayaBahasa": null,
    "tujuanKonten": null
  }
}
```

### 2. Get Copywriting History

**GET** `/api/copywriting/history`

Mendapatkan history copywriting yang sudah di-generate (50 terakhir).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nama_produk": "Coto Makassar Daeng Tata",
      "jenis_konten": "Caption",
      "gaya_bahasa": "Makassar Halus",
      "tujuan_konten": "Brand awareness",
      "main_text": "...",
      "alternatives": ["...", "...", "..."],
      "created_at": "2025-12-04T10:00:00Z",
      "updated_at": "2025-12-04T10:00:00Z"
    }
  ]
}
```

### 3. Get Copywriting History by ID

**GET** `/api/copywriting/history/:id`

Mendapatkan detail history copywriting berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nama_produk": "Coto Makassar Daeng Tata",
    "jenis_konten": "Caption",
    "gaya_bahasa": "Makassar Halus",
    "tujuan_konten": "Brand awareness",
    "main_text": "...",
    "alternatives": ["...", "...", "..."],
    "created_at": "2025-12-04T10:00:00Z",
    "updated_at": "2025-12-04T10:00:00Z"
  }
}
```

### 4. Menu CRUD (Legacy - untuk testing)

- **GET** `/menus` - Get all menus
- **GET** `/menus/:id` - Get menu by ID
- **POST** `/menus` - Create menu
- **PUT** `/menus/:id` - Update menu
- **DELETE** `/menus/:id` - Delete menu

## 🎨 Pilihan Gaya Bahasa

1. **Formal**: Bahasa Indonesia formal profesional
2. **Makassar Halus**: Bahasa Makassar yang halus dan sopan
3. **Daeng Friendly**: Gaya ramah khas Makassar dengan panggilan "Daeng"
4. **Gen Z TikTok**: Bahasa Gen Z dengan emoji dan istilah viral

## 🎯 Jenis Konten yang Didukung

- Caption (Instagram/Facebook)
- Story (Instagram/WhatsApp Status)
- Post (Feed sosial media)
- Tweet (Twitter/X)
- Reel (Instagram Reels)
- Short (YouTube Shorts/TikTok)
- Bio (Profile bio)

## 🔧 Struktur Project

```
backend/
├── src/
│   ├── index.ts          # Main server & API routes
│   ├── supabase.ts       # Supabase client configuration
│   ├── kolosalai.ts      # Kolosal AI service
│   └── migration.sql     # Database migration script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🐛 Troubleshooting

### Error: "KOLOSAL_API_KEY is not defined"
- Pastikan sudah membuat file `.env`
- Pastikan `KOLOSAL_API_KEY` sudah diisi dengan API key yang valid

### Error: "Table copywriting_history does not exist"
- Jalankan migration SQL di Supabase Dashboard
- Pastikan koneksi ke Supabase berhasil

### CORS Error dari Frontend
- Pastikan URL frontend sudah ditambahkan di CORS configuration di `index.ts`
- Default: `http://localhost:3000` dan `http://localhost:5173`

## 📝 Notes

- Server menggunakan Bun runtime untuk performa optimal
- Hot reload otomatis tersedia dalam development mode
- History copywriting otomatis tersimpan ke database
- Rate limiting belum diimplementasi (tambahkan jika diperlukan)

## 🔐 Security Checklist

- [ ] Jangan commit file `.env` ke git
- [ ] Gunakan environment variables untuk semua credentials
- [ ] Implementasi rate limiting untuk production
- [ ] Tambahkan authentication untuk endpoints sensitif
- [ ] Validasi input dari user dengan lebih ketat

## 📄 License

Private - DCC Hackathon Project
