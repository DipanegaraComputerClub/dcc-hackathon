# DAPUR UMKM API Documentation

> **AI-Powered UMKM Management System with Kolosal Llama 3.3 70B**  
> Complete REST API for managing business profiles, products, transactions, and AI-powered recommendations

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Profile Management](#profile-management)
  - [Product Management](#product-management)
  - [Transaction Management](#transaction-management)
  - [AI Recommendations](#ai-recommendations)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

Dapur UMKM API provides a complete backend solution for Indonesian UMKM (Usaha Mikro Kecil Menengah) to manage their business operations with AI-powered insights using **Kolosal Llama 3.3 70B Instruct** model.

### Features
- ✅ Business profile management
- ✅ Product/menu inventory tracking
- ✅ Financial transaction recording
- ✅ Real-time financial calculations
- ✅ AI business recommendations (pricing, inventory, strategy, marketing, finance)
- ✅ Pre-defined quick insights
- ✅ Conversation history tracking

---

## Base URL

```
http://localhost:3000/api/dapur-umkm
```

For production, replace with your deployed backend URL.

---

## Authentication

Currently, the API supports **public access** for development/testing. In production, implement authentication with:

```http
X-User-ID: <user_uuid>
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### Profile Management

#### Get Profile
```http
GET /api/dapur-umkm/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "Warung Coto Daeng",
    "category": "Kuliner / Makanan",
    "address": "Jl. A.P. Pettarani No. 102, Makassar",
    "phone": "081234567890",
    "email": "warung@example.com",
    "logo_url": "https://...",
    "description": "Warung coto khas Makassar",
    "created_at": "2025-12-06T10:00:00Z",
    "updated_at": "2025-12-06T10:00:00Z"
  }
}
```

#### Create/Update Profile
```http
POST /api/dapur-umkm/profile
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "uuid (optional, for update)",
  "business_name": "Warung Coto Daeng",
  "category": "Kuliner / Makanan",
  "address": "Jl. A.P. Pettarani No. 102, Makassar",
  "phone": "081234567890",
  "email": "warung@example.com",
  "logo_url": "https://...",
  "description": "Warung coto khas Makassar"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* profile object */ }
}
```

---

### Product Management

#### Get All Products
```http
GET /api/dapur-umkm/products?profile_id=<uuid>
```

**Query Parameters:**
- `profile_id` (optional): Filter by profile ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "name": "Coto Makassar Daging",
      "price": 25000,
      "stock": 20,
      "cost_price": 15000,
      "image_url": "https://...",
      "category": "Makanan Utama",
      "description": "Coto khas Makassar dengan daging sapi pilihan",
      "is_available": true,
      "created_at": "2025-12-06T10:00:00Z",
      "updated_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

#### Add Product
```http
POST /api/dapur-umkm/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile_id": "uuid",
  "name": "Es Pisang Ijo",
  "price": 15000,
  "stock": 50,
  "cost_price": 8000,
  "category": "Minuman",
  "description": "Es pisang ijo khas Makassar",
  "image_url": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* product object */ }
}
```

#### Update Product
```http
PUT /api/dapur-umkm/products/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Es Pisang Ijo (Updated)",
  "price": 18000,
  "stock": 45,
  "is_available": true
}
```

#### Delete Product
```http
DELETE /api/dapur-umkm/products/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Produk berhasil dihapus"
}
```

---

### Transaction Management

#### Get All Transactions
```http
GET /api/dapur-umkm/transactions?profile_id=<uuid>&type=<in|out>
```

**Query Parameters:**
- `profile_id` (optional): Filter by profile
- `type` (optional): Filter by transaction type (`in` or `out`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "transaction_date": "2025-12-06",
      "description": "Penjualan Coto (5 Porsi)",
      "amount": 125000,
      "type": "in",
      "category": "Penjualan",
      "product_id": "uuid (optional)",
      "notes": "Pelanggan tetap",
      "created_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

#### Add Transaction
```http
POST /api/dapur-umkm/transactions
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile_id": "uuid",
  "transaction_date": "2025-12-06",
  "description": "Beli Daging Sapi 2kg",
  "amount": 240000,
  "type": "out",
  "category": "Operasional",
  "notes": "Pasar Sentral"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* transaction object */ }
}
```

#### Get Financial Summary
```http
GET /api/dapur-umkm/summary?profile_id=<uuid>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 1500000,
    "totalExpense": 800000,
    "balance": 700000,
    "productCount": 12,
    "lowStockProducts": [
      {
        "id": "uuid",
        "name": "Coto Makassar",
        "stock": 5
      }
    ],
    "averageTransactionValue": 35000
  }
}
```

---

### AI Recommendations

#### Get AI Business Advice
```http
POST /api/dapur-umkm/ai-advice
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile_id": "uuid",
  "insight_type": "pricing",
  "question": "Bagaimana cara menentukan harga jual yang kompetitif tapi tetap untung?"
}
```

**Insight Types:**
- `pricing` - Analisis harga dan strategi pricing
- `inventory` - Manajemen stok dan inventory
- `strategy` - Strategi bisnis dan pertumbuhan
- `marketing` - Strategi pemasaran digital
- `finance` - Analisis kesehatan keuangan

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendation": "Berdasarkan analisis bisnis Anda...\n\n1. Harga Pokok Produksi (HPP):\n- Daging sapi: Rp 15.000\n- Bumbu & rempah: Rp 3.000\n- Gas & operasional: Rp 2.000\nTotal HPP: Rp 20.000\n\n2. Margin Keuntungan yang Sehat:\n- Target margin: 40-50%\n- Harga jual optimal: Rp 28.000 - Rp 30.000\n\n3. Strategi Pricing:\n- Weekday: Rp 28.000 (kompetitif)\n- Weekend: Rp 30.000 (premium)\n- Paket combo: Rp 45.000 (Coto + Es Pisang Ijo)\n\n4. Tips Tambahan:\n- Gunakan sistem member/loyalty untuk pelanggan tetap\n- Tawarkan promo hari tertentu\n- Monitor harga kompetitor di area sekitar\n\nDengan harga ini, Anda bisa capai profit margin 40% yang sehat untuk sustainability bisnis!",
    "insightType": "pricing",
    "context": {
      "totalIncome": 1500000,
      "totalExpense": 800000,
      "balance": 700000,
      "productCount": 12
    },
    "savedInsight": { /* insight record */ }
  }
}
```

