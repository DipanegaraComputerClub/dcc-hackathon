# Dashboard Analytics API - Backend Documentation

## Overview
Backend endpoint untuk analisis konten dan statistik bisnis UMKM menggunakan AI (Kolosal Llama 4 Maverick).

## New Endpoints

### 1. Generate Dashboard Analysis
**Endpoint**: `POST /api/dapur-umkm/dashboard-analysis`

Generate analisis lengkap untuk dashboard termasuk ide konten, target audience, waktu posting, trending topics, dan conversion tips.

#### Request
```json
{
  "profile_id": "uuid-profile-id"
}
```

#### Response Success
```json
{
  "success": true,
  "data": {
    "contentIdeas": [
      "Posting foto produk dengan customer testimonial yang autentik",
      "Behind the scenes proses produksi atau persiapan produk",
      "Tips dan trik menggunakan atau memilih produk yang tepat",
      "Promo spesial dengan storytelling yang menarik perhatian",
      "User generated content dari pelanggan setia untuk social proof"
    ],
    "targetAudience": "Keluarga muda usia 25-40 tahun yang aktif di media sosial, mencari produk berkualitas dengan harga terjangkau, peduli dengan produk lokal UMKM",
    "bestPostingTimes": [
      "Senin-Jumat: 11:00-13:00 (jam istirahat makan siang, orang browsing sosmed)",
      "Sabtu-Minggu: 18:00-20:00 (prime time weekend, audience lebih santai)",
      "Kamis-Jumat: 16:00-17:00 (menjelang weekend, mood positif untuk belanja)"
    ],
    "trendingTopics": [
      "Produk lokal berkualitas dan mendukung UMKM Indonesia",
      "Sustainable dan ramah lingkungan dalam proses produksi",
      "Behind the brand story dan perjalanan bisnis yang inspiratif"
    ],
    "conversionTips": [
      "Gunakan call-to-action yang jelas dan mendesak (misal: DM sekarang, stok terbatas!)",
      "Tambahkan urgency dengan limited time offer atau limited stock alert",
      "Showcase social proof dengan repost testimoni pelanggan yang puas"
    ],
    "statistics": {
      "totalRevenue": 25000000,
      "growthRate": "+15.3%",
      "topProduct": "Coto Makassar Special",
      "totalProducts": 15,
      "totalTransactions": 120,
      "lowStockCount": 3
    },
    "rawAnalysis": "Full AI response text...",
    "generatedAt": "2025-12-06T10:30:00.000Z"
  }
}
```

#### Response Error
```json
{
  "success": false,
  "message": "Gagal generate analisis dashboard",
  "error": "Error details..."
}
```

#### Business Logic
1. Fetch profile data from `umkm_profiles`
2. Fetch all products, transactions, and calculate metrics
3. Build comprehensive prompt with business context:
   - Business name, category, description
   - Revenue, transactions, growth rate
   - Product count, top product, low stock items
4. Call Kolosal Llama 4 Maverick with structured prompt
5. Parse AI response into structured format:
   - **Content Ideas**: Extract 5 numbered items
   - **Target Audience**: Extract demographic & psychographic data
   - **Posting Times**: Extract 3 time recommendations with reasons
   - **Trending Topics**: Extract 3 relevant topics
   - **Conversion Tips**: Extract 3 actionable tips
6. Add statistics from database
7. Save analysis to `umkm_ai_insights` table
8. Return structured JSON

#### AI Prompt Structure
```
Sebagai konsultan bisnis UMKM, buatkan analisis lengkap:

PROFIL BISNIS:
- Nama: [business_name]
- Kategori: [category]
- Deskripsi: [description]
- Lokasi: [address]

DATA PERFORMA:
- Total Pendapatan: Rp [totalRevenue]
- Total Transaksi: [count]
- Growth Rate: [percentage]
- Total Produk: [count]
- Produk Terlaris: [name]
- Stok Rendah: [count] produk

YANG PERLU DIANALISIS:
1. 5 IDE KONTEN MEDIA SOSIAL spesifik untuk bisnis ini
2. TARGET AUDIENCE yang tepat (demografi + psikografi)
3. 3 WAKTU POSTING TERBAIK untuk media sosial
4. 3 TRENDING TOPICS yang relevan
5. 3 TIPS CONVERSION untuk meningkatkan penjualan

Format: terstruktur dengan numbering dan bullet points
```

#### Parsing Algorithm
The backend uses intelligent parsing to extract structured data:

```typescript
function parseAIAnalysis(text: string) {
  // Detect sections by keywords
  const sections = [
    'ide konten', 'content ideas',
    'target audience', 'audiens',
    'waktu posting', 'posting time',
    'trending', 'topik populer',
    'conversion', 'tips'
  ];
  
  // Extract numbered/bulleted items
  // Clean up formatting (numbers, bullets, etc.)
  // Apply fallback values if parsing fails
}
```

**Fallback Strategy**: If AI parsing fails, backend provides default recommendations that are still useful and actionable.

---

### 2. Get Dashboard Overview
**Endpoint**: `GET /api/dapur-umkm/dashboard-overview?profile_id={uuid}`

Get all dashboard data in a single API call (alternative to multiple parallel fetches).

#### Query Parameters
- `profile_id` (required): UUID of UMKM profile

