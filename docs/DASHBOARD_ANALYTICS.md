# Dashboard Analytics & Content Analysis

## Overview
Dashboard beranda UMKM dengan fitur analisis konten AI dan statistik bisnis lengkap. Dashboard menampilkan ringkasan data penting, rekomendasi konten, dan insights untuk membantu pelaku UMKM membuat keputusan bisnis yang lebih baik.

## Features

### 1. **Real-time Business Metrics** 📊
Dashboard menampilkan 4 metrik utama:

- **Total Pendapatan**: Total revenue dari semua transaksi + revenue hari ini
- **Total Produk**: Jumlah produk dengan info produk ready stok
- **Total Transaksi**: Jumlah transaksi + transaksi hari ini
- **Stok Menipis**: Alert produk dengan stok < 10 unit

### 2. **AI Content Analysis** 🧠
Fitur analisis konten menggunakan Kolosal Llama 4 Maverick untuk generate:

#### **Ide Konten** (5 rekomendasi)
- Disesuaikan dengan kategori bisnis UMKM
- Berdasarkan produk terlaris
- Mengikuti tren pasar terkini
- Cocok untuk media sosial (Instagram, TikTok, Facebook)

Contoh output:
```
1. Posting foto produk dengan customer testimonial
2. Behind the scenes proses produksi
3. Tips & trik menggunakan produk
4. Promo khusus dengan storytelling menarik
5. User generated content dari pelanggan setia
```

#### **Target Audience**
AI mengidentifikasi target audiens ideal berdasarkan:
- Kategori produk
- Harga produk
- Data transaksi
- Demografi pasar

Contoh: *"Keluarga muda usia 25-40 tahun yang mencari produk berkualitas dengan harga terjangkau"*

#### **Waktu Posting Terbaik**
Rekomendasi jam & hari posting optimal untuk engagement maksimal:
```
- Senin-Jumat: 11:00-13:00 (jam makan siang)
- Sabtu-Minggu: 18:00-20:00 (prime time)
- Kamis-Jumat: 16:00-17:00 (menjelang weekend)
```

#### **Trending Topics**
3 topik trending yang relevan dengan bisnis:
```
#ProdukLokalBerkualitas
#SustainableEcoFriendly
#BehindTheBrandStory
```

#### **Tips Conversion**
3 strategi untuk meningkatkan conversion rate:
```
💡 Gunakan call-to-action yang jelas
💡 Tambahkan urgency dengan limited stock
💡 Showcase social proof & testimonial
```

### 3. **Statistics Overview** 📈
Panel statistik menampilkan:

- **Total Revenue**: Pendapatan keseluruhan dalam Rupiah
- **Growth Rate**: Persentase pertumbuhan (perbandingan transaksi lama vs baru)
- **Top Product**: Produk dengan penjualan tertinggi

Growth calculation:
```typescript
// Membandingkan 50% transaksi terbaru vs 50% transaksi lama
const recentTransactions = transactions.slice(0, half);
const oldTransactions = transactions.slice(half);
growthRate = ((recentSum - oldSum) / oldSum) * 100;
```

### 4. **Recent Transactions** 💳
Menampilkan 5 transaksi terbaru dengan:
- Deskripsi transaksi
- Tanggal (format: DD MMM YYYY)
- Amount (warna hijau untuk income, merah untuk expense)
- Link "Lihat Semua" ke halaman management

### 5. **AI Insights History** 💡
Menampilkan 5 rekomendasi AI terbaru dengan:
- Insight type badge (pricing, inventory, strategy, marketing, finance)
- Tanggal generate
- Preview rekomendasi (2 lines max)
- Link ke management page untuk detail lengkap

### 6. **Products Overview** 📦
Daftar produk dengan monitoring stok:
- Nama produk
- Harga
- **Stok status dengan color coding:**
  - 🟢 Hijau: Stok > 10 (aman)
  - 🟡 Kuning: Stok 1-9 (⚠️ Segera restock)
  - 🔴 Merah: Stok 0 (❌ Habis)

### 7. **Quick Actions** 🚀
Shortcut ke fitur utama:
- **Kelola UMKM**: Management produk, transaksi, stok
- **Bikin Konten AI**: Copywriting & content generator
- **Lihat Laporan**: Analytics & statistik detail

## Technical Implementation

### Data Fetching
Dashboard menggunakan **parallel fetching** untuk performa optimal:

```typescript
const [profileRes, productsRes, transactionsRes, insightsRes, summaryRes] = 
  await Promise.all([
    fetch('/api/dapur-umkm/profile'),
    fetch('/api/dapur-umkm/products'),
    fetch('/api/dapur-umkm/transactions'),
    fetch('/api/dapur-umkm/insights-history'),
    fetch('/api/dapur-umkm/summary')
  ]);
```

### AI Analysis Generation

**Endpoint**: `POST /api/dapur-umkm/ai-advice`

