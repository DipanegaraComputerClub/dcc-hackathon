# QUICK START - Telegram Bot Setup

## 🚀 Setup dalam 5 Menit

### Step 1: Dapatkan Bot Token (2 menit)

1. Buka Telegram, cari `@BotFather`
2. Kirim: `/newbot`
3. Nama bot: `TABE AI Bot` (atau sesuai keinginan)
4. Username: `dcc_hackathon_bot` (harus unique, akhiri dengan _bot)
5. **COPY TOKEN** yang diberikan

### Step 2: Setup Backend (1 menit)

1. Buka file `backend/.env`
2. Tambahkan token:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
3. Save file

### Step 3: Run Migration (1 menit)

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file: `backend/src/migration-telegram-evaluations.sql`
3. Paste & Execute

### Step 4: Restart Backend (30 detik)

```bash
cd backend
bun run dev
```

Cek log, harus muncul:
```
🤖 Telegram Bot started...
✅ Bot commands telah di-setup
```

### Step 5: Test Bot (30 detik)

1. Buka bot di Telegram
2. Kirim: `/start`
3. Bot harus reply dengan welcome message

✅ **DONE! Bot siap digunakan**

---

## 📱 Cara Pakai (untuk Boss)

### Connect Bot (Login)

1. **Buka Dashboard Settings**
   - Login ke: https://your-app.com/settings
   - Lihat card **"Telegram Bot - Kode Bisnis"** di bagian atas
   - Klik tombol **"Copy"** untuk copy kode

2. **Login di Telegram**
   ```
   /login [paste-kode-bisnis-disini]
   ```
   
   Contoh:
   ```
   /login 550e8400-e29b-41d4-a716-446655440000
   ```

3. **Cek berhasil login**
   ```
   /menu
   ```
   
   Bot akan tampilkan menu jika sudah terkoneksi

### Lihat Laporan

```
/laporan
```

Atau laporan bulan tertentu:
```
/laporan 11 2025
```

### Kirim Evaluasi

```
/evaluasi Produk A laris! Tambah stok segera
```

---

## 🎛️ Dashboard Admin

Buka: https://your-app.com/evaluations

Di sini admin bisa:
- Lihat semua evaluasi dari boss
- Tandai sudah dibaca
- Tandai selesai
- Hapus evaluasi

---

## ❓ Troubleshooting

**Bot tidak merespon?**
- Cek token sudah benar di `.env`
- Restart backend
- Pastikan bot tidak di-block di Telegram

**Laporan kosong?**
- Pastikan sudah `/connect` dengan profile_id
- Cek ada transaksi di bulan tersebut

**Evaluasi tidak masuk?**
- Refresh dashboard admin
- Cek migration SQL sudah di-run

---

## 📚 Dokumentasi Lengkap

Lihat: `backend/TELEGRAM_BOT_GUIDE.md`

## 🔧 Support

Ada masalah? Check:
1. Backend logs
2. Telegram API status
3. Database connection

---

**Selamat! Bot Telegram TABE AI sudah siap! 🎉**