#### Response
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "business_name": "Coto Makassar Pak Amir",
      "category": "Kuliner / Makanan",
      "description": "...",
      "logo_url": "...",
      "address": "..."
    },
    "products": [
      {
        "id": "uuid",
        "name": "Coto Makassar Special",
        "price": 35000,
        "stock": 50,
        "sold": 120
      }
    ],
    "transactions": [
      {
        "id": "uuid",
        "amount": 350000,
        "description": "Penjualan 10 porsi",
        "transaction_date": "2025-12-06T08:00:00Z"
      }
    ],
    "insights": [
      {
        "id": "uuid",
        "insight_type": "marketing",
        "recommendation": "...",
        "created_at": "2025-12-06T09:00:00Z"
      }
    ],
    "summary": {
      "total_revenue": 25000000,
      "total_expense": 15000000,
      "balance": 10000000
    },
    "metrics": {
      "totalIncome": 25000000,
      "totalExpense": 15000000,
      "balance": 10000000,
      "productCount": 15,
      "lowStockProducts": [...]
    }
  }
}
```

#### Business Logic
1. Fetch all data in parallel using `Promise.all()`:
   - Profile from `umkm_profiles`
   - Products from `umkm_products`
   - Recent 50 transactions from `umkm_transactions`
   - Recent 10 insights from `umkm_ai_insights`
   - Financial summary from `umkm_financial_summary`
2. Calculate business metrics
3. Return combined data object

**Performance**: ~300-500ms for complete dashboard data (vs 1000-1500ms for sequential fetches)

---

## Database Schema

### New Insight Type
Dashboard analysis is saved with `insight_type = 'dashboard_analysis'`

```sql
INSERT INTO umkm_ai_insights (
  profile_id,
  insight_type,
  question,
  recommendation,
  context_data
) VALUES (
  'uuid',
  'dashboard_analysis',
  'Dashboard Content & Statistics Analysis',
  'AI generated analysis...',
  jsonb_object
);
```

---

## Integration Example

### Frontend Usage (Next.js/React)

```typescript
// Generate analysis on button click
const handleGenerateAnalysis = async () => {
  try {
    setIsLoading(true);
    
    const res = await fetch('http://localhost:3000/api/dapur-umkm/dashboard-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId })
    });
    
    const data = await res.json();
    
    if (data.success) {
      setAnalysis(data.data);
      // Display content ideas, audience, etc.
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

// Alternative: Get all data at once
const loadDashboard = async () => {
  const res = await fetch(`http://localhost:3000/api/dapur-umkm/dashboard-overview?profile_id=${profileId}`);
  const data = await res.json();
  
  if (data.success) {
    setProfile(data.data.profile);
    setProducts(data.data.products);
    setTransactions(data.data.transactions);
    // etc.
  }
};
```

---

## AI Model Configuration

**Model**: Kolosal Llama 4 Maverick
**Temperature**: 0.8 (creative but controlled)
**Max Tokens**: 2000
**Top P**: 0.95

### System Prompt
```
Kamu adalah konsultan bisnis UMKM profesional dari Indonesia dengan keahlian:
- Strategi pemasaran untuk UMKM lokal
- Analisis harga dan margin keuntungan
- Manajemen stok dan inventory
- Pengelolaan keuangan usaha kecil
- Digital marketing untuk UMKM

Gaya komunikasi:
- Ramah, praktis, dan actionable
- Gunakan bahasa Indonesia yang santai tapi profesional
- Berikan contoh nyata dan tips konkret
- Fokus pada solusi sederhana yang bisa langsung diterapkan
```

---

## Error Handling

### Common Errors

**Missing profile_id**
```json
{
  "success": false,
  "message": "profile_id diperlukan"
}
```
Status: 400

**Profile not found**
```json
{
  "success": false,
  "message": "Profil tidak ditemukan"
}
```
Status: 404

**AI API Error**
```json
{
  "success": false,
  "message": "Gagal generate analisis dashboard",
  "error": "Kolosal API timeout"
}
```
Status: 500

---

## Performance Optimization

### Caching Strategy
- Cache analysis results for 24 hours
- Invalidate cache on profile/product/transaction changes
- Store in Redis or in-memory cache

### Request Throttling
- Limit: 5 analysis requests per profile per hour
- Prevent abuse and API cost overflow

### Fallback Mechanism
- If AI fails, return pre-computed default recommendations
- Still provide value even when AI is down

---

## Testing

### Manual Test
```bash
# Generate analysis
curl -X POST http://localhost:3000/api/dapur-umkm/dashboard-analysis \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "your-profile-uuid"}'

# Get dashboard overview
curl http://localhost:3000/api/dapur-umkm/dashboard-overview?profile_id=your-profile-uuid
```

### Expected Response Time
- Dashboard analysis: 3-5 seconds (AI processing)
- Dashboard overview: 300-500ms (database queries)

---

## Cost Considerations

### Kolosal API Pricing
- ~Rp 50-100 per analysis request
- 2000 tokens max per request
- Recommend caching to reduce costs

### Database Queries
- Dashboard overview: 5 queries in parallel
- Minimal impact with proper indexing
- Consider materialized views for large datasets

---

## Future Enhancements

- [ ] Add sentiment analysis from customer feedback
- [ ] Competitor analysis based on category
- [ ] Visual chart generation (revenue trends)
- [ ] Export analysis to PDF
- [ ] Schedule auto-analysis (daily/weekly)
- [ ] Multi-language support (English, local dialects)
- [ ] Image/video content suggestions with AI
- [ ] Hashtag generator with trending analysis

---

## Support

For issues or questions:
- Backend: Check logs in `backend/src/dapur-umkm.ts`
- Frontend: Check console for API errors
- Database: Verify `umkm_ai_insights` table structure

## Related Documentation
- [Dashboard Analytics Frontend](../docs/DASHBOARD_ANALYTICS.md)
- [Dapur UMKM API](./DAPUR_UMKM_API.md)
- [Kolosal AI Setup](./KOLOSAL_AI_SETUP.md)