#### Get Quick Insights (Pre-defined Questions)
```http
GET /api/dapur-umkm/quick-insights
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pricing-strategy",
      "title": "Strategi Harga Optimal",
      "question": "Bagaimana cara menentukan harga jual yang kompetitif tapi tetap untung?",
      "type": "pricing",
      "icon": "💰"
    },
    {
      "id": "increase-sales",
      "title": "Cara Ningkatin Penjualan",
      "question": "Tips praktis untuk meningkatkan penjualan dengan budget terbatas?",
      "type": "strategy",
      "icon": "📈"
    },
    {
      "id": "social-media",
      "title": "Strategi Medsos",
      "question": "Platform medsos apa yang paling efektif untuk UMKM kuliner dan cara optimasinya?",
      "type": "marketing",
      "icon": "📱"
    }
  ]
}
```

#### Get Past AI Insights History
```http
GET /api/dapur-umkm/insights-history?profile_id=<uuid>&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "insight_type": "pricing",
      "question": "Bagaimana cara menentukan harga?",
      "recommendation": "Berdasarkan analisis...",
      "context_data": { /* business metrics */ },
      "created_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

---

## Data Models

### Profile
```typescript
{
  id: string;
  user_id?: string;
  business_name: string;
  category: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  description?: string;
  established_date?: string;
  created_at: string;
  updated_at: string;
}
```

### Product
```typescript
{
  id: string;
  profile_id: string;
  user_id?: string;
  name: string;
  price: number;
  stock: number;
  cost_price?: number;
  image_url?: string;
  category?: string;
  description?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
```

### Transaction
```typescript
{
  id: string;
  profile_id: string;
  user_id?: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: "in" | "out";
  category?: string;
  product_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": { /* optional error details */ }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Examples

### Complete Workflow Example

#### 1. Create Business Profile
```bash
curl -X POST http://localhost:3000/api/dapur-umkm/profile \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Warung Coto Daeng",
    "category": "Kuliner / Makanan",
    "address": "Jl. A.P. Pettarani No. 102, Makassar",
    "phone": "081234567890"
  }'
```

#### 2. Add Products
```bash
curl -X POST http://localhost:3000/api/dapur-umkm/products \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "uuid-from-step-1",
    "name": "Coto Makassar Daging",
    "price": 25000,
    "stock": 20,
    "cost_price": 15000,
    "category": "Makanan Utama"
  }'
```

#### 3. Record Transaction
```bash
curl -X POST http://localhost:3000/api/dapur-umkm/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "uuid-from-step-1",
    "description": "Penjualan Coto (5 Porsi)",
    "amount": 125000,
    "type": "in",
    "category": "Penjualan"
  }'
```

#### 4. Get AI Pricing Advice
```bash
curl -X POST http://localhost:3000/api/dapur-umkm/ai-advice \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "uuid-from-step-1",
    "insight_type": "pricing",
    "question": "Bagaimana strategi harga yang tepat untuk coto saya?"
  }'
```

#### 5. Get Financial Summary
```bash
curl http://localhost:3000/api/dapur-umkm/summary?profile_id=uuid-from-step-1
```

---

## Setup Instructions

### 1. Database Migration
Run the migration SQL in Supabase SQL Editor:

```bash
# File: backend/src/migration-dapur-umkm.sql
```

### 2. Environment Variables
```bash
# .env
KOLOSAL_API_KEY=your_kolosal_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. Start Backend
```bash
cd backend
bun install
bun run dev
```

### 4. Test API
```bash
# Health check
curl http://localhost:3000

# Test profile endpoint
curl http://localhost:3000/api/dapur-umkm/profile
```

---

## AI Recommendation System

### How It Works

1. **User asks a business question** through pre-defined quick insights or custom query
2. **Backend collects business context** (financial metrics, products, transactions)
3. **Kolosal Llama 3.3 70B analyzes** the data with UMKM-specific prompts
4. **AI generates actionable recommendations** tailored to Indonesian UMKM context
5. **Response is saved** in database for future reference

### AI Personality

The AI consultant is designed to:
- Understand Indonesian UMKM challenges (limited capital, local market, tight competition)
- Provide practical, low-cost solutions
- Use friendly but professional Indonesian language
- Give specific, measurable, and executable advice
- Focus on digital marketing strategies (Instagram, TikTok, WhatsApp Business)

### Insight Types & Use Cases

| Type | Description | Example Question |
|------|-------------|------------------|
| **Pricing** | Price analysis, margin optimization | "Bagaimana cara hitung harga jual yang untung tapi tetap laku?" |
| **Inventory** | Stock management, inventory optimization | "Stok saya sering menumpuk, gimana cara atur stok yang efisien?" |
| **Strategy** | Business growth, competitive strategy | "Cara ningkatin omzet tanpa nambah modal besar?" |
| **Marketing** | Digital marketing, social media | "Platform medsos apa yang cocok buat jualan makanan?" |
| **Finance** | Cash flow, financial health | "Gimana cara atur keuangan biar bisnis nggak boncos?" |

---

## Frontend Integration

### React/Next.js Example

```typescript
// Fetch products
const loadProducts = async () => {
  const res = await fetch('http://localhost:3000/api/dapur-umkm/products');
  const data = await res.json();
  if (data.success) {
    setProducts(data.data);
  }
};

// Get AI advice
const getAIAdvice = async (insightType: string, question: string) => {
  const res = await fetch('http://localhost:3000/api/dapur-umkm/ai-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: profileId,
      insight_type: insightType,
      question: question
    })
  });
  
  const data = await res.json();
  if (data.success) {
    console.log(data.data.recommendation);
  }
};
```

---

## Support & Contact

For issues or questions:
- GitHub Issues: [dcc-hackathon/issues](https://github.com/DipanegaraComputerClub/dcc-hackathon)
- Email: support@dcc.id

---

**Built with ❤️ for Indonesian UMKM**  
Powered by Kolosal AI Llama 3.3 70B Instruct