**Request Payload**:
```json
{
  "question": "Berdasarkan data bisnis saya:\n- Bisnis: Coto Makassar Pak Amir\n- Kategori: Kuliner / Makanan\n- Total Produk: 15\n- Produk Terlaris: Coto Makassar Special\n- Total Pendapatan: Rp 25,000,000\n- Total Transaksi: 120\n\nBuatkan analisis lengkap:\n1. 5 ide konten media sosial yang cocok untuk bisnis saya\n2. Target audience yang tepat\n3. Waktu posting terbaik (jam dan hari)\n4. 3 trending topics yang relevan dengan bisnis saya\n5. Tips meningkatkan conversion rate\n\nFormat jawaban dalam bentuk terstruktur dengan poin-poin jelas.",
  "insight_type": "marketing"
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "recommendation": "AI generated structured text...",
    "insight_type": "marketing",
    "question": "...",
    "created_at": "2025-12-06T10:30:00Z"
  }
}
```

### AI Response Parsing

Dashboard menggunakan **intelligent parsing** untuk extract informasi terstruktur dari response AI:

```typescript
// Extract list items from AI response
const extractListItems = (text: string, keywords: string[]): string[] => {
  const items: string[] = [];
  const lines = text.split('\n');
  let capturing = false;
  
  for (const line of lines) {
    if (keywords.some(kw => line.toLowerCase().includes(kw))) {
      capturing = true;
      continue;
    }
    
    if (capturing && line.trim()) {
      const cleaned = line.replace(/^[\d\-\*\.\)\s]+/, '').trim();
      if (cleaned && cleaned.length > 10) {
        items.push(cleaned);
      }
      if (items.length >= 5) break;
    }
  }
  
  return items;
};

// Extract specific sections
const extractSection = (text: string, keywords: string[]): string => {
  // Find section after keywords and return first 100 chars
};
```

Keywords untuk parsing:
- **Content Ideas**: `'ide konten'`, `'content ideas'`, `'1.'`, `'2.'`, etc.
- **Target Audience**: `'target audience'`, `'audiens target'`
- **Posting Times**: `'waktu posting'`, `'posting time'`, `'waktu terbaik'`
- **Trending Topics**: `'trending'`, `'topik populer'`, `'tren'`
- **Conversion Tips**: `'tips'`, `'conversion'`, `'meningkatkan penjualan'`

### Fallback Values

Jika AI parsing gagal, dashboard akan menggunakan **default recommendations**:

```typescript
contentIdeas: [
  'Posting foto produk dengan customer testimonial',
  'Behind the scenes proses produksi',
  'Tips & trik menggunakan produk',
  'Promo khusus dengan storytelling menarik',
  'User generated content dari pelanggan setia'
],
targetAudience: 'Keluarga muda usia 25-40 tahun yang mencari produk berkualitas...',
bestPostingTimes: [
  'Senin-Jumat: 11:00-13:00 (jam makan siang)',
  'Sabtu-Minggu: 18:00-20:00 (prime time)',
  'Kamis-Jumat: 16:00-17:00 (menjelang weekend)'
],
trendingTopics: [
  'Produk lokal berkualitas',
  'Sustainable & eco-friendly',
  'Behind the brand story'
]
```

## UI Components

### Analysis Card Layout
```
┌─ Analisis Konten & Statistik AI ─────────────┐
│  🧠 [Generate Analisis Button]               │
│                                               │
│  ┌─ Statistics Overview ─────────────┐       │
│  │ Total Revenue | Growth | Top      │       │
│  │ Rp 25,000,000 | +15.3% | Product  │       │
│  └───────────────────────────────────┘       │
│                                               │
│  ┌─ Ide Konten ──┐  ┌─ Target Audience ─┐   │
│  │ 1. ...         │  │ Description...     │   │
│  │ 2. ...         │  └────────────────────┘   │
│  │ 3. ...         │                           │
│  │ 4. ...         │  ┌─ Waktu Posting ───┐   │
│  │ 5. ...         │  │ • Senin-Jumat...   │   │
│  └────────────────┘  └────────────────────┘   │
│                                               │
│  ┌─ Trending Topics ──────────────────┐       │
│  │ #ProductLokal #Sustainable #Behind │       │
│  └─────────────────────────────────────┘       │
│                                               │
│  ┌─ Tips Conversion ──────────────────┐       │
│  │ 💡 Tip 1  | 💡 Tip 2  | 💡 Tip 3  │       │
│  └─────────────────────────────────────┘       │
└───────────────────────────────────────────────┘
```

### Color Coding System

**Status Colors**:
- 🟢 Green: Positive metrics (revenue, growth, ready stock)
- 🟡 Yellow/Amber: Warning (low stock, need attention)
- 🔴 Red: Critical (out of stock, negative growth)
- 🔵 Blue: Information (total products, category)
- 🟣 Purple: Transactions count
- 🟠 Orange: Tips & recommendations

**Theme Support**:
- Light mode: `bg-white`, `text-gray-900`
- Dark mode: `dark:bg-gray-900`, `dark:text-white`
- Gradient cards: `from-red-50 to-orange-50 dark:from-red-950/30`

## User Flow

