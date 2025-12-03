# Integrasi Frontend dengan Backend

Panduan untuk menghubungkan frontend Next.js dengan backend API.

## 🔌 Setup Backend URL

### 1. Buat Environment Variable di Frontend

Buat file `.env.local` di folder `frontend`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Atau Hard-code di Config (Development Only)

Buat file `frontend/src/config/api.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

## 📡 Integrasi di Frontend

### Update File `frontend/src/app/(dashboard)/copywriting/page.tsx`

Ganti bagian `handleSubmit` dengan kode berikut:

```typescript
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<{
  mainText: string;
  alternatives: string[];
} | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    addToast({
      title: "Validation Error",
      description: "Mohon periksa kembali form Anda",
      variant: "error",
    });
    return;
  }

  setLoading(true);
  
  try {
    // Call backend API
    const response = await fetch('http://localhost:3000/api/copywriting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namaProduk: formData.namaProduk,
        jenisKonten: formData.jenisKonten,
        gayaBahasa: formData.gayaBahasa,
        tujuanKonten: formData.tujuanKonten,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate copywriting');
    }

    const data = await response.json();

    if (data.success) {
      setResult(data.data);
      addToast({
        title: "Success!",
        description: "Copywriting berhasil di-generate",
        variant: "success",
      });
    }
  } catch (error) {
    console.error('Error:', error);
    addToast({
      title: "Error",
      description: "Gagal generate copywriting. Coba lagi.",
      variant: "error",
    });
  } finally {
    setLoading(false);
  }
};
```

### Update Preview Section

Ganti bagian preview dengan result dari API:

```typescript
{/* Form Preview */}
<Card>
  <CardHeader>
    <CardTitle>Hasil Copywriting</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Generating copywriting...</p>
        </div>
      ) : result ? (
        <>
          {/* Main Text */}
          <div className="relative">
            <button
              onClick={() => handleCopy(result.mainText)}
              className="absolute top-0 right-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
            </button>
            <div className="pr-10">
              <h3 className="text-sm font-semibold mb-2">Text Utama:</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.mainText}
              </p>
            </div>
          </div>

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Alternatif Lainnya:</h3>
              <div className="space-y-3">
                {result.alternatives.map((alt, index) => (
                  <div key={index} className="relative bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <button
                      onClick={() => handleCopy(alt)}
                      className="absolute top-2 right-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 pr-8">
                      {alt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hasil copywriting akan muncul di sini setelah Anda klik "Kirim"
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

### Update handleCopy Function

```typescript
const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
  addToast({
    title: "Text Copied!",
    description: "Text berhasil disalin ke clipboard",
    variant: "success",
  });
};
```

## 🔐 CORS Configuration

Pastikan backend sudah setup CORS dengan benar (sudah ada di `backend/src/index.ts`):

```typescript
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

Jika frontend running di port berbeda, tambahkan ke array `origin`.

## 🚀 Testing Integrasi

### 1. Start Backend
```bash
cd backend
bun run dev
```
Server running di `http://localhost:3000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
# atau
bun run dev
```
Frontend running di `http://localhost:3000` (atau port lain jika berbeda)

### 3. Test Form
1. Buka browser: `http://localhost:3000/copywriting`
2. Isi form:
   - Nama Produk: "Coto Makassar"
   - Jenis Konten: "Caption"
   - Gaya Bahasa: "Makassar Halus"
   - Tujuan Konten: "Brand awareness"
3. Klik "Kirim"
4. Tunggu response dari AI
5. Copy text menggunakan tombol copy

## 📊 Handling Loading State

Tambahkan loading indicator yang lebih baik:

```typescript
{loading && (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="ml-3 text-gray-600">Generating copywriting...</p>
  </div>
)}
```

## 🛠️ Error Handling

Tambahkan error state untuk UX lebih baik:

```typescript
const [error, setError] = useState<string | null>(null);

// Di handleSubmit, catch block:
catch (error: any) {
  console.error('Error:', error);
  const errorMessage = error.message || "Gagal generate copywriting. Coba lagi.";
  setError(errorMessage);
  
  addToast({
    title: "Error",
    description: errorMessage,
    variant: "error",
  });
}

// Di render:
{error && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
  </div>
)}
```

## 🔄 Optional: Create API Service

Untuk code yang lebih clean, buat service file:

**`frontend/src/services/api.ts`**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CopywritingRequest {
  namaProduk: string;
  jenisKonten: string;
  gayaBahasa: string;
  tujuanKonten: string;
}

export interface CopywritingResponse {
  mainText: string;
  alternatives: string[];
}

export const apiService = {
  async generateCopywriting(data: CopywritingRequest): Promise<CopywritingResponse> {
    const response = await fetch(`${API_URL}/api/copywriting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate copywriting');
    }

    const result = await response.json();
    return result.data;
  },

  async getHistory() {
    const response = await fetch(`${API_URL}/api/copywriting/history`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    const result = await response.json();
    return result.data;
  },

  async getHistoryById(id: string) {
    const response = await fetch(`${API_URL}/api/copywriting/history/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    const result = await response.json();
    return result.data;
  },
};
```

Kemudian di component:
```typescript
import { apiService } from '@/services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const result = await apiService.generateCopywriting(formData);
    setResult(result);
    // ... success handling
  } catch (error: any) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};
```

## 📝 Checklist Integrasi

- [ ] Backend running di port 3000
- [ ] Frontend bisa hit endpoint `/api/copywriting`
- [ ] CORS tidak error
- [ ] Loading state muncul saat request
- [ ] Result muncul setelah response
- [ ] Copy to clipboard berfungsi
- [ ] Error handling bekerja dengan baik
- [ ] Form reset setelah submit (optional)
- [ ] History tersimpan di database

## 🐛 Common Issues

### 1. CORS Error
**Problem**: `Access to fetch blocked by CORS policy`
**Solution**: 
- Check CORS config di backend
- Pastikan frontend URL sudah masuk di array `origin`
- Restart backend setelah update CORS

### 2. Network Error
**Problem**: `Failed to fetch`
**Solution**:
- Pastikan backend running
- Check URL di fetch (`http://localhost:3000/api/copywriting`)
- Check network tab di browser DevTools

### 3. 404 Not Found
**Problem**: Endpoint not found
**Solution**:
- Verify endpoint URL
- Check typo di path
- Pastikan backend sudah latest code

### 4. 500 Internal Server Error
**Problem**: Server error
**Solution**:
- Check backend terminal untuk error log
- Verify KOLOSAL_API_KEY sudah diset
- Check Supabase connection
