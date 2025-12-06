# TELEGRAM BOT - TABE AI UMKM

## Overview
Bot Telegram untuk Boss UMKM yang memungkinkan:
1. **Lihat Laporan Keuangan** - Request laporan bulanan via Telegram
2. **Kirim Evaluasi** - Boss kirim feedback/evaluasi yang masuk ke dashboard admin

## Setup Bot Telegram

### 1. Buat Bot di BotFather

1. Buka Telegram, cari `@BotFather`
2. Kirim perintah `/newbot`
3. Ikuti instruksi:
   - Beri nama bot: `TABE AI UMKM Bot`
   - Beri username: `tabe_ai_umkm_bot` (atau sesuai keinginan)
4. Copy token yang diberikan (format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Setup Environment Variable

Di file `.env` backend, tambahkan:

```env
TELEGRAM_BOT_TOKEN=paste_token_dari_botfather_disini
```

### 3. Run Migration SQL

Jalankan migration untuk tabel evaluations:

```bash
# Di Supabase SQL Editor
```

Execute file: `backend/src/migration-telegram-evaluations.sql`

### 4. Restart Backend

```bash
cd backend
bun run dev
```

Lihat log:
```
🤖 Telegram Bot started...
✅ Bot commands telah di-setup
```

## Cara Menggunakan Bot

### A. Setup Awal (Boss)

1. **Buka bot di Telegram**
   - Cari username bot Anda (misal: `@tabe_ai_umkm_bot`)
   - Atau scan QR code dari BotFather

2. **Start bot**
   ```
   /start
   ```

3. **Dapatkan Profile ID**
   - Login ke dashboard web (https://your-domain.com/settings)
   - Di halaman Settings, akan ada informasi Profile ID
   - Copy Profile ID (format UUID)

4. **Connect bot dengan akun**
   ```
   /connect 550e8400-e29b-41d4-a716-446655440000
   ```
   
   ✅ Response: "Berhasil terhubung! Bisnis: Coto Makassar Pak Amir"

### B. Lihat Laporan Keuangan

**Laporan bulan ini:**
```
/laporan
```

**Laporan bulan tertentu:**
```
/laporan 11 2025
```
(Format: bulan tahun)

**Response contoh:**
```
📊 LAPORAN KEUANGAN
Coto Makassar Pak Amir

📅 Periode: November 2025

💰 RINGKASAN
━━━━━━━━━━━━━━━━━━
📈 Pemasukan: Rp 15,000,000
📉 Pengeluaran: Rp 8,500,000
━━━━━━━━━━━━━━━━━━
💵 Saldo: Rp 6,500,000

📝 Total Transaksi: 45

5 TRANSAKSI TERAKHIR:
• 28 Nov 2025 - Penjualan Coto Special
  ↗️ Rp 150,000

• 27 Nov 2025 - Beli bahan baku
  ↘️ Rp 500,000
...
```

### C. Kirim Evaluasi

Boss bisa kirim evaluasi/feedback yang akan masuk ke dashboard admin:

```
/evaluasi Produk Coto Special sangat laris! Tambah porsi besar yah
```

✅ Response: "Evaluasi berhasil dikirim! Pesan Anda telah diterima oleh admin."

**Evaluasi akan muncul di:**
- Dashboard Admin → Menu "Evaluasi"
- Status: Unread (belum dibaca)
- Bisa dibalas atau ditandai selesai oleh admin

### D. Cek Status & Bantuan

**Cek status koneksi:**
```
/status
```

**Lihat daftar perintah:**
```
/help
```

## Perintah Bot Lengkap

| Perintah | Fungsi | Contoh |
|----------|--------|--------|
| `/start` | Mulai bot & lihat welcome message | `/start` |
| `/connect [ID]` | Hubungkan bot dengan akun UMKM | `/connect 550e8400...` |
| `/status` | Cek status koneksi | `/status` |
| `/help` | Lihat daftar perintah | `/help` |
| `/laporan` | Laporan bulan ini | `/laporan` |
| `/laporan [M] [Y]` | Laporan periode tertentu | `/laporan 11 2025` |
| `/evaluasi [pesan]` | Kirim evaluasi ke admin | `/evaluasi Stok habis!` |

## Dashboard Admin - Halaman Evaluasi

### Akses
Dashboard → Sidebar → **Evaluasi**

### Fitur

1. **Daftar Evaluasi**
   - Nama pengirim (dari Telegram)
   - Pesan evaluasi
   - Waktu dikirim
   - Status (Unread/Read/Resolved)

2. **Filter & Sort**
   - Filter by status
   - Sort by date

3. **Actions**
   - Tandai sudah dibaca
   - Reply via Telegram (planned)
   - Tandai selesai
   - Delete

### Screenshot Flow

```
┌─────────────────────────────────────┐
│  TELEGRAM (Boss)                    │
├─────────────────────────────────────┤
│  /evaluasi Produk A laris manis!    │
│  Tambah stok segera                 │
│                                     │
│  ✅ Evaluasi berhasil dikirim!      │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  DASHBOARD ADMIN (Web)              │
├─────────────────────────────────────┤
│  📋 Evaluasi                         │
│                                     │
│  🔴 Belum Dibaca (1)                │
│  ├─ Pak Budi • 2 menit lalu         │
│  │  "Produk A laris manis!          │
│  │   Tambah stok segera"            │
│  │  [Tandai Baca] [Selesai]         │
└─────────────────────────────────────┘
```

## API Endpoints

### GET /api/evaluations
Ambil semua evaluasi untuk profile

**Query Parameters:**
- `profile_id` (required)
- `status` (optional): `unread`, `read`, `resolved`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "sender_name": "Pak Budi",
      "telegram_user_id": 123456789,
      "message": "Produk A laris manis!",
      "status": "unread",
      "created_at": "2025-12-06T10:30:00Z"
    }
  ]
}
```

### PATCH /api/evaluations/:id
Update status evaluasi

**Body:**
```json
{
  "status": "read" // or "resolved"
}
```

### DELETE /api/evaluations/:id
Hapus evaluasi

## Database Schema

### Table: evaluations

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES umkm_profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  telegram_user_id BIGINT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security & Best Practices

### 1. Authentication
- Bot menggunakan `/connect` dengan Profile ID
- Production: Implementasi proper auth dengan token/OTP
- Simpan mapping `telegram_user_id` ↔ `profile_id` di database

### 2. Authorization
- Verify setiap request: user sudah terkoneksi?
- Check profile_id ownership
- Rate limiting untuk prevent spam

### 3. Data Privacy
- Jangan tampilkan data sensitif di Telegram
- Laporan hanya tampilkan summary, detail di web
- Evaluasi encrypt jika berisi data sensitif

### 4. Error Handling
```typescript
try {
  await bot.sendMessage(chatId, message);
} catch (error) {
  if (error.code === 'ETELEGRAM') {
    // Bot blocked by user
    // Disable notifications for this user
  }
}
```

## Troubleshooting

### Bot tidak merespon
1. **Cek token valid**
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

2. **Cek backend log**
   ```
   🤖 Telegram Bot started...
   ```
   Kalau tidak ada → token salah atau tidak diset

3. **Restart backend**
   ```bash
   cd backend
   bun run dev
   ```

### Laporan kosong
1. Pastikan sudah `/connect` dengan profile_id yang benar
2. Cek ada transaksi di bulan tersebut
3. Verifikasi profile_id di database

### Evaluasi tidak masuk dashboard
1. Cek table `evaluations` di Supabase:
   ```sql
   SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 10;
   ```

2. Pastikan profile_id sesuai
3. Refresh dashboard admin

### Permission Error
- Pastikan migration SQL sudah di-run
- Check RLS policies di Supabase untuk table `evaluations`

## Future Enhancements

### Planned Features
- [ ] **Reply dari admin ke boss** via bot
- [ ] **Notifikasi real-time** ke boss (low stock, transaksi besar)
- [ ] **AI Insights via Telegram** - Rekomendasi bisnis
- [ ] **Voice message support** - Evaluasi via voice note
- [ ] **Photo upload** - Boss kirim foto produk untuk evaluasi
- [ ] **Multi-user support** - Multiple staff accounts
- [ ] **Custom commands** per business
- [ ] **Analytics dashboard** in Telegram

### Advanced Features
- [ ] **Inline keyboard** untuk menu interaktif
- [ ] **Callback queries** untuk quick actions
- [ ] **Bot groups** - Grup untuk tim management
- [ ] **Scheduled reports** - Auto-send laporan tiap akhir bulan
- [ ] **Alerts & notifications** - Low stock, high sales, etc.

## Testing

### Manual Test

1. **Test /start**
   ```
   /start
   ```
   Expected: Welcome message

2. **Test /connect**
   ```
   /connect <valid-profile-id>
   ```
   Expected: "Berhasil terhubung!"

3. **Test /laporan**
   ```
   /laporan
   ```
   Expected: Summary bulan ini

4. **Test /evaluasi**
   ```
   /evaluasi Test message dari boss
   ```
   Expected: "Evaluasi berhasil dikirim!"
   Check: Dashboard admin → Evaluasi → Ada entry baru

### Automated Test (Optional)

```typescript
import TelegramBot from 'node-telegram-bot-api';

const testBot = async () => {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);
  
  // Test bot info
  const me = await bot.getMe();
  console.log('Bot:', me);
  
  // Test send message
  await bot.sendMessage(CHAT_ID, 'Test message');
};
```

## Support

Untuk bantuan lebih lanjut:
- Check logs: `backend/logs/telegram-bot.log`
- Telegram Bot API Docs: https://core.telegram.org/bots/api
- node-telegram-bot-api: https://github.com/yagop/node-telegram-bot-api

## Notes

- Bot harus selalu running (background service/PM2)
- Gunakan webhook untuk production (bukan polling)
- Monitor bot uptime & errors
- Backup authorized users mapping