### 1. Dashboard Load
```
User opens /dashboard
  ↓
Load all data in parallel (5 API calls)
  ↓
Display metrics cards
  ↓
Show recent transactions & insights
  ↓
Show products overview
```

### 2. Generate Analysis
```
User clicks "Generate Analisis"
  ↓
Show loading state (spinner)
  ↓
POST to /api/dapur-umkm/ai-advice with business context
  ↓
Kolosal Llama 4 Maverick processes request
  ↓
Parse AI response into structured data
  ↓
Display analysis with statistics, ideas, tips
  ↓
Save to state for future reference
```

### 3. Navigation
```
Dashboard ───→ Management (kelola UMKM)
         ├───→ Copywriting (bikin konten)
         └───→ Analytics (laporan detail)
```

## Performance Optimizations

### 1. Parallel Data Fetching
Semua API calls dilakukan bersamaan menggunakan `Promise.all()` untuk mengurangi loading time.

### 2. Conditional Rendering
```typescript
{isLoading ? <LoadingSpinner /> : <DashboardContent />}
```

### 3. Data Caching
State di-maintain di component level, tidak perlu re-fetch kecuali user refresh.

### 4. Lazy Analysis
Analisis AI hanya di-generate ketika user klik button, tidak auto-load untuk menghemat API calls.

## Error Handling

### No Data Scenarios
```typescript
// No transactions
{recentTransactions.length === 0 && (
  <p>Belum ada transaksi</p>
)}

// No products
{products.length === 0 && (
  <p>Belum ada produk. Tambahkan produk pertama Anda!</p>
)}

// No AI insights
{insights.length === 0 && (
  <p>Belum ada rekomendasi AI</p>
)}
```

### API Errors
```typescript
try {
  const res = await fetch(...);
  const data = await res.json();
} catch (error) {
  console.error('Error:', error);
  // Dashboard tetap menampilkan data yang tersedia
}
```

## Best Practices for Merchants

### 1. Regular Analysis
Generate analisis konten setiap:
- Minggu baru (Monday morning)
- Setelah launching produk baru
- Sebelum campaign besar
- Ketika ingin cari ide konten

### 2. Act on Insights
Implementasi rekomendasi AI:
- Buat content calendar berdasarkan ide konten
- Post di waktu yang direkomendasikan
- Gunakan trending topics di caption
- Apply conversion tips di semua postingan

### 3. Monitor Metrics
Check dashboard metrics:
- **Daily**: Revenue hari ini, transaksi baru
- **Weekly**: Growth rate, top product
- **Monthly**: Total revenue, inventory levels

### 4. Stock Management
Follow color-coded alerts:
- 🟡 Kuning: Order restock segera
- 🔴 Merah: Update stok atau hide product

## API Dependencies

Dashboard menggunakan 5 endpoints:

1. `GET /api/dapur-umkm/profile` - Business profile
2. `GET /api/dapur-umkm/products` - Product list with stock
3. `GET /api/dapur-umkm/transactions` - Transaction history
4. `GET /api/dapur-umkm/insights-history` - AI insights history
5. `GET /api/dapur-umkm/summary` - Financial summary
6. `POST /api/dapur-umkm/ai-advice` - Generate analysis (on-demand)

## Future Enhancements

### Planned Features
- [ ] Export analysis to PDF
- [ ] Schedule auto-analysis (daily/weekly)
- [ ] Compare growth with industry average
- [ ] Competitor analysis
- [ ] Sentiment analysis from customer feedback
- [ ] Visual chart for revenue trend
- [ ] Content calendar integration
- [ ] WhatsApp/Email notification for low stock

### AI Improvements
- [ ] Multi-language support (English, Makassar dialect)
- [ ] Personalized tone based on settings
- [ ] Image generation for content ideas
- [ ] Video script suggestions
- [ ] Hashtag generator with trending analysis

## Testing Checklist

- [ ] Dashboard loads all data successfully
- [ ] Metrics cards show correct numbers
- [ ] Generate analysis button works
- [ ] AI response parsed correctly
- [ ] Fallback values work when parsing fails
- [ ] Recent transactions sorted by date
- [ ] Stock alerts display correct colors
- [ ] Quick action links navigate correctly
- [ ] Loading states display properly
- [ ] Dark mode works correctly
- [ ] Responsive design on mobile
- [ ] No console errors

## Troubleshooting

**Issue**: Dashboard shows "Loading..." forever
- **Solution**: Check backend is running on port 3000
- **Check**: All API endpoints return valid JSON

**Issue**: Analysis tidak muncul setelah klik
- **Solution**: Check browser console for errors
- **Check**: Profile data exists (required for analysis)

**Issue**: Growth rate shows +0%
- **Solution**: Add more transactions (minimum 2 required)

**Issue**: Parsing gagal, hanya fallback values
- **Solution**: Normal jika response AI tidak match keywords
- **Action**: Fallback values tetap berguna dan relevan

## Notes

- Analisis di-generate by **Kolosal Llama 4 Maverick**
- Processing time: ~3-5 seconds depending on data complexity
- Response quality depends on data completeness
- Best results with ≥5 products and ≥10 transactions
